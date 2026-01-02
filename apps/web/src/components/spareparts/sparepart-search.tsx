"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Route } from "next";

export function SparepartSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  
  // Initialize state from URL params to avoid uncontrolled/controlled mismatch
  const [inputValue, setInputValue] = useState(searchParams.get("name")?.toString() ?? "");

  // Sync state with URL params changes (e.g. back button navigation)
  useEffect(() => {
    setInputValue(searchParams.get("name")?.toString() ?? "");
  }, [searchParams]);

  function handleSearch(term: string) {
    setInputValue(term);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (term) {
        params.set("name", term);
      } else {
        params.delete("name");
      }
      // reset page on search
      params.set("page", "1");

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}` as Route);
      });
    }, 300);
  }

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search spareparts..."
        className="w-full pl-9 rounded-xl bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20"
        onChange={(e) => handleSearch(e.target.value)}
        value={inputValue}
      />
      {isPending && (
         <div className="absolute right-3 top-3 h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      )}
    </div>
  );
}
