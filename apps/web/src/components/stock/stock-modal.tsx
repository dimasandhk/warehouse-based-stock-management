"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, ArrowUpFromLine, X, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { env } from "@warehouse-based-stock-management-oppo-technical-test/env/web";

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

interface Sparepart {
  id: string;
  name: string;
  sku: string;
}

export function StockModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"IN" | "OUT">("IN");
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [spareparts, setSpareparts] = useState<Sparepart[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [selectedSparepart, setSelectedSparepart] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchWarehouses();
      fetchSpareparts();
    }
  }, [isOpen]);

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

  async function fetchSpareparts() {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/sparepart?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setSpareparts(data.result || []);
      }
    } catch (error) {
      console.error("Failed to fetch spareparts:", error);
    }
  }

  function resetForm() {
    setSelectedWarehouse(null);
    setSelectedSparepart(null);
    setQuantity("");
    setMode("IN");
  }

  function handleClose() {
    setIsOpen(false);
    resetForm();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!selectedWarehouse || !selectedSparepart || !quantity) {
      toast.error("Please fill all fields");
      return;
    }

    const quantityNum = parseInt(quantity, 10);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast.error("Quantity must be a positive number");
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = mode === "IN" 
        ? `${env.NEXT_PUBLIC_SERVER_URL}/api/stock/stock-in`
        : `${env.NEXT_PUBLIC_SERVER_URL}/api/stock/stock-out`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          warehouseId: selectedWarehouse,
          sparepartId: selectedSparepart,
          quantity: quantityNum,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Stock ${mode.toLowerCase()} failed`);
      }

      toast.success(`Stock ${mode === "IN" ? "in" : "out"} successful`);
      handleClose();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  const selectedWarehouseLabel = warehouses.find(w => w.id === selectedWarehouse);
  const selectedSparepartLabel = spareparts.find(s => s.id === selectedSparepart);

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        className="rounded-xl gap-2 cursor-pointer font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
      >
        <Package className="h-4 w-4" />
        Manage Stock
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-all" 
            onClick={handleClose}
          />
          <div className="relative w-full max-w-md bg-background rounded-2xl border border-border/50 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={handleClose}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="mb-6 space-y-1">
              <h2 className="text-xl font-semibold">Manage Stock</h2>
              <p className="text-sm text-muted-foreground">Add or remove stock from your inventory.</p>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setMode("IN")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  mode === "IN"
                    ? "bg-green-500/10 text-green-600 border-2 border-green-500/30"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted border-2 border-transparent"
                }`}
              >
                <ArrowDownToLine className="h-4 w-4" />
                Stock In
              </button>
              <button
                type="button"
                onClick={() => setMode("OUT")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  mode === "OUT"
                    ? "bg-red-500/10 text-red-600 border-2 border-red-500/30"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted border-2 border-transparent"
                }`}
              >
                <ArrowUpFromLine className="h-4 w-4" />
                Stock Out
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse</Label>
                <Select value={selectedWarehouse} onValueChange={(value) => setSelectedWarehouse(value)}>
                  <SelectTrigger className="rounded-xl w-full">
                    <SelectValue>
                      {selectedWarehouseLabel 
                        ? `${selectedWarehouseLabel.name} (${selectedWarehouseLabel.code})` 
                        : <span className="text-muted-foreground">Select a warehouse</span>}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sparepart">Sparepart</Label>
                <Select value={selectedSparepart} onValueChange={(value) => setSelectedSparepart(value)}>
                  <SelectTrigger className="rounded-xl w-full">
                    <SelectValue>
                      {selectedSparepartLabel 
                        ? `${selectedSparepartLabel.name} (${selectedSparepartLabel.sku})` 
                        : <span className="text-muted-foreground">Select a sparepart</span>}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {spareparts.map((sparepart) => (
                      <SelectItem key={sparepart.id} value={sparepart.id}>
                        {sparepart.name} ({sparepart.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input 
                  id="quantity" 
                  name="quantity" 
                  type="number"
                  min="1"
                  placeholder="Enter quantity" 
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required 
                  className="rounded-xl" 
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose} 
                  className="rounded-xl cursor-pointer" 
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className={`rounded-xl cursor-pointer ${
                    mode === "IN" 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === "IN" ? "Add Stock" : "Remove Stock"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
