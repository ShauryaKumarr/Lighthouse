"use client";

import { type ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DataProvider } from "@/lib/data-context";
import { NavBar } from "@/components/NavBar";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <DataProvider>
        <div className="relative z-10 flex min-h-full flex-1 flex-col">
          <NavBar />
          <main className="flex-1">{children}</main>
        </div>
      </DataProvider>
    </TooltipProvider>
  );
}
