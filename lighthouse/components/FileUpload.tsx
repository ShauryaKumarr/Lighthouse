"use client";

import { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useData } from "@/lib/data-context";

export function FileUpload() {
  const { loadCustomData, dataSource } = useData();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [jsonlFile, setJsonlFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleUpload = useCallback(async () => {
    if (!csvFile) return;
    const csvText = await csvFile.text();
    const jsonlText = jsonlFile ? await jsonlFile.text() : "";
    await loadCustomData(csvText, jsonlText);
    setIsOpen(false);
  }, [csvFile, jsonlFile, loadCustomData]);

  if (!isOpen) {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border/60 bg-card/60 px-4 py-3 shadow-sm shadow-black/10 dark:bg-card/40 dark:shadow-black/25">
        <span className="text-xs text-muted-foreground">
          Source{" "}
          <span className="font-mono text-[13px] text-foreground/90">{dataSource}</span>
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand/90"
        >
          Upload custom logs
        </button>
      </div>
    );
  }

  return (
    <Card className="border-beacon/30">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Upload Custom Log Data</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              inhibitor_logs.csv (required)
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
              className="block w-full text-xs file:mr-2 file:rounded-md file:border-0 file:bg-beacon/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-beacon hover:file:bg-beacon/20"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              inhibitor_events.jsonl (optional)
            </label>
            <input
              type="file"
              accept=".jsonl,.json"
              onChange={(e) => setJsonlFile(e.target.files?.[0] ?? null)}
              className="block w-full text-xs file:mr-2 file:rounded-md file:border-0 file:bg-beacon/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-beacon hover:file:bg-beacon/20"
            />
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={!csvFile}
          className="h-8 rounded-md bg-beacon px-4 text-xs font-medium text-navy disabled:opacity-40 hover:bg-beacon-light transition-colors"
        >
          Load Data
        </button>
      </CardContent>
    </Card>
  );
}
