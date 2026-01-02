import { Suspense } from "react";
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Box } from "lucide-react";
import { env } from "@warehouse-based-stock-management-oppo-technical-test/env/web";
import { Card, CardContent } from "@/components/ui/card";
import { TransactionFilters } from "@/components/stock/transaction-filters";
import { StockModal } from "@/components/stock/stock-modal";

interface PageProps {
  searchParams: Promise<{
    type?: string;
    warehouseId?: string;
    page?: string;
  }>;
}

async function getTransactions(type?: string, warehouseId?: string, page: number = 1) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (warehouseId) params.set("warehouseId", warehouseId);
  params.set("page", page.toString());
  params.set("limit", "12");

  const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/stock/transactions?${params.toString()}`, {
    cache: "no-store",
    next: { tags: ["transactions"] }
  });
  
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const type = resolvedParams.type;
  const warehouseId = resolvedParams.warehouseId;

  const { result: transactions, pagination } = await getTransactions(type, warehouseId, page);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Transactions
          </h1>
          <p className="text-muted-foreground">View and filter stock movement history.</p>
        </div>
        <StockModal />
      </div>

      <Suspense>
        <TransactionFilters />
      </Suspense>
      
      <div className="grid gap-4">
        {transactions.map((transaction: any) => (
          <Card 
            key={transaction.id} 
            className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    transaction.type === 'IN' 
                      ? 'bg-green-500/10' 
                      : 'bg-red-500/10'
                  }`}>
                    {transaction.type === 'IN' ? (
                      <ArrowDownToLine className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowUpFromLine className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        transaction.type === 'IN'
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-red-500/10 text-red-600'
                      }`}>
                        {transaction.type === 'IN' ? 'Stock In' : 'Stock Out'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm font-medium">
                      {transaction.sparepartName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.warehouseName} • {transaction.warehouseCode}
                    </p>
                  </div>
                </div>
                <div className={`text-xl font-bold ${
                  transaction.type === 'IN' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'IN' ? '+' : '-'}{transaction.quantity}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {transactions.length === 0 && (
          <div className="col-span-full h-[300px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-3xl border border-dashed border-border p-8 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <ArrowLeftRight className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No transactions found</h3>
            <p className="max-w-xs text-sm text-muted-foreground/80">
              {type || warehouseId 
                ? "No transactions match your current filters." 
                : "Stock transactions will appear here once you start managing inventory."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total > pagination.limit && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <a
            href={page > 1 ? `?page=${page - 1}${type ? `&type=${type}` : ''}${warehouseId ? `&warehouseId=${warehouseId}` : ''}` : '#'}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              page > 1 
                ? 'bg-muted/50 hover:bg-muted text-foreground cursor-pointer' 
                : 'bg-muted/20 text-muted-foreground/50 cursor-not-allowed pointer-events-none'
            }`}
          >
            Previous
          </a>
          <span className="px-4 py-2 text-sm text-muted-foreground">
            Page {page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <a
            href={page < Math.ceil(pagination.total / pagination.limit) 
              ? `?page=${page + 1}${type ? `&type=${type}` : ''}${warehouseId ? `&warehouseId=${warehouseId}` : ''}` 
              : '#'}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              page < Math.ceil(pagination.total / pagination.limit)
                ? 'bg-muted/50 hover:bg-muted text-foreground cursor-pointer' 
                : 'bg-muted/20 text-muted-foreground/50 cursor-not-allowed pointer-events-none'
            }`}
          >
            Next
          </a>
        </div>
      )}
    </div>
  );
}
