import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth";
import { db, users } from "@/lib/db";
import { loginSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const found = await db.select().from(users).where(eq(users.email, email)).limit(1);

  // Same message whether the email is unknown or the password is wrong, so the
  // endpoint cannot be used to discover which emails are registered.
  const invalid = NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
  if (found.length === 0) return invalid;

  const user = found[0];
  if (!(await bcrypt.compare(password, user.passwordHash))) return invalid;

  const token = await signSession({ userId: user.id, email: user.email, name: user.name });

  const response = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}
