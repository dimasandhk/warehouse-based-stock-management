"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Cuboid, TrendingUp, AlertTriangle } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
         <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Dashboard</h1>
         <p className="text-muted-foreground">Overview of your inventory and stock performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
            { title: "Total Warehouses", value: "12", icon: Cuboid },
            { title: "Total Products", value: "4,231", icon: Box },
            { title: "Low Stock Items", value: "23", icon: AlertTriangle, alert: true },
            { title: "Total Value", value: "$1.2M", icon: TrendingUp },
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
                <CardTitle>Stock Overview</CardTitle>
                <CardDescription>Monthly stock movement across all warehouses.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                    Chart Placeholder
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
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between pb-4 last:mb-0 last:pb-0 border-b border-border/40 last:border-0">
                           <div className="flex items-center gap-4">
                               <div className="h-9 w-9 rounded-full bg-muted/50 flex items-center justify-center">
                                   <Box className="h-4 w-4 text-foreground/70" />
                               </div>
                               <div className="space-y-1">
                                   <p className="text-sm font-medium leading-none">Stock Update</p>
                                   <p className="text-xs text-muted-foreground">Warehouse A • Just now</p>
                               </div>
                           </div>
                           <div className="text-sm font-medium">+240</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
