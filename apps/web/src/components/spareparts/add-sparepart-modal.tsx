"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { env } from "@warehouse-based-stock-management-oppo-technical-test/env/web";

export function AddSparepartModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const sku = formData.get("sku") as string;

    try {
      const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/sparepart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, sku }),
      });

      if (!res.ok) {
        throw new Error("Failed to create sparepart");
      }

      toast.success("Sparepart created successfully");
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="rounded-xl gap-2 font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer">
        <Plus className="h-4 w-4" />
        Add Sparepart
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
             className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-all" 
             onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-md bg-background rounded-2xl border border-border/50 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
             <button 
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors cursor-pointer"
            >
                <X className="h-4 w-4" />
             </button>
             
             <div className="mb-6 space-y-1">
                 <h2 className="text-xl font-semibold">New Sparepart</h2>
                 <p className="text-sm text-muted-foreground">Add a new sparepart product to catalog.</p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Part Name</Label>
                    <Input id="name" name="name" placeholder="e.g. Screen Assembly" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sku">SKU Code</Label>
                    <Input id="sku" name="sku" placeholder="e.g. SP-A15-001" required className="rounded-xl" />
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl cursor-pointer" disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" className="rounded-xl cursor-pointer" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Sparepart
                    </Button>
                </div>
             </form>
          </div>
        </div>
      )}
    </>
  );
}
