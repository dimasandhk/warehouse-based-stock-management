"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { Route } from "next";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useTransition, useCallback } from "react";
import { env } from "@warehouse-based-stock-management-oppo-technical-test/env/web";

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

export function TransactionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [type, setType] = useState<string | null>(searchParams.get("type") || null);
  const [warehouseId, setWarehouseId] = useState<string | null>(searchParams.get("warehouseId") || null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    async function fetchWarehouses() {
      try {
        const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/warehouse?limit=100`);
        if (res.ok) {
          const data = await res.json();
          setWarehouses(data.result || []);
        }
      } catch (error) {
        console.error("Failed to fetch warehouses:", error);
      }
    }
    fetchWarehouses();
  }, []);

  const updateFilters = useCallback((newType: string | null, newWarehouseId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newType && newType !== "all") {
      params.set("type", newType);
    } else {
      params.delete("type");
    }
    
    if (newWarehouseId && newWarehouseId !== "all") {
      params.set("warehouseId", newWarehouseId);
    } else {
      params.delete("warehouseId");
    }
    
    params.set("page", "1");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}` as Route);
    });
  }, [pathname, router, searchParams]);

  function handleTypeChange(value: string | null) {
    setType(value);
    updateFilters(value, warehouseId);
  }

  function handleWarehouseChange(value: string | null) {
    setWarehouseId(value);
    updateFilters(type, value);
  }

  function handleClearFilters() {
    setType(null);
    setWarehouseId(null);
    startTransition(() => {
      router.push(pathname as Route);
    });
  }

  const hasFilters = type || warehouseId;
  const selectedWarehouse = warehouses.find(w => w.id === warehouseId);

  const typeLabel = type === "IN" ? "Stock In" : type === "OUT" ? "Stock Out" : "All Types";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Filters:</span>
      </div>
      
      <Select value={type || "all"} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-32 rounded-xl">
          <SelectValue>{typeLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="IN">Stock In</SelectItem>
          <SelectItem value="OUT">Stock Out</SelectItem>
        </SelectContent>
      </Select>

      <Select value={warehouseId || "all"} onValueChange={handleWarehouseChange}>
        <SelectTrigger className="w-44 rounded-xl">
          <SelectValue>
            {selectedWarehouse ? selectedWarehouse.name : "All Warehouses"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Warehouses</SelectItem>
          {warehouses.map((warehouse) => (
            <SelectItem key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}

      {isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
