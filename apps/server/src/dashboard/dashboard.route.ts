import { Router } from "express";
import type { Router as RouterType } from "express";
import { getDashboardSummary, getLowStockAlerts, getRecentTransactions } from "./dashboard.controller";

export const router: RouterType = Router();

router.get('/summary', getDashboardSummary);
router.get('/low-stock', getLowStockAlerts);
router.get('/recent-transactions', getRecentTransactions);

export default router;
