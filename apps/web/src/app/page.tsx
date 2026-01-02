import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Cuboid, TrendingUp, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Activity } from "lucide-react";
import { env } from "@warehouse-based-stock-management-oppo-technical-test/env/web";
import { StockModal } from "@/components/stock/stock-modal";

async function getDashboardSummary() {
  const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/dashboard/summary`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard summary");
  return res.json();
}

async function getRecentTransactions() {
  const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/dashboard/recent-transactions?limit=5`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch recent transactions");
  return res.json();
}

async function getTransactionSummary() {
  const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/stock/transactions/summary`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch transaction summary");
  return res.json();
}

export default async function Home() {
  const [summaryData, transactionsData, transactionSummary] = await Promise.all([
    getDashboardSummary(),
    getRecentTransactions(),
    getTransactionSummary(),
  ]);

  const summary = summaryData.data;
  const transactions = transactionsData.result;
  const stockMovement = transactionSummary.data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
         <div className="flex flex-col gap-1">
           <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Dashboard</h1>
           <p className="text-muted-foreground">Overview of your inventory and stock performance.</p>
         </div>
         <StockModal />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
            { title: "Total Warehouses", value: summary.totalWarehouses, icon: Cuboid },
            { title: "Total Products", value: summary.totalSpareparts, icon: Box },
            { title: "Low Stock Items", value: summary.lowStockCount, icon: AlertTriangle, alert: summary.lowStockCount > 0 },
            { title: "Total Stock Units", value: summary.totalStockUnits.toLocaleString(), icon: TrendingUp },
        ].map((stat, i) => (
            <Card key={i} className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all duration-200 bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.alert ? 'text-amber-500' : 'text-muted-foreground'}`} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
            </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 rounded-2xl border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Stock Movement Summary</CardTitle>
                <CardDescription>All-time stock in and out overview.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {/* Stock In */}
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <ArrowDownToLine className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">Stock In</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">+{stockMovement.totalIn.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stockMovement.transactionCount.in} transactions</p>
                  </div>

                  {/* Stock Out */}
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-red-500/10">
                        <ArrowUpFromLine className="h-4 w-4 text-red-600" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">Stock Out</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">-{stockMovement.totalOut.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stockMovement.transactionCount.out} transactions</p>
                  </div>

                  {/* Net Change */}
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">Net Change</span>
                    </div>
                    <p className={`text-2xl font-bold ${stockMovement.netChange >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                      {stockMovement.netChange >= 0 ? '+' : ''}{stockMovement.netChange.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stockMovement.transactionCount.in + stockMovement.transactionCount.out} total
                    </p>
                  </div>
                </div>
            </CardContent>
        </Card>
        <Card className="col-span-3 rounded-2xl border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
             <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest stock inputs and outputs.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {transactions.map((t: any) => (
                        <div key={t.id} className="flex items-center justify-between pb-4 last:mb-0 last:pb-0 border-b border-border/40 last:border-0">
                           <div className="flex items-center gap-4">
                               <div className="h-9 w-9 rounded-full bg-muted/50 flex items-center justify-center">
                                   <Box className="h-4 w-4 text-foreground/70" />
                               </div>
                               <div className="space-y-1">
                                   <p className="text-sm font-medium leading-none">{t.type === 'IN' ? 'Stock In' : 'Stock Out'}</p>
                                   <p className="text-xs text-muted-foreground">{t.warehouseName} • {new Date(t.createdAt).toLocaleDateString()}</p>
                               </div>
                           </div>
                           <div className={`text-sm font-medium ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                              {t.type === 'IN' ? '+' : '-'}{t.quantity}
                           </div>
                        </div>
                    ))}
                    {transactions.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No transactions yet
                      </div>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
