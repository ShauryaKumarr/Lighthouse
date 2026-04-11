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
import { Search, X, Keyboard, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RawLogRow } from "@/lib/types";
import { LogSummaryCharts } from "@/components/log/LogSummaryCharts";
import { getLogPriority, priorityBlinkClass } from "@/lib/log-priority";

interface Props {
  rows: RawLogRow[];
}

const LIVE_POOL_SIZE = 50;
const STREAM_INTERVAL_MS = 880;
const ROW_HEIGHT = 48;
const GRID =
  "grid grid-cols-[40px_52px_minmax(128px,1fr)_minmax(0,1.4fr)_minmax(96px,120px)] gap-x-2 gap-y-0";

type LiveEntry = {
  streamId: string;
  liveSeq: number;
  row: RawLogRow;
};

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildLivePool(source: RawLogRow[], size: number): RawLogRow[] {
  if (source.length === 0) return [];
  if (source.length <= size) return source.map((r) => ({ ...r }));
  const out: RawLogRow[] = [];
  for (let i = 0; i < size; i++) {
    const idx = Math.floor((i / Math.max(size - 1, 1)) * (source.length - 1));
    out.push(source[idx]);
  }
  return out;
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

function PriorityDot({ event }: { event: string }) {
  const p = getLogPriority(event);
  const blink = priorityBlinkClass(p);
  const colors: Record<string, string> = {
    critical: "bg-red-500",
    high: "bg-amber-500",
    normal: "bg-slate-400",
    low: "bg-slate-300",
  };
  const title =
    p === "critical"
      ? "Critical"
      : p === "high"
        ? "Elevated"
        : p === "low"
          ? "Routine"
          : "Normal";

  return (
    <span
      className="flex size-6 items-center justify-center"
      title={`${title} priority`}
    >
      <span
        className={`size-2.5 rounded-full ${colors[p]} ${blink ?? ""} ring-2 ring-background`}
        aria-hidden
      />
    </span>
  );
}

export function LogTable({ rows }: Props) {
  const [eventFilter, setEventFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const deferredQuery = useDeferredValue(searchInput);
  const [selected, setSelected] = useState<LiveEntry | null>(null);
  const [livePaused, setLivePaused] = useState(false);
  const [liveBuffer, setLiveBuffer] = useState<LiveEntry[]>([]);
  const liveSeqRef = useRef(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const scrollParentRef = useRef<HTMLDivElement>(null);

  const livePool = useMemo(() => buildLivePool(rows, LIVE_POOL_SIZE), [rows]);

  useEffect(() => {
    liveSeqRef.current = 0;
    setLiveBuffer([]);
    setSelected(null);
  }, [livePool]);

  useEffect(() => {
    if (livePaused || livePool.length === 0) return;

    const tick = () => {
      const i = liveSeqRef.current % livePool.length;
      liveSeqRef.current += 1;
      const template = livePool[i];
      const streamId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `s-${Date.now()}-${liveSeqRef.current}`;
      const incoming: RawLogRow = {
        ...template,
        timestamp: new Date().toISOString(),
      };
      const entry: LiveEntry = {
        streamId,
        liveSeq: liveSeqRef.current,
        row: incoming,
      };
      setLiveBuffer((prev) => [entry, ...prev].slice(0, LIVE_POOL_SIZE));
    };

    const id = window.setInterval(tick, STREAM_INTERVAL_MS);
    tick();
    return () => window.clearInterval(id);
  }, [livePool, livePaused]);

  const eventTypes = useMemo(() => {
    const types = new Set<string>();
    for (const r of livePool) types.add(r.event);
    return Array.from(types).sort();
  }, [livePool]);

  const filteredEntries = useMemo(() => {
    let list = liveBuffer;
    if (eventFilter) {
      list = list.filter((e) => e.row.event === eventFilter);
    }
    const q = deferredQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          e.row.event.toLowerCase().includes(q) ||
          e.row.apiKey.toLowerCase().includes(q) ||
          e.row.timestamp.toLowerCase().includes(q) ||
          JSON.stringify(e.row.meta).toLowerCase().includes(q)
      );
    }
    return list;
  }, [liveBuffer, eventFilter, deferredQuery]);

  const chartRows = useMemo(
    () => filteredEntries.map((e) => e.row),
    [filteredEntries]
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual scroll state is intentionally non-memoizable
  const rowVirtualizer = useVirtualizer({
    count: filteredEntries.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
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
    const header = "liveSeq,timestamp,apiKey,event,meta";
    const csvRows = filteredEntries.map(
      (e) =>
        `${e.liveSeq},"${e.row.timestamp}","${e.row.apiKey}","${e.row.event}","${JSON.stringify(e.row.meta).replace(/"/g, '""')}"`
    );
    const blob = new Blob([header + "\n" + csvRows.join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lighthouse_live_window.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredEntries]);

  const queryForHighlight = deferredQuery.trim();
  const searchPending = searchInput !== deferredQuery;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">Live stream</p>
          <p className="text-xs text-muted-foreground">
            Cycling {livePool.length} template lines · buffer holds up to {LIVE_POOL_SIZE}{" "}
            events · new lines appear at the top
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setLivePaused((p) => !p)}
        >
          {livePaused ? (
            <>
              <Play className="size-3.5" aria-hidden />
              Resume
            </>
          ) : (
            <>
              <Pause className="size-3.5" aria-hidden />
              Pause
            </>
          )}
        </Button>
      </div>

      <LogSummaryCharts rows={chartRows} />

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
            <span className="font-medium tabular-nums text-foreground">
              {filteredEntries.length.toLocaleString()}
            </span>{" "}
            in view ({liveBuffer.length} in buffer · pool {livePool.length} templates from{" "}
            {rows.length.toLocaleString()} total)
            {searchPending ? " · updating results…" : null}
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_minmax(260px,34%)] lg:gap-0 lg:divide-x lg:divide-border">
          <div className="min-w-0">
            <div
              ref={scrollParentRef}
              className="max-h-[min(70vh,720px)] overflow-auto overscroll-contain"
              role="region"
              aria-label="Live event log"
            >
              <div
                className={`${GRID} border-b border-border bg-muted/30 px-2 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground`}
              >
                <span className="sr-only">Priority</span>
                <span aria-hidden className="block w-6" />
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
                  const entry = filteredEntries[virtualRow.index];
                  const row = entry.row;
                  const isSelected = selected?.streamId === entry.streamId;
                  const p = getLogPriority(row.event);
                  const stripe =
                    p === "critical"
                      ? "border-l-[3px] border-l-red-500"
                      : p === "high"
                        ? "border-l-[3px] border-l-amber-500"
                        : "border-l-[3px] border-l-transparent";
                  return (
                    <button
                      key={entry.streamId}
                      type="button"
                      data-index={virtualRow.index}
                      onClick={() =>
                        setSelected((s) =>
                          s?.streamId === entry.streamId ? null : entry
                        )
                      }
                      className={`${GRID} ${stripe} absolute left-0 right-0 w-full border-b border-border px-2 py-0 text-left transition-colors hover:bg-muted/40 ${
                        isSelected ? "bg-muted/60" : "bg-card"
                      }`}
                      style={{
                        height: virtualRow.size,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <PriorityDot event={row.event} />
                      <span className="flex items-center font-mono text-xs text-muted-foreground">
                        {entry.liveSeq}
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
                      <dt className="text-xs text-muted-foreground">Priority</dt>
                      <dd className="text-xs capitalize text-foreground">
                        {getLogPriority(selected.row.event)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Live sequence</dt>
                      <dd className="font-mono text-xs">{selected.liveSeq}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Source index</dt>
                      <dd className="font-mono text-xs">{selected.row.index}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Timestamp</dt>
                      <dd className="break-all font-mono text-xs">{selected.row.timestamp}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Event</dt>
                      <dd className="break-all font-mono text-xs">{selected.row.event}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">API key</dt>
                      <dd className="break-all font-mono text-xs">{selected.row.apiKey}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground">Metadata</h4>
                  <pre className="mt-2 max-h-[min(40vh,360px)] overflow-auto rounded-md border border-border bg-background p-3 text-[11px] leading-relaxed text-foreground/90">
                    {JSON.stringify(selected.row.meta, null, 2)}
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
                Select a row for metadata. Critical and elevated events blink in the priority
                column; the stream cycles a fixed template set so the window stays readable.
              </p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
