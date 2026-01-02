import { Suspense } from "react";
import { Package, Barcode } from "lucide-react";
import { env } from "@warehouse-based-stock-management-oppo-technical-test/env/web";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AddSparepartModal } from "@/components/spareparts/add-sparepart-modal";
import { SparepartSearch } from "@/components/spareparts/sparepart-search";

interface PageProps {
  searchParams: Promise<{
    name?: string;
    page?: string;
  }>;
}

async function getSpareparts(name?: string, page: number = 1) {
  const params = new URLSearchParams();
  if (name) params.set("name", name);
  params.set("page", page.toString());
  params.set("limit", "12");

  const endpoint = name ? "/api/sparepart/search" : "/api/sparepart";
  
  const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}${endpoint}?${params.toString()}`, {
    cache: "no-store",
    next: { tags: ["spareparts"] }
  });
  
  if (!res.ok) throw new Error("Failed to fetch spareparts");
  return res.json();
}

export default async function SparepartsPage({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;
    const page = Number(resolvedParams.page) || 1;
    const name = resolvedParams.name;

    const { result: spareparts } = await getSpareparts(name, page);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Spareparts
                    </h1>
                    <p className="text-muted-foreground">Manage your product catalog and spare parts.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Suspense>
                       <div className="w-full sm:w-64">
                          <SparepartSearch />
                       </div>
                    </Suspense>
                    <AddSparepartModal />
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {spareparts.map((sparepart: any) => (
                   <Card key={sparepart.id} className="group rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden">
                       <CardHeader className="space-y-1">
                           <div className="flex items-center justify-between">
                               <div className="p-2 rounded-xl bg-muted/50 group-hover:bg-blue-500/10 transition-colors">
                                   <Package className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                               </div>
                           </div>
                           <div className="pt-2">
                               <CardTitle className="line-clamp-1">{sparepart.name}</CardTitle>
                           </div>
                       </CardHeader>
                       <CardContent>
                           <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-lg bg-muted/30 border border-border/50">
                               <Barcode className="h-4 w-4 shrink-0 opacity-70" />
                               <span className="font-mono text-xs">{sparepart.sku}</span>
                           </div>
                       </CardContent>
                   </Card>
               ))}
               
               {spareparts.length === 0 && (
                   <div className="col-span-full h-[300px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-3xl border border-dashed border-border p-8 text-center animate-in fade-in zoom-in-95 duration-500">
                       <div className="p-4 rounded-full bg-muted/50 mb-4">
                           <Package className="h-8 w-8 text-muted-foreground/50" />
                       </div>
                       <h3 className="text-lg font-semibold mb-1">No spareparts found</h3>
                       <p className="max-w-xs text-sm text-muted-foreground/80">
                           {name ? `No items match "${name}"` : "Get started by adding your first spare part to the catalog."}
                       </p>
                   </div>
               )}
            </div>
        </div>
    );
}
