"use client";

import { useData } from "@/lib/data-context";
import { LogTable } from "@/components/log/LogTable";

export default function LogPage() {
  const { loading, error, rawRows } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto rounded-full bg-beacon/20 animate-beacon-pulse" />
          <p className="text-muted-foreground text-sm">Loading log data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lighthouse Log</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Full event log from the Inhibitor audit. Search, filter by event type,
          and click any row to expand its metadata.
        </p>
      </div>
      <LogTable rows={rawRows} />
    </div>
  );
}
