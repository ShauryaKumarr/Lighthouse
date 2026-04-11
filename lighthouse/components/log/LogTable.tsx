"use client";

import { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RawLogRow } from "@/lib/types";
import { EVENT_CATEGORY, CATEGORY_COLORS } from "@/lib/types";

interface Props {
  rows: RawLogRow[];
}

const columnHelper = createColumnHelper<RawLogRow>();

export function LogTable({ rows }: Props) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [eventFilter, setEventFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const eventTypes = useMemo(() => {
    const types = new Set<string>();
    for (const r of rows) types.add(r.event);
    return Array.from(types).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    let result = rows;
    if (eventFilter) {
      result = result.filter((r) => r.event === eventFilter);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.event.toLowerCase().includes(lower) ||
          r.apiKey.toLowerCase().includes(lower) ||
          r.timestamp.toLowerCase().includes(lower) ||
          JSON.stringify(r.meta).toLowerCase().includes(lower)
      );
    }
    return result;
  }, [rows, eventFilter, searchTerm]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("index", {
        header: "#",
        cell: (info) => (
          <span className="font-mono text-xs text-muted-foreground">
            {info.getValue()}
          </span>
        ),
        size: 60,
      }),
      columnHelper.accessor("timestamp", {
        header: "Timestamp",
        cell: (info) => (
          <span className="font-mono text-xs">{info.getValue()}</span>
        ),
        size: 200,
      }),
      columnHelper.accessor("event", {
        header: "Event",
        cell: (info) => {
          const event = info.getValue();
          const cat = EVENT_CATEGORY[event] ?? "pipeline";
          const color = CATEGORY_COLORS[cat] ?? "#6b7280";
          return (
            <Badge
              variant="outline"
              className="text-xs font-mono"
              style={{ borderColor: color, color }}
            >
              {event}
            </Badge>
          );
        },
        size: 300,
      }),
      columnHelper.accessor("apiKey", {
        header: "API Key",
        cell: (info) => {
          const key = info.getValue();
          return (
            <span className="font-mono text-xs text-muted-foreground">
              {key.length > 16 ? `${key.slice(0, 8)}...${key.slice(-4)}` : key}
            </span>
          );
        },
        size: 140,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 50 } },
  });

  const exportCsv = useCallback(() => {
    const header = "index,timestamp,apiKey,event,meta";
    const csvRows = filteredRows.map(
      (r) =>
        `${r.index},"${r.timestamp}","${r.apiKey}","${r.event}","${JSON.stringify(r.meta).replace(/"/g, '""')}"`
    );
    const blob = new Blob([header + "\n" + csvRows.join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lighthouse_filtered_logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredRows]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base">Event Log</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-beacon w-48"
            />
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-beacon"
            >
              <option value="">All events</option>
              {eventTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              onClick={exportCsv}
              className="h-8 rounded-md bg-beacon/10 border border-beacon/30 px-3 text-xs font-medium text-beacon hover:bg-beacon/20 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Showing {filteredRows.length.toLocaleString()} of{" "}
          {rows.length.toLocaleString()} events
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="py-2 px-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
                <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Meta
                </th>
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const isExpanded = expandedRow === row.original.index;
              return (
                <tr
                  key={row.id}
                  className="border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors"
                  onClick={() =>
                    setExpandedRow(isExpanded ? null : row.original.index)
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-2 px-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                  <td className="py-2 px-3">
                    {isExpanded ? (
                      <pre className="text-[10px] font-mono text-muted-foreground whitespace-pre-wrap break-all max-w-md">
                        {JSON.stringify(row.original.meta, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-xs text-muted-foreground/60 font-mono truncate block max-w-[200px]">
                        {JSON.stringify(row.original.meta).slice(0, 60)}...
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex items-center justify-between pt-4">
          <div className="text-xs text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-7 rounded-md border border-border px-3 text-xs disabled:opacity-30 hover:bg-muted/30 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-7 rounded-md border border-border px-3 text-xs disabled:opacity-30 hover:bg-muted/30 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
