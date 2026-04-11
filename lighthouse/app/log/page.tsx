"use client";

import { useData } from "@/lib/data-context";
import { LogTable } from "@/components/log/LogTable";

export default function LogPage() {
  const { loading, error, rawRows } = useData();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading log data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-1 border-b border-border pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Lighthouse log</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A simulated live tail replays fifty sampled lines from your dataset on a timer—new events
          appear at the top. Search and filters apply to the live buffer; charts follow the same
          window. Critical and elevated events pulse in the priority column.
        </p>
      </header>
      <LogTable rows={rawRows} />
    </div>
  );
}
