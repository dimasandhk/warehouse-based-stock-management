import { Router } from "express";
import type { Router as RouterType } from "express";
import { handleStockIn, handleStockOut } from "./stock_transactions.controller";

export const router: RouterType = Router();

router.post('/stock-in', handleStockIn);
router.post('/stock-out', handleStockOut);

export default router;