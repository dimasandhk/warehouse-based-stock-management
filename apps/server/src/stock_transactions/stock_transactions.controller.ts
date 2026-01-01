import type { Request, Response } from "express";
import { db, eq, and, sql } from "@warehouse-based-stock-management-oppo-technical-test/db";
import { 
  warehouses, 
  spareparts, 
  warehouseStocks, 
  stockTransactions 
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

      const currentStock = lockedStock[0] as any;

      // cancel if insufficient stock
      if (currentStock.current_stock < quantity) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      const updatedStock = await tx
        .update(warehouseStocks)
        .set({
          currentStock: sql`${warehouseStocks.currentStock} - ${quantity}`,
          updatedAt: sql`NOW()`,
        })
        .where(eq(warehouseStocks.id, currentStock.id))
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
