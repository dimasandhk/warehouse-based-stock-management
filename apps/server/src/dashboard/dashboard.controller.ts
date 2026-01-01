import type { Request, Response } from "express";
import { db, sql, desc, gte, lt } from "@warehouse-based-stock-management-oppo-technical-test/db";
import { 
  warehouses, 
  spareparts, 
  warehouseStocks, 
  stockTransactions,
  warehouseStockDetailsView,
  transactionDetailsView
} from "@warehouse-based-stock-management-oppo-technical-test/db/schema/index";

// GET /api/dashboard/summary
export const getDashboardSummary = async (_req: Request, res: Response) => {
  try {
    // Get total stock units
    const totalStockResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${warehouseStocks.currentStock}), 0)` })
      .from(warehouseStocks);

    // Get warehouse count
    const warehouseCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(warehouses);

    // Get sparepart count
    const sparepartCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(spareparts);

    // Get low stock count (items with stock < 10)
    const lowStockCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(warehouseStocks)
      .where(lt(warehouseStocks.currentStock, 10));

    // Get today's transactions count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTransactionsResult = await db
      .select({ 
        type: stockTransactions.type,
        count: sql<number>`COUNT(*)`
      })
      .from(stockTransactions)
      .where(gte(stockTransactions.createdAt, today.toISOString()))
      .groupBy(stockTransactions.type);

    const todayIn = todayTransactionsResult.find(t => t.type === 'IN')?.count || 0;
    const todayOut = todayTransactionsResult.find(t => t.type === 'OUT')?.count || 0;

    return res.status(200).json({
      success: true,
      data: {
        totalStockUnits: Number(totalStockResult[0]?.total || 0),
        totalWarehouses: Number(warehouseCountResult[0]?.count || 0),
        totalSpareparts: Number(sparepartCountResult[0]?.count || 0),
        lowStockCount: Number(lowStockCountResult[0]?.count || 0),
        todayTransactions: {
          in: Number(todayIn),
          out: Number(todayOut)
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", success: false });
  }
};

// GET /api/dashboard/low-stock
export const getLowStockAlerts = async (req: Request, res: Response) => {
  try {
    const { threshold = 10, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const result = await db
      .select()
      .from(warehouseStockDetailsView)
      .where(lt(warehouseStockDetailsView.currentStock, Number(threshold)))
      .limit(Number(limit))
      .offset(offset);

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(warehouseStocks)
      .where(lt(warehouseStocks.currentStock, Number(threshold)));

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

// GET /api/dashboard/recent-transactions
export const getRecentTransactions = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const result = await db
      .select()
      .from(transactionDetailsView)
      .orderBy(desc(transactionDetailsView.createdAt))
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Internal server error", success: false });
  }
};
