import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Application cannot start.");
}

// Pooled connection string — every request path uses this.
// Migrations use DATABASE_URL_UNPOOLED instead (see drizzle.config.ts).
export const db = drizzle(neon(connectionString), { schema });

export * from "./schema";
