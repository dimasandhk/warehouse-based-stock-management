import type { Request, Response } from "express";
import { db, eq, and, sql, desc, gte, lte } from "@warehouse-based-stock-management-oppo-technical-test/db";
import { 
  warehouses, 
  spareparts, 
  warehouseStocks, 
  stockTransactions,
  transactionDetailsView
} from "@warehouse-based-stock-management-oppo-technical-test/db/schema/index";

export const handleStockIn = async (req: Request, res: Response) => {
  try {
    const { warehouseId, sparepartId, quantity } = req.body;

    if (!warehouseId || !sparepartId || quantity === undefined) {
      return res.status(400).json({ 
        error: "warehouseId, sparepartId, and quantity are required",
        success: false 
      });
    }

    // edgecase quantity > 0
    if (quantity <= 0) {
      return res.status(400).json({ 
        error: "Quantity must be greater than 0",
        success: false 
      });
    }

    const result = await db.transaction(async (tx) => {
      // edgecase no warehouse or sparepart
      const warehouse = await tx
        .select()
        .from(warehouses)
        .where(eq(warehouses.id, warehouseId))
        .limit(1);
      if (warehouse.length === 0) {
        throw new Error("WAREHOUSE_NOT_FOUND");
      }

      const sparepart = await tx
        .select()
        .from(spareparts)
        .where(eq(spareparts.id, sparepartId))
        .limit(1);
      if (sparepart.length === 0) {
        throw new Error("SPAREPART_NOT_FOUND");
      }

      const existingStock = await tx
        .select()
        .from(warehouseStocks)
        .where(
          and(
            eq(warehouseStocks.warehouseId, warehouseId),
            eq(warehouseStocks.sparepartId, sparepartId)
          )
        )
        .limit(1);

      let updatedStock;

      if (existingStock.length === 0) {
        const newStock = await tx
          .insert(warehouseStocks)
          .values({
            warehouseId,
            sparepartId,
            currentStock: quantity,
          })
          .returning();
        
        updatedStock = newStock[0];
      } else {
        const updated = await tx
          .update(warehouseStocks)
          .set({
            currentStock: sql`${warehouseStocks.currentStock} + ${quantity}`,
            updatedAt: sql`NOW()`,
          })
          .where(eq(warehouseStocks.id, existingStock[0]!.id))
          .returning();

        updatedStock = updated[0];
      }

      const transaction = await tx
        .insert(stockTransactions)
        .values({
          warehouseId,
          sparepartId,
          type: "IN",
          quantity,
        })
        .returning();

      return {
        stock: updatedStock,
        transaction: transaction[0],
      };
    });

    return res.status(200).json({
      message: "Stock in successful",
      success: true,
      data: result,
    });

  } catch (error: any) {
    if (error.message === "WAREHOUSE_NOT_FOUND") {
      return res.status(404).json({ 
        error: "Warehouse not found",
        success: false 
      });
    }
    
    if (error.message === "SPAREPART_NOT_FOUND") {
      return res.status(404).json({ 
        error: "Sparepart not found",
        success: false 
      });
    }

    return res.status(500).json({ 
      error: "Internal server error",
      success: false 
    });
  }
};

export const handleStockOut = async (req: Request, res: Response) => {
  try {
    const { warehouseId, sparepartId, quantity } = req.body;

    if (!warehouseId || !sparepartId || quantity === undefined) {
      return res.status(400).json({ 
        error: "warehouseId, sparepartId, and quantity are required",
        success: false 
      });
    }

    // edgecase quantity > 0
    if (quantity <= 0) {
      return res.status(400).json({ 
        error: "Quantity must be greater than 0",
        success: false 
      });
    }

    const result = await db.transaction(async (tx) => {
      // edgecase no warehouse or sparepart
      const warehouse = await tx
        .select()
        .from(warehouses)
        .where(eq(warehouses.id, warehouseId))
        .limit(1);
      if (warehouse.length === 0) {
        throw new Error("WAREHOUSE_NOT_FOUND");
      }

      const sparepart = await tx
        .select()
        .from(spareparts)
        .where(eq(spareparts.id, sparepartId))
        .limit(1);
      if (sparepart.length === 0) {
        throw new Error("SPAREPART_NOT_FOUND");
      }

      // lock stock record
      const lockedStock = await tx
        .select()
        .from(warehouseStocks)
        .where(
          and(
            eq(warehouseStocks.warehouseId, warehouseId),
            eq(warehouseStocks.sparepartId, sparepartId)
          )
        )
        .for("update")
        .limit(1);

      // cancel if no records yet
      if (lockedStock.length === 0) {
        throw new Error("STOCK_NOT_FOUND");
      }

      const currentStockRecord = lockedStock[0]!;

      // cancel if insufficient stock
      if (currentStockRecord.currentStock < quantity) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      // update stock
      const newStockValue = currentStockRecord.currentStock - quantity;
      
      const updatedStock = await tx
        .update(warehouseStocks)
        .set({
          currentStock: newStockValue,
          updatedAt: sql`NOW()`,
        })
        .where(eq(warehouseStocks.id, currentStockRecord.id))
        .returning();

      const transaction = await tx
        .insert(stockTransactions)
        .values({
          warehouseId,
          sparepartId,
          type: "OUT",
          quantity,
        })
        .returning();

      return {
        stock: updatedStock[0],
        transaction: transaction[0],
      };
    });

    return res.status(200).json({
      message: "Stock out successful",
      success: true,
      data: result,
    });

  } catch (error: any) {
    if (error.message === "WAREHOUSE_NOT_FOUND") {
      return res.status(404).json({ 
        error: "Warehouse not found",
        success: false 
      });
    }
    
    if (error.message === "SPAREPART_NOT_FOUND") {
      return res.status(404).json({ 
        error: "Sparepart not found",
        success: false 
      });
    }

    if (error.message === "STOCK_NOT_FOUND") {
      return res.status(404).json({ 
        error: "Stock record not found. Please perform stock in first.",
        success: false 
      });
    }

    if (error.message === "INSUFFICIENT_STOCK") {
      return res.status(409).json({ 
        error: "Insufficient stock available",
        success: false 
      });
    }

    return res.status(500).json({ 
      error: "Internal server error",
      success: false 
    });
  }
};

// GET /api/stock/transactions
export const getTransactionHistory = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      warehouseId, 
      sparepartId, 
      startDate, 
      endDate 
    } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions = [];
    
    if (type && typeof type === 'string' && (type === 'IN' || type === 'OUT')) {
      conditions.push(eq(transactionDetailsView.type, type));
    }
    if (warehouseId && typeof warehouseId === 'string') {
      conditions.push(eq(transactionDetailsView.warehouseId, warehouseId));
    }
    if (sparepartId && typeof sparepartId === 'string') {
      conditions.push(eq(transactionDetailsView.sparepartId, sparepartId));
    }
    if (startDate && typeof startDate === 'string') {
      conditions.push(gte(transactionDetailsView.createdAt, startDate));
    }
    if (endDate && typeof endDate === 'string') {
      conditions.push(lte(transactionDetailsView.createdAt, endDate));
    }

    const whereClause = conditions.length > 0 
      ? and(...conditions)
      : undefined;

    const result = await db
      .select()
      .from(transactionDetailsView)
      .where(whereClause)
      .orderBy(desc(transactionDetailsView.createdAt))
      .limit(Number(limit))
      .offset(offset);

    // total count with same filters
    const countConditions = [];
    if (type && typeof type === 'string' && (type === 'IN' || type === 'OUT')) {
      countConditions.push(eq(stockTransactions.type, type));
    }
    if (warehouseId && typeof warehouseId === 'string') {
      countConditions.push(eq(stockTransactions.warehouseId, warehouseId));
    }
    if (sparepartId && typeof sparepartId === 'string') {
      countConditions.push(eq(stockTransactions.sparepartId, sparepartId));
    }
    if (startDate && typeof startDate === 'string') {
      countConditions.push(gte(stockTransactions.createdAt, startDate));
    }
    if (endDate && typeof endDate === 'string') {
      countConditions.push(lte(stockTransactions.createdAt, endDate));
    }

    const countWhereClause = countConditions.length > 0 
      ? and(...countConditions)
      : undefined;

    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(stockTransactions)
      .where(countWhereClause);

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

// GET /api/stock/transactions/summary
export const getTransactionSummary = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, warehouseId } = req.query;

    const conditions = [];
    if (startDate && typeof startDate === 'string') {
      conditions.push(gte(stockTransactions.createdAt, startDate));
    }
    if (endDate && typeof endDate === 'string') {
      conditions.push(lte(stockTransactions.createdAt, endDate));
    }
    if (warehouseId && typeof warehouseId === 'string') {
      conditions.push(eq(stockTransactions.warehouseId, warehouseId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const summaryResult = await db
      .select({
        type: stockTransactions.type,
        totalQuantity: sql<number>`SUM(${stockTransactions.quantity})`,
        count: sql<number>`COUNT(*)`
      })
      .from(stockTransactions)
      .where(whereClause)
      .groupBy(stockTransactions.type);

    const inData = summaryResult.find(s => s.type === 'IN');
    const outData = summaryResult.find(s => s.type === 'OUT');

    const totalIn = Number(inData?.totalQuantity || 0);
    const totalOut = Number(outData?.totalQuantity || 0);

    return res.status(200).json({
      success: true,
      data: {
        period: {
          start: startDate || null,
          end: endDate || null
        },
        totalIn,
        totalOut,
        netChange: totalIn - totalOut,
        transactionCount: {
          in: Number(inData?.count || 0),
          out: Number(outData?.count || 0)
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", success: false });
  }
};
