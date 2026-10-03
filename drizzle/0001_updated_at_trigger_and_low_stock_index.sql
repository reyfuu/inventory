-- Keep products.updated_at correct regardless of which client writes the row.
-- Previously this was managed by GORM; moving it into the database means it
-- stays true for migrations, manual SQL, and any future client.
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE OR REPLACE TRIGGER products_set_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
-- Partial index for the dashboard's most frequent query (low stock alerts).
-- Drizzle cannot express a WHERE clause that compares two columns, so this
-- is applied as a custom migration.
CREATE INDEX IF NOT EXISTS idx_products_low_stock
  ON products (quantity)
  WHERE quantity <= low_stock_threshold;
