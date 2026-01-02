import { Router } from "express";
import type { Router as RouterType } from "express";
import { 
  getAllWarehouseStocks, 
  getStocksByWarehouse, 
  getWarehouseSummary, 
  getStocksBySparepart 
} from "./warehouse_stocks.controller";

export const router: RouterType = Router();

router.get('/', getAllWarehouseStocks);
router.get('/by-warehouse/:warehouseId', getStocksByWarehouse);
router.get('/warehouse-summary/:warehouseId', getWarehouseSummary);
router.get('/by-sparepart/:sparepartId', getStocksBySparepart);

export default router;
