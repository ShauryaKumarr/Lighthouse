"use client";

import { useData } from "@/lib/data-context";
import { LogTable } from "@/components/log/LogTable";

export default function LogPage() {
  const { loading, error, rawRows } = useData();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading log data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-destructive">
        Error: {error}
      </div>
    );
  }

  return <LogTable rows={rawRows} />;
}
