import { Router } from "express";
import type { Router as RouterType } from "express";
import { handleStockIn, handleStockOut, getTransactionHistory, getTransactionSummary } from "./stock_transactions.controller";

export const router: RouterType = Router();

router.post('/stock-in', handleStockIn);
router.post('/stock-out', handleStockOut);
router.get('/transactions', getTransactionHistory);
router.get('/transactions/summary', getTransactionSummary);

export default router;