"use client";

import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useDeferredValue,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search, X, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RawLogRow } from "@/lib/types";
import { LogSummaryCharts } from "@/components/log/LogSummaryCharts";

interface Props {
  rows: RawLogRow[];
}

const ROW_HEIGHT = 48;
const GRID =
  "grid grid-cols-[52px_minmax(128px,1fr)_minmax(0,1.4fr)_minmax(96px,120px)] gap-x-3 gap-y-0";

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightText({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  let parts: string[];
  try {
    const re = new RegExp(`(${escapeRegExp(q)})`, "gi");
    parts = text.split(re);
  } catch {
    return <>{text}</>;
  }
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark
            key={i}
            className="rounded-sm bg-muted px-0.5 text-foreground [color:inherit]"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function LogTable({ rows }: Props) {
  const [eventFilter, setEventFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const deferredQuery = useDeferredValue(searchInput);
  const [selected, setSelected] = useState<RawLogRow | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const scrollParentRef = useRef<HTMLDivElement>(null);

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
    const q = deferredQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (r) =>
          r.event.toLowerCase().includes(q) ||
          r.apiKey.toLowerCase().includes(q) ||
          r.timestamp.toLowerCase().includes(q) ||
          JSON.stringify(r.meta).toLowerCase().includes(q)
      );
    }
    return result;
  }, [rows, eventFilter, deferredQuery]);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual scroll state is intentionally non-memoizable
  const rowVirtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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

  const queryForHighlight = deferredQuery.trim();
  const searchPending = searchInput !== deferredQuery;

  return (
    <div className="space-y-6">
      <LogSummaryCharts rows={filteredRows} />

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1.5 min-w-0 flex-1">
              <label htmlFor="log-search" className="text-xs font-medium text-muted-foreground">
                Search log
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  ref={searchRef}
                  id="log-search"
                  type="search"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Timestamp, event, API key, or metadata…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-24 text-sm outline-none transition-[box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                />
                <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2 text-xs text-muted-foreground">
                  {searchPending ? (
                    <span className="pointer-events-auto rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px]">
                      …
                    </span>
                  ) : null}
                  <span
                    className="hidden items-center gap-1 rounded border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] sm:inline-flex"
                    title="Focus search"
                  >
                    <Keyboard className="size-3" aria-hidden />
                    K
                  </span>
                </div>
                {searchInput ? (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="absolute right-14 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground sm:right-[5.5rem]"
                    aria-label="Clear search"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-2">
              <div className="space-y-1.5">
                <label htmlFor="log-event-filter" className="text-xs font-medium text-muted-foreground">
                  Event type
                </label>
                <select
                  id="log-event-filter"
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="h-10 min-w-[200px] rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  <option value="">All events</option>
                  {eventTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="button" variant="outline" size="sm" className="h-10" onClick={exportCsv}>
                Export CSV
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-medium tabular-nums text-foreground">
              {filteredRows.length.toLocaleString()}
            </span>{" "}
            of {rows.length.toLocaleString()} events
            {searchPending ? " · updating results…" : null}
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_minmax(260px,34%)] lg:gap-0 lg:divide-x lg:divide-border">
          <div className="min-w-0">
            <div
              ref={scrollParentRef}
              className="max-h-[min(70vh,720px)] overflow-auto overscroll-contain"
              role="region"
              aria-label="Scrollable event log"
            >
              <div className={`${GRID} border-b border-border bg-muted/30 px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground`}>
                <span>#</span>
                <span>Time</span>
                <span>Event</span>
                <span>API key</span>
              </div>
              <div
                className="relative w-full"
                style={{ height: rowVirtualizer.getTotalSize() }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const row = filteredRows[virtualRow.index];
                  const isSelected = selected?.index === row.index;
                  return (
                    <button
                      key={row.index}
                      type="button"
                      data-index={virtualRow.index}
                      onClick={() =>
                        setSelected((s) => (s?.index === row.index ? null : row))
                      }
                      className={`${GRID} absolute left-0 right-0 w-full border-b border-border px-3 py-0 text-left transition-colors hover:bg-muted/40 ${
                        isSelected ? "bg-muted/60" : "bg-card"
                      }`}
                      style={{
                        height: virtualRow.size,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <span className="flex items-center font-mono text-xs text-muted-foreground">
                        {row.index}
                      </span>
                      <span className="flex items-center font-mono text-[11px] leading-tight text-foreground/90">
                        <HighlightText text={row.timestamp} query={queryForHighlight} />
                      </span>
                      <span className="flex min-w-0 items-center">
                        <span className="truncate rounded border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-foreground/90">
                          <HighlightText text={row.event} query={queryForHighlight} />
                        </span>
                      </span>
                      <span className="flex items-center font-mono text-[11px] text-muted-foreground">
                        <HighlightText
                          text={
                            row.apiKey.length > 14
                              ? `${row.apiKey.slice(0, 6)}…${row.apiKey.slice(-4)}`
                              : row.apiKey
                          }
                          query={queryForHighlight}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="border-t border-border bg-muted/10 p-4 lg:border-t-0 lg:max-h-[min(70vh,720px)] lg:overflow-auto">
            {selected ? (
              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Row detail
                  </h3>
                  <dl className="mt-2 space-y-2 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Index</dt>
                      <dd className="font-mono text-xs">{selected.index}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Timestamp</dt>
                      <dd className="break-all font-mono text-xs">{selected.timestamp}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Event</dt>
                      <dd className="break-all font-mono text-xs">{selected.event}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">API key</dt>
                      <dd className="break-all font-mono text-xs">{selected.apiKey}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground">Metadata</h4>
                  <pre className="mt-2 max-h-[min(40vh,360px)] overflow-auto rounded-md border border-border bg-background p-3 text-[11px] leading-relaxed text-foreground/90">
                    {JSON.stringify(selected.meta, null, 2)}
                  </pre>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setSelected(null)}
                >
                  Close detail
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                Select a row to inspect full metadata. Scroll the list to browse all matching
                events—no page buttons.
              </p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
