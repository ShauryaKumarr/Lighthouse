"use client";

import { type ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DataProvider } from "@/lib/data-context";
import { NavBar } from "@/components/NavBar";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <DataProvider>
        <NavBar />
        <main className="flex-1 bg-background">{children}</main>
      </DataProvider>
    </TooltipProvider>
  );
}
