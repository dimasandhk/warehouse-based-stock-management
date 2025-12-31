CREATE TYPE "public"."stock_transaction_types" AS ENUM('IN', 'OUT');--> statement-breakpoint
CREATE TABLE "spareparts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"sku" varchar NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_transactions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"type" "stock_transaction_types" NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"sparepart_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouse_stocks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"current_stock" integer NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"sparepart_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"code" varchar NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "spareparts_pkey" ON "spareparts" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "spareparts_sku_key" ON "spareparts" USING btree ("sku");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_transactions_pkey" ON "stock_transactions" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_warehouse_stock_pair" ON "warehouse_stocks" USING btree ("warehouse_id","sparepart_id");--> statement-breakpoint
CREATE UNIQUE INDEX "warehouse_stocks_pkey" ON "warehouse_stocks" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "warehouses_pkey" ON "warehouses" USING btree ("id");