"use client";

import { useData } from "@/lib/data-context";
import { LogTable } from "@/components/log/LogTable";

export default function LogPage() {
  const { loading, error, rawRows } = useData();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e8eaed] text-sm text-slate-600">
        Loading log data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e8eaed] text-sm text-red-700">
        Error: {error}
      </div>
    );
  }

  return <LogTable rows={rawRows} />;
}
