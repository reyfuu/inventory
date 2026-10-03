import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ── users ───────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── categories ──────────────────────────────────────────
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── products ────────────────────────────────────────────
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sku: varchar("sku", { length: 64 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull().default(""),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull().default(0),
    priceBuy: numeric("price_buy", { precision: 12, scale: 2 }).notNull().default("0"),
    priceSell: numeric("price_sell", { precision: 12, scale: 2 }).notNull().default("0"),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
    imageUrl: text("image_url").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_products_category_id").on(t.categoryId),
    check("products_quantity_non_negative", sql`${t.quantity} >= 0`),
    check("products_threshold_non_negative", sql`${t.lowStockThreshold} >= 0`),
    check("products_price_buy_non_negative", sql`${t.priceBuy} >= 0`),
    check("products_price_sell_non_negative", sql`${t.priceSell} >= 0`),
  ],
);

// ── stock_transactions ──────────────────────────────────
export const stockTransactions = pgTable(
  "stock_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 3 }).notNull(),
    quantity: integer("quantity").notNull(),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_stock_tx_product_id").on(t.productId),
    index("idx_stock_tx_created_at").on(t.createdAt.desc()),
    check("stock_tx_type_valid", sql`${t.type} IN ('IN','OUT')`),
    check("stock_tx_quantity_positive", sql`${t.quantity} > 0`),
  ],
);

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type StockTransaction = typeof stockTransactions.$inferSelect;
