import type { Request, Response } from "express";
import { db, sql, eq, ilike, or } from "@warehouse-based-stock-management-oppo-technical-test/db";
import { 
  warehouses, 
  spareparts, 
  warehouseStocks,
  warehouseStockDetailsView
} from "@warehouse-based-stock-management-oppo-technical-test/db/schema/index";

// GET /api/warehouse-stocks
export const getAllWarehouseStocks = async (req: Request, res: Response) => {
  try {
    const { warehouseId, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions = [];
    if (warehouseId && typeof warehouseId === 'string') {
      conditions.push(eq(warehouseStockDetailsView.warehouseId, warehouseId));
    }

    const result = await db
      .select()
      .from(warehouseStockDetailsView)
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .limit(Number(limit))
      .offset(offset);

    // total count
    const countConditions = [];
    if (warehouseId && typeof warehouseId === 'string') {
      countConditions.push(eq(warehouseStocks.warehouseId, warehouseId));
    }
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(warehouseStocks)
      .where(countConditions.length > 0 ? countConditions[0] : undefined);

    return res.status(200).json({
      success: true,
      result,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(countResult[0]?.count || 0)
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", success: false });
  }
};

// GET /api/warehouse-stocks/by-warehouse/:warehouseId
export const getStocksByWarehouse = async (req: Request, res: Response) => {
  try {
    const { warehouseId } = req.params;
    
    if (!warehouseId) {
      return res.status(400).json({ error: "Warehouse ID is required", success: false });
    }
    
    const { page = 1, limit = 10, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions = [eq(warehouseStockDetailsView.warehouseId, warehouseId)];
    
    if (search && typeof search === 'string') {
      conditions.push(
        or(
          ilike(warehouseStockDetailsView.sparepartName, `%${search}%`),
          ilike(warehouseStockDetailsView.sparepartSku, `%${search}%`)
        )!
      );
    }

    const result = await db
      .select()
      .from(warehouseStockDetailsView)
      .where(conditions.length > 1 ? sql`${conditions[0]} AND ${conditions[1]}` : conditions[0])
      .limit(Number(limit))
      .offset(offset);

    // total count for this warehouse
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(warehouseStocks)
      .where(eq(warehouseStocks.warehouseId, warehouseId));

    return res.status(200).json({
      success: true,
      result,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(countResult[0]?.count || 0)
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", success: false });
  }
};

// GET /api/warehouse-stocks/warehouse-summary/:warehouseId
export const getWarehouseSummary = async (req: Request, res: Response) => {
  try {
    const { warehouseId } = req.params;
    
    if (!warehouseId) {
      return res.status(400).json({ error: "Warehouse ID is required", success: false });
    }

    // warehouse info
    const warehouseResult = await db
      .select()
      .from(warehouses)
      .where(eq(warehouses.id, warehouseId))
      .limit(1);

    if (warehouseResult.length === 0) {
      return res.status(404).json({ error: "Warehouse not found", success: false });
    }

    const warehouse = warehouseResult[0]!;

    // stock statistics
    const statsResult = await db
      .select({
        totalSparepartTypes: sql<number>`COUNT(*)`,
        totalStockUnits: sql<number>`COALESCE(SUM(${warehouseStocks.currentStock}), 0)`,
        lowStockItems: sql<number>`COUNT(*) FILTER (WHERE ${warehouseStocks.currentStock} < 10)`,
        lastUpdated: sql<string>`MAX(${warehouseStocks.updatedAt})`
      })
      .from(warehouseStocks)
      .where(eq(warehouseStocks.warehouseId, warehouseId));

    return res.status(200).json({
      success: true,
      data: {
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        warehouseCode: warehouse.code,
        totalSparepartTypes: Number(statsResult[0]?.totalSparepartTypes || 0),
        totalStockUnits: Number(statsResult[0]?.totalStockUnits || 0),
        lowStockItems: Number(statsResult[0]?.lowStockItems || 0),
        lastUpdated: statsResult[0]?.lastUpdated || null
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", success: false });
  }
};

// GET /api/warehouse-stocks/by-sparepart/:sparepartId
export const getStocksBySparepart = async (req: Request, res: Response) => {
  try {
    const { sparepartId } = req.params;
    
    if (!sparepartId) {
      return res.status(400).json({ error: "Sparepart ID is required", success: false });
    }
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // sparepart info
    const sparepartResult = await db
      .select()
      .from(spareparts)
      .where(eq(spareparts.id, sparepartId))
      .limit(1);

    if (sparepartResult.length === 0) {
      return res.status(404).json({ error: "Sparepart not found", success: false });
    }

    const sparepart = sparepartResult[0]!;

    // total stock across all warehouses
    const totalStockResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${warehouseStocks.currentStock}), 0)` })
      .from(warehouseStocks)
      .where(eq(warehouseStocks.sparepartId, sparepartId));

    // distribution across warehouses
    const distribution = await db
      .select()
      .from(warehouseStockDetailsView)
      .where(eq(warehouseStockDetailsView.sparepartId, sparepartId))
      .limit(Number(limit))
      .offset(offset);

    return res.status(200).json({
      success: true,
      sparepart: {
        id: sparepart.id,
        name: sparepart.name,
        sku: sparepart.sku
      },
      totalStock: Number(totalStockResult[0]?.total || 0),
      distribution
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", success: false });
  }
};
