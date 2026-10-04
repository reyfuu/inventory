import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

import { currentSession } from "@/lib/auth";
import { categories, db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const session = await currentSession();
  if (!session) {
    return NextResponse.json({ error: "Sesi tidak ditemukan. Silakan login kembali." }, { status: 401 });
  }

  const rows = await db.select().from(categories).orderBy(asc(categories.name));
  return NextResponse.json(rows.map(({ id, name, description, createdAt }) => ({
    id,
    name,
    description,
    created_at: createdAt,
  })));
}

export async function POST(request: Request) {
  const session = await currentSession();
  if (!session) {
    return NextResponse.json({ error: "Sesi tidak ditemukan. Silakan login kembali." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Nama kategori wajib diisi." }, { status: 400 });
  }

  try {
    const [created] = await db.insert(categories).values({ name, description }).returning();
    return NextResponse.json({
      id: created.id,
      name: created.name,
      description: created.description,
      created_at: created.createdAt,
    }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "Nama kategori sudah digunakan." }, { status: 409 });
    }
    throw error;
  }
}
