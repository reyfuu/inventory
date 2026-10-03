import { NextResponse } from "next/server";

import { currentSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await currentSession();
  if (!session) {
    return NextResponse.json({ error: "Sesi tidak ditemukan. Silakan login kembali." }, { status: 401 });
  }
  return NextResponse.json({ id: session.userId, email: session.email, name: session.name });
}
