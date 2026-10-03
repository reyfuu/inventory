import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth";
import { db, users } from "@/lib/db";
import { registerSchema } from "@/lib/validators";

export const runtime = "nodejs";

/**
 * The app is served on a public URL and every account has identical rights
 * (there are no roles yet), so an open signup form would let anyone read and
 * modify the whole inventory. Registration is therefore gated on SIGNUP_CODE
 * and is closed entirely when that variable is absent.
 */
export async function POST(request: Request) {
  const expectedCode = process.env.SIGNUP_CODE;
  if (!expectedCode) {
    return NextResponse.json(
      { error: "Pendaftaran sedang ditutup. Hubungi administrator." },
      { status: 503 },
    );
  }

  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = String(issue?.path?.[0] ?? "");
    const message =
      field === "password"
        ? "Password minimal 8 karakter."
        : field === "email"
          ? "Format email tidak valid."
          : field === "name"
            ? "Nama wajib diisi."
            : "Data pendaftaran tidak valid.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { name, email, password, signupCode } = parsed.data;

  if (signupCode !== expectedCode) {
    return NextResponse.json({ error: "Kode pendaftaran salah." }, { status: 403 });
  }

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [created] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning({ id: users.id, email: users.email, name: users.name });

  const token = await signSession({ userId: created.id, email: created.email, name: created.name });

  const response = NextResponse.json({ user: created }, { status: 201 });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}
