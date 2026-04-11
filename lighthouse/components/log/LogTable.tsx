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
import Link from "next/link";
import {
  Search,
  X,
  Keyboard,
  Pause,
  Play,
  TrendingUp,
  Plus,
  Settings,
} from "lucide-react";
import type { RawLogRow } from "@/lib/types";
import { EVENT_CATEGORY } from "@/lib/types";
import { LogSummaryCharts } from "@/components/log/LogSummaryCharts";
import { LogVolumeAreaChart } from "@/components/log/LogVolumeAreaChart";
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

type DashboardTab = "dashboard" | "stream" | "analytics" | "alerts";

const TABS: { id: DashboardTab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "stream", label: "Live tail" },
  { id: "analytics", label: "Analytics" },
  { id: "alerts", label: "Alerts" },
];

const CHANNEL_LABELS: Record<string, string> = {
  embedding: "Embeddings",
  llm: "LLM",
  rules: "Rules engine",
  observation: "Observations",
  prediction: "Predictions",
  pipeline: "Pipeline",
  error: "Auth & errors",
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
            className="rounded-sm bg-amber-100 px-0.5 text-slate-900 [color:inherit]"
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
    critical: "bg-red-600",
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
        className={`size-2.5 rounded-full ${colors[p]} ${blink ?? ""} ring-2 ring-white`}
        aria-hidden
      />
    </span>
  );
}

export function LogTable({ rows }: Props) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");
  const [eventFilter, setEventFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const deferredQuery = useDeferredValue(searchInput);
  const [selected, setSelected] = useState<LiveEntry | null>(null);
  const [livePaused, setLivePaused] = useState(false);
  const [liveBuffer, setLiveBuffer] = useState<LiveEntry[]>([]);
  const liveSeqRef = useRef(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const scrollParentRef = useRef<HTMLDivElement>(null);
  const streamSectionRef = useRef<HTMLElement>(null);

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

    tick();
    const id = window.setInterval(tick, STREAM_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [livePool, livePaused]);

  useEffect(() => {
    if (activeTab === "stream" && streamSectionRef.current) {
      streamSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeTab]);

  const eventTypes = useMemo(() => {
    const types = new Set<string>();
    for (const r of livePool) types.add(r.event);
    return Array.from(types).sort();
  }, [livePool]);

  const filteredEntries = useMemo(() => {
    let list = liveBuffer;
    if (activeTab === "alerts") {
      list = list.filter((e) => {
        const pr = getLogPriority(e.row.event);
        return pr === "critical" || pr === "high";
      });
    }
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
  }, [liveBuffer, eventFilter, deferredQuery, activeTab]);

  const chartRows = useMemo(
    () => filteredEntries.map((e) => e.row),
    [filteredEntries]
  );

  const sidebarChannels = useMemo(() => {
    const byCat = new Map<string, number>();
    for (const e of liveBuffer) {
      const cat = EVENT_CATEGORY[e.row.event] ?? "pipeline";
      byCat.set(cat, (byCat.get(cat) ?? 0) + 1);
    }
    return Array.from(byCat.entries())
      .map(([id, count]) => ({
        id,
        count,
        label: CHANNEL_LABELS[id] ?? id,
      }))
      .sort((a, b) => b.count - a.count);
  }, [liveBuffer]);

  const signalStats = useMemo(() => {
    let critical = 0;
    let elevated = 0;
    for (const e of liveBuffer) {
      const p = getLogPriority(e.row.event);
      if (p === "critical") critical += 1;
      else if (p === "high") elevated += 1;
    }
    return { critical, elevated };
  }, [liveBuffer]);

  const throughputLabel = useMemo(() => {
    if (liveBuffer.length < 2) return "—";
    const t0 = new Date(liveBuffer[liveBuffer.length - 1].row.timestamp).getTime();
    const t1 = new Date(liveBuffer[0].row.timestamp).getTime();
    const mins = Math.max(1 / 60, (t1 - t0) / 60000);
    return `${Math.round(liveBuffer.length / mins)} / min`;
  }, [liveBuffer]);

  const showStream = activeTab !== "analytics";
  const showCharts = activeTab !== "stream";

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

  const lightBtn =
    "inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50";

  return (
    <div className="min-h-screen bg-[#e8eaed] text-slate-900 antialiased">
      <header className="bg-gradient-to-r from-[#4a0d18] via-[#6b1024] to-[#8b1538] px-4 py-8 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">Inhibitor audit console</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              Log operations
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/75">
              Live tail cycles {livePool.length} sampled templates; buffer holds up to{" "}
              {LIVE_POOL_SIZE} events. Use tabs to focus the stream or analytics.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-8 lg:justify-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-white/60">
                Archive depth
              </p>
              <p className="text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">
                {rows.length.toLocaleString()}
              </p>
              <p className="text-xs text-white/70">events on file</p>
            </div>
            <div className="border-l border-white/25 pl-8">
              <p className="text-xs font-medium uppercase tracking-wide text-white/60">
                Rolling buffer
              </p>
              <p className="text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">
                {liveBuffer.length}
                <span className="text-xl font-normal text-white/60">
                  /{LIVE_POOL_SIZE}
                </span>
              </p>
              <p className="text-xs text-white/70">live window</p>
            </div>
            <Link
              href="/"
              className="rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              ← Harbor overview
            </Link>
          </div>
        </div>
      </header>

      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-stretch gap-1 px-4 sm:px-8 lg:px-12">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-3.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-slate-900 after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:rounded-full after:bg-[#b91c1c]"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="space-y-4 lg:col-span-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Pipeline channels</h2>
                <button
                  type="button"
                  className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  aria-label="Settings"
                >
                  <Settings className="size-4" aria-hidden />
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Event volume by stage in the current live buffer.
              </p>
              <button
                type="button"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-50"
              >
                <Plus className="size-4" aria-hidden />
                Add watch channel
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Signals
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-md border border-red-100 bg-red-50/80 p-3">
                  <p className="text-xs text-red-800/80">Critical</p>
                  <p className="text-2xl font-semibold tabular-nums text-red-700">
                    {signalStats.critical}
                  </p>
                </div>
                <div className="rounded-md border border-amber-100 bg-amber-50/80 p-3">
                  <p className="text-xs text-amber-900/70">Elevated</p>
                  <p className="text-2xl font-semibold tabular-nums text-amber-800">
                    {signalStats.elevated}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {sidebarChannels.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
                  Waiting for live events…
                </div>
              ) : (
                sidebarChannels.map((ch) => (
                  <div
                    key={ch.id}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <h3 className="text-sm font-semibold text-slate-900">{ch.label}</h3>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Events</dt>
                        <dd className="font-medium tabular-nums text-slate-900">{ch.count}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Share of buffer</dt>
                        <dd className="flex items-center gap-1 font-medium tabular-nums text-emerald-700">
                          {liveBuffer.length
                            ? `${Math.round((ch.count / liveBuffer.length) * 100)}%`
                            : "—"}
                          {liveBuffer.length > 0 && ch.count >= liveBuffer.length * 0.2 ? (
                            <TrendingUp className="size-3.5 shrink-0" aria-hidden />
                          ) : null}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))
              )}
            </div>
          </aside>

          <div className="space-y-6 lg:col-span-8">
            {showCharts ? (
              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Throughput</h2>
                      <p className="text-sm text-slate-500">
                        Estimated rate in the current buffer window.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Ingestion
                      </p>
                      <p className="flex items-center justify-end gap-1.5 text-2xl font-semibold text-emerald-700">
                        {throughputLabel}
                        <TrendingUp className="size-5" aria-hidden />
                      </p>
                    </div>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-slate-500">In view</dt>
                      <dd className="font-semibold tabular-nums text-slate-900">
                        {filteredEntries.length}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Buffer fill</dt>
                      <dd className="font-semibold tabular-nums text-slate-900">
                        {liveBuffer.length}/{LIVE_POOL_SIZE}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Stream</dt>
                      <dd className="font-semibold text-slate-900">
                        {livePaused ? "Paused" : "Live"}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="border-b border-slate-100 px-2 pb-2">
                  <p className="px-3 pt-3 text-xs font-medium text-slate-500">
                    <span className="mr-2 inline-block size-2 rounded-full bg-emerald-600" />
                    Event volume (visible window)
                  </p>
                  <LogVolumeAreaChart rows={chartRows} />
                </div>
                <div className="p-4">
                  <LogSummaryCharts rows={chartRows} lightSurface />
                </div>
              </section>
            ) : null}

            {showStream ? (
              <section
                ref={streamSectionRef}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Activity</h2>
                    <p className="text-xs text-slate-500">
                      Search, filter, and export the live window. Critical rows blink in the
                      priority column.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={lightBtn}
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
                  </button>
                </div>

                <div className="border-b border-slate-100 p-4 space-y-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <label
                        htmlFor="log-search"
                        className="text-xs font-medium text-slate-600"
                      >
                        Search log
                      </label>
                      <div className="relative">
                        <Search
                          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
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
                          className="h-10 w-full rounded-md border border-slate-300 bg-white pl-10 pr-24 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#b91c1c] focus:ring-2 focus:ring-[#b91c1c]/25"
                        />
                        <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2 text-xs text-slate-400">
                          {searchPending ? (
                            <span className="pointer-events-auto rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px]">
                              …
                            </span>
                          ) : null}
                          <span className="hidden items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] sm:inline-flex">
                            <Keyboard className="size-3" aria-hidden />
                            K
                          </span>
                        </div>
                        {searchInput ? (
                          <button
                            type="button"
                            onClick={() => setSearchInput("")}
                            className="absolute right-14 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 sm:right-[5.5rem]"
                            aria-label="Clear search"
                          >
                            <X className="size-4" />
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-end gap-2">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="log-event-filter"
                          className="text-xs font-medium text-slate-600"
                        >
                          Event type
                        </label>
                        <select
                          id="log-event-filter"
                          value={eventFilter}
                          onChange={(e) => setEventFilter(e.target.value)}
                          className="h-10 min-w-[200px] rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#b91c1c] focus:ring-2 focus:ring-[#b91c1c]/25"
                        >
                          <option value="">All events</option>
                          {eventTypes.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button type="button" className={lightBtn} onClick={exportCsv}>
                        Export CSV
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">
                    <span className="font-medium tabular-nums text-slate-800">
                      {filteredEntries.length.toLocaleString()}
                    </span>{" "}
                    in view · pool {livePool.length} templates from {rows.length.toLocaleString()}{" "}
                    total
                    {activeTab === "alerts" ? " · alerts only" : ""}
                    {searchPending ? " · updating…" : null}
                  </p>
                </div>

                <div className="lg:grid lg:grid-cols-[1fr_minmax(260px,36%)] lg:divide-x lg:divide-slate-200">
                  <div className="min-w-0">
                    <div
                      ref={scrollParentRef}
                      className="max-h-[min(65vh,640px)] overflow-auto overscroll-contain"
                      role="region"
                      aria-label="Live event log"
                    >
                      <div
                        className={`${GRID} border-b border-slate-200 bg-slate-50 px-2 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500`}
                      >
                        <span className="sr-only">Priority</span>
                        <span aria-hidden className="block w-6" />
                        <span>#</span>
                        <span>Time</span>
                        <span>Event</span>
                        <span>API key</span>
                      </div>
                      <div
                        className="relative w-full bg-white"
                        style={{ height: rowVirtualizer.getTotalSize() }}
                      >
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                          const entry = filteredEntries[virtualRow.index];
                          const row = entry.row;
                          const isSelected = selected?.streamId === entry.streamId;
                          const p = getLogPriority(row.event);
                          const stripe =
                            p === "critical"
                              ? "border-l-[3px] border-l-red-600"
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
                              className={`${GRID} ${stripe} absolute left-0 right-0 w-full border-b border-slate-100 px-2 py-0 text-left transition-colors hover:bg-slate-50 ${
                                isSelected ? "bg-slate-100" : "bg-white"
                              }`}
                              style={{
                                height: virtualRow.size,
                                transform: `translateY(${virtualRow.start}px)`,
                              }}
                            >
                              <PriorityDot event={row.event} />
                              <span className="flex items-center font-mono text-xs text-slate-500">
                                {entry.liveSeq}
                              </span>
                              <span className="flex items-center font-mono text-[11px] leading-tight text-slate-800">
                                <HighlightText text={row.timestamp} query={queryForHighlight} />
                              </span>
                              <span className="flex min-w-0 items-center">
                                <span className="truncate rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] text-slate-800">
                                  <HighlightText text={row.event} query={queryForHighlight} />
                                </span>
                              </span>
                              <span className="flex items-center font-mono text-[11px] text-slate-600">
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

                  <aside className="max-h-[min(65vh,640px)] overflow-auto border-t border-slate-200 bg-slate-50/80 p-4 lg:border-t-0">
                    {selected ? (
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Row detail
                        </h3>
                        <dl className="space-y-2 text-sm">
                          <div>
                            <dt className="text-xs text-slate-500">Priority</dt>
                            <dd className="text-xs capitalize text-slate-900">
                              {getLogPriority(selected.row.event)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-slate-500">Live sequence</dt>
                            <dd className="font-mono text-xs text-slate-800">{selected.liveSeq}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-slate-500">Source index</dt>
                            <dd className="font-mono text-xs text-slate-800">{selected.row.index}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-slate-500">Timestamp</dt>
                            <dd className="break-all font-mono text-xs text-slate-800">
                              {selected.row.timestamp}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-slate-500">Event</dt>
                            <dd className="break-all font-mono text-xs text-slate-800">
                              {selected.row.event}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-slate-500">API key</dt>
                            <dd className="break-all font-mono text-xs text-slate-800">
                              {selected.row.apiKey}
                            </dd>
                          </div>
                        </dl>
                        <div>
                          <h4 className="text-xs font-semibold text-slate-500">Metadata</h4>
                          <pre className="mt-2 max-h-[min(36vh,320px)] overflow-auto rounded-md border border-slate-200 bg-white p-3 text-[11px] leading-relaxed text-slate-800">
                            {JSON.stringify(selected.row.meta, null, 2)}
                          </pre>
                        </div>
                        <button
                          type="button"
                          className="w-full rounded-md border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                          onClick={() => setSelected(null)}
                        >
                          Close detail
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed text-slate-600">
                        Select a row to inspect metadata. The layout mirrors a portfolio-style
                        dashboard: channels on the left, throughput and activity on the right.
                      </p>
                    )}
                  </aside>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
