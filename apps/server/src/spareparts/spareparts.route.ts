import { Router } from "express";
import type { Router as RouterType } from "express";
import { db, ilike } from "@warehouse-based-stock-management-oppo-technical-test/db";
import { spareparts } from "@warehouse-based-stock-management-oppo-technical-test/db/schema/index";

export const router: RouterType = Router();

// create new sparepart
router.post('/', async (req, res) => {
  try {
    const { name, sku } = req.body;
    if (!name || !sku) {
      return res.status(400).json({ error: "Name and sku are required", success: false });
    }

    const result = await db.insert(spareparts).values({
      name,
      sku,
    });
    
    return res.status(201).json({
      message: "Sparepart created successfully",
      result,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", success: false });
  }
})

// get spareparts (paginated)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const result = await db.select().from(spareparts).limit(Number(limit)).offset(offset);
    return res.status(200).json({
      message: "Spareparts fetched successfully",
      result,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", success: false });
  }
})

// search sparepart (paginated)
router.get('/search', async (req, res) => {
  try {
    const { name, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const result = await db.select().from(spareparts).where(ilike(spareparts.name, `%${name}%`)).limit(Number(limit)).offset(offset);
    
    return res.status(200).json({
      message: "Spareparts fetched successfully",
      result,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", success: false });
  }
})

export default router;
