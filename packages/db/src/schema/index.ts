import { pgTable, uniqueIndex, pgEnum, uuid, varchar, timestamp, integer } from "drizzle-orm/pg-core"

import { relations } from "drizzle-orm/relations";

export const stockTransactionTypes = pgEnum("stock_transaction_types", ['IN', 'OUT']);

export const spareparts = pgTable("spareparts", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	name: varchar("name").notNull(),
	sku: varchar("sku").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull().defaultNow(),
},
(table) => {
	return {
		pkey: uniqueIndex("spareparts_pkey").on(table.id),
		skuKey: uniqueIndex("spareparts_sku_key").on(table.sku),
	}
});

export const stockTransactions = pgTable("stock_transactions", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	type: stockTransactionTypes("type").notNull(),
	quantity: integer("quantity").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull().defaultNow(),
	warehouseId: uuid("warehouse_id").notNull(),
	sparepartId: uuid("sparepart_id").notNull(),
},
(table) => {
	return {
		pkey: uniqueIndex("stock_transactions_pkey").on(table.id),
	}
});

export const warehouseStocks = pgTable("warehouse_stocks", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	currentStock: integer("current_stock").notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull().defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull().defaultNow(),
	warehouseId: uuid("warehouse_id").notNull(),
	sparepartId: uuid("sparepart_id").notNull(),
},
(table) => {
	return {
		uniqueWarehouseStockPair: uniqueIndex("unique_warehouse_stock_pair").on(table.warehouseId, table.sparepartId),
		pkey: uniqueIndex("warehouse_stocks_pkey").on(table.id),
	}
});

export const warehouses = pgTable("warehouses", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	name: varchar("name").notNull(),
	code: varchar("code").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull().defaultNow(),
},
(table) => {
	return {
		codeKey: uniqueIndex("warehouses_code_key").on(table.code),
		pkey: uniqueIndex("warehouses_pkey").on(table.id),
	}
});export const stockTransactionsRelations = relations(stockTransactions, ({one}) => ({
	sparepart: one(spareparts, {
		fields: [stockTransactions.sparepartId],
		references: [spareparts.id]
	}),
	warehouse: one(warehouses, {
		fields: [stockTransactions.warehouseId],
		references: [warehouses.id]
	}),
}));

export const sparepartsRelations = relations(spareparts, ({many}) => ({
	stockTransactions: many(stockTransactions),
	warehouseStocks: many(warehouseStocks),
}));

export const warehousesRelations = relations(warehouses, ({many}) => ({
	stockTransactions: many(stockTransactions),
	warehouseStocks: many(warehouseStocks),
}));

export const warehouseStocksRelations = relations(warehouseStocks, ({one}) => ({
	sparepart: one(spareparts, {
		fields: [warehouseStocks.sparepartId],
		references: [spareparts.id]
	}),
	warehouse: one(warehouses, {
		fields: [warehouseStocks.warehouseId],
		references: [warehouses.id]
	}),
}));