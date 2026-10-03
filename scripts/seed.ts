import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";

import { categories, users } from "../src/lib/db/schema";

const DEFAULT_CATEGORIES = [
  { name: "Elektronik", description: "Barang elektronik seperti HP, laptop, dan aksesoris" },
  { name: "Pakaian", description: "Pakaian pria, wanita, dan anak-anak" },
  { name: "Makanan & Minuman", description: "Bahan makanan pokok, snack, dan minuman ringan" },
  { name: "Peralatan Rumah Tangga", description: "Peralatan dapur, dekorasi, dan perlengkapan rumah" },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");

  // Admin credentials must come from the environment. The previous Go seeder
  // hardcoded admin@example.com / password123, which must never reach
  // production (TRD finding S-5).
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set before seeding. Refusing to create an admin with a default password.",
    );
  }
  if (adminPassword.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  const db = drizzle(neon(url));

  // ── categories (idempotent) ──
  let created = 0;
  for (const c of DEFAULT_CATEGORIES) {
    const res = await db.insert(categories).values(c).onConflictDoNothing().returning();
    created += res.length;
  }
  console.log(`categories: ${created} created, ${DEFAULT_CATEGORIES.length - created} already present`);

  // ── admin user (idempotent) ──
  const existing = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
  if (existing.length > 0) {
    console.log(`admin: ${adminEmail} already exists, left untouched`);
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await db.insert(users).values({
      email: adminEmail,
      name: process.env.ADMIN_NAME ?? "Admin",
      passwordHash,
    });
    console.log(`admin: created ${adminEmail}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
