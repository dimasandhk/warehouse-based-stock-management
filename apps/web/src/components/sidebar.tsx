"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Home, Warehouse, Package, Settings, Box, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";

type NavItem = {
  title: string;
  url: Route;
  icon: typeof Home;
};

const items: NavItem[] = [
  {
    title: "Main",
    url: "/" as Route,
    icon: Home,
  },
  {
    title: "Warehouses",
    url: "/warehouses" as Route,
    icon: Warehouse,
  },
  {
    title: "Spareparts",
    url: "/spareparts" as Route,
    icon: Package,
  },
  {
    title: "Transactions",
    url: "/transactions" as Route,
    icon: ArrowLeftRight,
  },
  {
    title: "Settings",
    url: "/settings" as Route,
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border/40 bg-background/60 backdrop-blur-xl transition-all duration-300 ease-in-out md:static md:block hidden">
      <div className="flex flex-col h-full">

        <div className="px-6 py-6 border-b border-border/20">
          <Link href="/" className="flex items-center gap-2 group">
             <div className="p-2 rounded-xl bg-gradient-to-tr from-primary/80 to-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                <Box className="w-5 h-5" />
             </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              StockManager
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.url;
            return (
              <Link
                key={item.title}
                href={item.url}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-[15px] font-medium rounded-2xl transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                 {isActive && (
                    <div className="absolute inset-0 bg-primary z-0" />
                 )}
                 
                 {isActive && (
                    <div className="absolute inset-x-0 top-0 h-px bg-white/20 z-0" />
                 )}

                <item.icon
                  className={cn(
                    "w-5 h-5 relative z-10 transition-colors",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className="relative z-10">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/20">
           <div className="flex items-center gap-2 p-2 rounded-2xl bg-sidebar-accent/50 border border-sidebar-border/50 backdrop-blur-sm">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 shadow-inner ring-2 ring-background" />
             <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">admin@oppo.com</p>
             </div>
             <SidebarModeToggle />
           </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarModeToggle() {
    return (
        <div className="relative">
             <ModeToggle />
        </div>
    )
}
