CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku" varchar(64) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"category_id" uuid NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"price_buy" numeric(12, 2) DEFAULT '0' NOT NULL,
	"price_sell" numeric(12, 2) DEFAULT '0' NOT NULL,
	"low_stock_threshold" integer DEFAULT 5 NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku"),
	CONSTRAINT "products_quantity_non_negative" CHECK ("products"."quantity" >= 0),
	CONSTRAINT "products_threshold_non_negative" CHECK ("products"."low_stock_threshold" >= 0),
	CONSTRAINT "products_price_buy_non_negative" CHECK ("products"."price_buy" >= 0),
	CONSTRAINT "products_price_sell_non_negative" CHECK ("products"."price_sell" >= 0)
);
--> statement-breakpoint
CREATE TABLE "stock_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"type" varchar(3) NOT NULL,
	"quantity" integer NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_tx_type_valid" CHECK ("stock_transactions"."type" IN ('IN','OUT')),
	CONSTRAINT "stock_tx_quantity_positive" CHECK ("stock_transactions"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_products_category_id" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_stock_tx_product_id" ON "stock_transactions" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_stock_tx_created_at" ON "stock_transactions" USING btree ("created_at" DESC NULLS LAST);