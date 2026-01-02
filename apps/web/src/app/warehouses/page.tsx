import Link from "next/link";
import { Suspense } from "react";
import { Warehouse } from "lucide-react";
import { env } from "@warehouse-based-stock-management-oppo-technical-test/env/web";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { AddWarehouseModal } from "@/components/warehouses/add-warehouse-modal";
import { WarehouseSearch } from "@/components/warehouses/warehouse-search";

interface PageProps {
  searchParams: Promise<{
    name?: string;
    page?: string;
  }>;
}

async function getWarehouses(name?: string, page: number = 1) {
  const params = new URLSearchParams();
  if (name) params.set("name", name);
  params.set("page", page.toString());
  params.set("limit", "12");

  const endpoint = name ? "/api/warehouse/search" : "/api/warehouse";
  
  const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}${endpoint}?${params.toString()}`, {
    cache: "no-store",
    next: { tags: ["warehouses"] }
  });
  
  if (!res.ok) throw new Error("Failed to fetch warehouses");
  return res.json();
}

export default async function WarehousesPage({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;
    const page = Number(resolvedParams.page) || 1;
    const name = resolvedParams.name;

    const { result: warehouses } = await getWarehouses(name, page);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Warehouses
                    </h1>
                    <p className="text-muted-foreground">Manage your storage locations and inventory distribution.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Suspense>
                       <div className="w-full sm:w-64">
                          <WarehouseSearch />
                       </div>
                    </Suspense>
                    <AddWarehouseModal />
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {warehouses.map((warehouse: any) => (
                   <Link key={warehouse.id} href={`/warehouses/${warehouse.id}`}>
                     <Card className="group rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden cursor-pointer h-full">
                         <CardHeader className="space-y-1">
                             <div className="flex items-center justify-between">
                                 <div className="p-2 rounded-xl bg-muted/50 group-hover:bg-blue-500/10 transition-colors">
                                     <Warehouse className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                                 </div>
                                 <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted/50 text-muted-foreground font-mono">
                                     {warehouse.code}
                                 </span>
                             </div>
                             <div className="pt-2">
                                 <CardTitle className="line-clamp-1">{warehouse.name}</CardTitle>
                             </div>
                         </CardHeader>
                     </Card>
                   </Link>
               ))}
               
               {warehouses.length === 0 && (
                   <div className="col-span-full h-[300px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-3xl border border-dashed border-border p-8 text-center animate-in fade-in zoom-in-95 duration-500">
                       <div className="p-4 rounded-full bg-muted/50 mb-4">
                           <Warehouse className="h-8 w-8 text-muted-foreground/50" />
                       </div>
                       <h3 className="text-lg font-semibold mb-1">No warehouses found</h3>
                       <p className="max-w-xs text-sm text-muted-foreground/80">
                           {name ? `No warehouses match "${name}"` : "Get started by adding your first warehouse location."}
                       </p>
                   </div>
               )}
            </div>
        </div>
    );
}
