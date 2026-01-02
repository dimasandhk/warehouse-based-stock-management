import Link from "next/link";
import { Package, Warehouse, ArrowLeft, Barcode } from "lucide-react";
import { env } from "@warehouse-based-stock-management-oppo-technical-test/env/web";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockModal } from "@/components/stock/stock-modal";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getSparepartStocks(sparepartId: string) {
  const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/warehouse-stocks/by-sparepart/${sparepartId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch sparepart stocks");
  return res.json();
}

export default async function SparepartDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const sparepartId = resolvedParams.id;

  const stocksData = await getSparepartStocks(sparepartId);

  const sparepart = stocksData.sparepart;
  const totalStock = stocksData.totalStock;
  const distribution = stocksData.distribution;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link 
            href="/spareparts" 
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Spareparts
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Package className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                {sparepart.name}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Barcode className="h-4 w-4" />
                <span className="font-mono text-sm">{sparepart.sku}</span>
              </div>
            </div>
          </div>
        </div>
        <StockModal />
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm bg-gradient-to-br from-blue-500/5 to-blue-500/10 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock Across All Warehouses</CardTitle>
          <Package className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalStock.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Distributed across {distribution.length} warehouse{distribution.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Warehouse Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {distribution.length > 0 ? (
            <div className="space-y-3">
              {distribution.map((stock: any) => (
                <div 
                  key={stock.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <Warehouse className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <Link 
                        href={`/warehouses/${stock.warehouseId}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {stock.warehouseName}
                      </Link>
                      <p className="text-xs text-muted-foreground font-mono">{stock.warehouseCode}</p>
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
                      <p className="text-xs text-muted-foreground">
                        {totalStock > 0 ? `${Math.round((stock.currentStock / totalStock) * 100)}%` : '0%'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border p-8 text-center">
              <Warehouse className="h-8 w-8 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-1">Not in any warehouse</h3>
              <p className="max-w-xs text-sm text-muted-foreground/80">
                This sparepart has no stock records yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
