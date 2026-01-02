import Link from "next/link";
import { Suspense } from "react";
import { Warehouse, Package, AlertTriangle, ArrowLeft } from "lucide-react";
import { env } from "@warehouse-based-stock-management-oppo-technical-test/env/web";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockModal } from "@/components/stock/stock-modal";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getWarehouseSummary(warehouseId: string) {
  const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/warehouse-stocks/warehouse-summary/${warehouseId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch warehouse summary");
  return res.json();
}

async function getWarehouseStocks(warehouseId: string, page: number = 1) {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("limit", "20");

  const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/warehouse-stocks/by-warehouse/${warehouseId}?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch warehouse stocks");
  return res.json();
}

export default async function WarehouseDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const warehouseId = resolvedParams.id;

  const [summaryData, stocksData] = await Promise.all([
    getWarehouseSummary(warehouseId),
    getWarehouseStocks(warehouseId),
  ]);

  const summary = summaryData.data;
  const stocks = stocksData.result;
  const pagination = stocksData.pagination;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link 
            href="/warehouses" 
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Warehouses
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Warehouse className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                {summary.warehouseName}
              </h1>
              <p className="text-muted-foreground font-mono text-sm">{summary.warehouseCode}</p>
            </div>
          </div>
        </div>
        <StockModal />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sparepart Types</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalSparepartTypes}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock Units</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalStockUnits.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${summary.lowStockItems > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.lowStockItems > 0 ? 'text-amber-500' : ''}`}>
              {summary.lowStockItems}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Stock Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {stocks.length > 0 ? (
            <div className="space-y-3">
              {stocks.map((stock: any) => (
                <div 
                  key={stock.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <Link 
                        href={`/spareparts/${stock.sparepartId}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {stock.sparepartName}
                      </Link>
                      <p className="text-xs text-muted-foreground font-mono">{stock.sparepartSku}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {stock.currentStock < 10 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600">
                        Low Stock
                      </span>
                    )}
                    <div className="text-right">
                      <p className="text-lg font-bold">{stock.currentStock.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">units</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border p-8 text-center">
              <Package className="h-8 w-8 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-1">No stock records</h3>
              <p className="max-w-xs text-sm text-muted-foreground/80">
                This warehouse has no spareparts in stock yet.
              </p>
            </div>
          )}

          {pagination && pagination.total > pagination.limit && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <span className="text-sm text-muted-foreground">
                Showing {stocks.length} of {pagination.total} items
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
