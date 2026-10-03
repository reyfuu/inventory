import { config as loadEnv } from "dotenv";

// Neon CLI writes DATABASE_URL / DATABASE_URL_UNPOOLED into .env.local
loadEnv({ path: ".env.local" });
loadEnv();
import { defineConfig } from "drizzle-kit";

// DDL needs a stable session, so migrations use the direct (unpooled) URL.
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL_UNPOOLED (or DATABASE_URL) is not set.");
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
