import { Router } from "express";
import type { Router as RouterType } from "express";
import { db } from "@warehouse-based-stock-management-oppo-technical-test/db";
import { warehouses } from "@warehouse-based-stock-management-oppo-technical-test/db/schema/index";

export const router: RouterType = Router();

// create new warehouse
router.post('/', async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: "Name and code are required", success: false });
    }

    const result = await db.insert(warehouses).values({
      name,
      code,
    });
    
    return res.status(201).json({
      message: "Warehouse created successfully",
      result,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", success: false });
  }
})

// get warehouses (paginated)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const result = await db.select().from(warehouses).limit(Number(limit)).offset(offset);
    return res.status(200).json({
      message: "Warehouses fetched successfully",
      result,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", success: false });
  }
})

export default router;