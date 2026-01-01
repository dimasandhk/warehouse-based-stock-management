import { pgTable, uniqueIndex, pgEnum, uuid, varchar, timestamp, integer, pgView } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
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
		// pkey: uniqueIndex("spareparts_pkey").on(table.id),
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
		// pkey: uniqueIndex("warehouse_stocks_pkey").on(table.id),
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
		// pkey: uniqueIndex("warehouses_pkey").on(table.id),
	}
});

export const stockTransactionsRelations = relations(stockTransactions, ({one}) => ({
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

// ============================================
// VIEWS
// ============================================

// stock with warehouse and sparepart details
export const warehouseStockDetailsView = pgView("warehouse_stock_details_view", {
	id: uuid("id"),
	warehouseId: uuid("warehouse_id"),
	warehouseName: varchar("warehouse_name"),
	warehouseCode: varchar("warehouse_code"),
	sparepartId: uuid("sparepart_id"),
	sparepartName: varchar("sparepart_name"),
	sparepartSku: varchar("sparepart_sku"),
	currentStock: integer("current_stock"),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }),
}).as(sql`
	SELECT 
		ws.id,
		ws.warehouse_id,
		w.name AS warehouse_name,
		w.code AS warehouse_code,
		ws.sparepart_id,
		s.name AS sparepart_name,
		s.sku AS sparepart_sku,
		ws.current_stock,
		ws.updated_at,
		ws.created_at
	FROM warehouse_stocks ws
	INNER JOIN warehouses w ON ws.warehouse_id = w.id
	INNER JOIN spareparts s ON ws.sparepart_id = s.id
`);

// transaction history with warehouse and sparepart details
export const transactionDetailsView = pgView("transaction_details_view", {
	id: uuid("id"),
	type: varchar("type"),
	quantity: integer("quantity"),
	warehouseId: uuid("warehouse_id"),
	warehouseName: varchar("warehouse_name"),
	warehouseCode: varchar("warehouse_code"),
	sparepartId: uuid("sparepart_id"),
	sparepartName: varchar("sparepart_name"),
	sparepartSku: varchar("sparepart_sku"),
	createdAt: timestamp("created_at", { mode: 'string' }),
}).as(sql`
	SELECT 
		st.id,
		st.type,
		st.quantity,
		st.warehouse_id,
		w.name AS warehouse_name,
		w.code AS warehouse_code,
		st.sparepart_id,
		s.name AS sparepart_name,
		s.sku AS sparepart_sku,
		st.created_at
	FROM stock_transactions st
	INNER JOIN warehouses w ON st.warehouse_id = w.id
	INNER JOIN spareparts s ON st.sparepart_id = s.id
`);

// low stock alerts (stocks below threshold - default checking for stocks < 10)
export const lowStockAlertView = pgView("low_stock_alert_view", {
	id: uuid("id"),
	warehouseId: uuid("warehouse_id"),
	warehouseName: varchar("warehouse_name"),
	warehouseCode: varchar("warehouse_code"),
	sparepartId: uuid("sparepart_id"),
	sparepartName: varchar("sparepart_name"),
	sparepartSku: varchar("sparepart_sku"),
	currentStock: integer("current_stock"),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}).as(sql`
	SELECT 
		ws.id,
		ws.warehouse_id,
		w.name AS warehouse_name,
		w.code AS warehouse_code,
		ws.sparepart_id,
		s.name AS sparepart_name,
		s.sku AS sparepart_sku,
		ws.current_stock,
		ws.updated_at
	FROM warehouse_stocks ws
	INNER JOIN warehouses w ON ws.warehouse_id = w.id
	INNER JOIN spareparts s ON ws.sparepart_id = s.id
	WHERE ws.current_stock < 10
`);