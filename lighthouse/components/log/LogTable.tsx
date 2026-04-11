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
import { getLogPriority, priorityVisual } from "@/lib/log-priority";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  rows: RawLogRow[];
}

const LIVE_POOL_SIZE = 50;
const SEED_ENTRY_COUNT = 18;
const ROW_HEIGHT = 52;
const GRID =
  "grid grid-cols-[44px_56px_minmax(140px,1fr)_minmax(0,1.5fr)_minmax(104px,128px)] gap-x-3 gap-y-0";

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

function seedLiveEntries(pool: RawLogRow[], n: number): LiveEntry[] {
  const out: LiveEntry[] = [];
  for (let k = 0; k < n; k++) {
    const template = pool[k % pool.length];
    out.push({
      streamId: `seed-${k}-${template.index}`,
      liveSeq: k + 1,
      row: {
        ...template,
        timestamp: new Date(Date.now() - k * 72_000).toISOString(),
      },
    });
  }
  return out;
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
  const { dotBg, pulse } = priorityVisual(p);
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
      className="flex size-8 items-center justify-center"
      title={`${title} priority`}
    >
      <span
        className={`size-3 rounded-full ${dotBg} ${pulse} ring-2 ring-white`}
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
  const livePoolRef = useRef(livePool);
  const livePausedRef = useRef(livePaused);
  livePoolRef.current = livePool;
  livePausedRef.current = livePaused;

  useEffect(() => {
    if (livePool.length === 0) {
      liveSeqRef.current = 0;
      setLiveBuffer([]);
      setSelected(null);
      return;
    }
    const seeded = seedLiveEntries(livePool, SEED_ENTRY_COUNT);
    liveSeqRef.current = seeded.length;
    setLiveBuffer(seeded);
    setSelected(null);
  }, [livePool]);

  useEffect(() => {
    if (livePaused || livePool.length === 0) return;

    const timeouts = new Set<ReturnType<typeof setTimeout>>();
    const arm = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        timeouts.delete(id);
        fn();
      }, ms);
      timeouts.add(id);
    };

    const randomBetween = (a: number, b: number) =>
      Math.round(a + Math.random() * (b - a));

    let cancelled = false;

    const emitOne = () => {
      if (cancelled || livePausedRef.current) return;
      const pool = livePoolRef.current;
      if (pool.length === 0) return;
      const i = liveSeqRef.current % pool.length;
      liveSeqRef.current += 1;
      const template = pool[i];
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

    const scheduleWave = () => {
      if (cancelled || livePausedRef.current) return;
      const roll = Math.random();
      const wait =
        roll < 0.11
          ? randomBetween(220, 780)
          : roll < 0.38
            ? randomBetween(1200, 3200)
            : randomBetween(2000, 5600);
      arm(() => {
        if (cancelled || livePausedRef.current) return;
        const r = Math.random();
        const burst = r < 0.48 ? 1 : r < 0.8 ? 2 : r < 0.93 ? 3 : 4;
        let n = 0;
        const runBurst = () => {
          if (cancelled || livePausedRef.current) return;
          emitOne();
          n += 1;
          if (n < burst) {
            arm(runBurst, randomBetween(65, 420));
          } else {
            scheduleWave();
          }
        };
        runBurst();
      }, wait);
    };

    scheduleWave();

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
      timeouts.clear();
    };
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
    "inline-flex h-11 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 text-[15px] font-semibold text-slate-800 shadow-sm hover:bg-slate-50";

  return (
    <div className="min-h-screen bg-[#e8eaed] text-slate-900 antialiased">
      <header className="bg-gradient-to-r from-[#4a0d18] via-[#6b1024] to-[#8b1538] px-4 py-8 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[15px] font-semibold text-white/85">Inhibitor audit console</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-tight sm:text-5xl">
              Log operations
            </h1>
            <p className="mt-2 max-w-xl text-base leading-relaxed text-white/80">
              Live tail cycles {livePool.length} sampled templates with randomized gaps and bursts
              (not a fixed clock). Buffer holds up to {LIVE_POOL_SIZE} events.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-8 lg:justify-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-white/65">
                Archive depth
              </p>
              <p className="text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
                {rows.length.toLocaleString()}
              </p>
              <p className="text-sm text-white/75">events on file</p>
            </div>
            <div className="border-l border-white/25 pl-8">
              <p className="text-sm font-medium uppercase tracking-wide text-white/65">
                Rolling buffer
              </p>
              <p className="text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
                {liveBuffer.length}
                <span className="text-xl font-normal text-white/60">
                  /{LIVE_POOL_SIZE}
                </span>
              </p>
              <p className="text-sm text-white/75">live window</p>
            </div>
            <Link
              href="/"
              className="rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-[15px] font-semibold text-white hover:bg-white/20"
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
              className={`relative px-4 py-3.5 text-[15px] font-semibold transition-colors ${
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
          <aside className="lg:col-span-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Pipeline overview</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Signals and channel mix for the current live buffer.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  aria-label="Settings"
                >
                  <Settings className="size-4" aria-hidden />
                </button>
              </div>

              <div className="border-b border-slate-100 py-4">
                <h3 className="text-[13px] font-semibold uppercase tracking-wide text-slate-600">
                  Signals
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-md border border-red-100 bg-red-50/80 p-3">
                  <p className="text-sm font-medium text-red-800/90">Critical</p>
                  <p className="text-3xl font-semibold tabular-nums text-red-700">
                      {signalStats.critical}
                    </p>
                  </div>
                  <div className="rounded-md border border-amber-100 bg-amber-50/80 p-3">
                    <p className="text-sm font-medium text-amber-900/80">Elevated</p>
                    <p className="text-3xl font-semibold tabular-nums text-amber-800">
                      {signalStats.elevated}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b border-slate-100 py-4">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-3 text-[15px] font-semibold text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                >
                  <Plus className="size-4" aria-hidden />
                  Add watch channel
                </button>
              </div>

              <div className="pt-4">
                <h3 className="text-[13px] font-semibold uppercase tracking-wide text-slate-600">
                  Channels
                </h3>
                {sidebarChannels.length === 0 ? (
                  <p className="mt-3 text-[15px] text-slate-600">Waiting for live events…</p>
                ) : (
                  <ul className="mt-3 divide-y divide-slate-100">
                    {sidebarChannels.map((ch) => (
                      <li key={ch.id} className="py-3 first:pt-0">
                        <h4 className="text-[15px] font-semibold text-slate-900">{ch.label}</h4>
                        <dl className="mt-2 space-y-1.5 text-[15px]">
                          <div className="flex justify-between gap-4">
                            <dt className="text-slate-600">Events</dt>
                            <dd className="font-medium tabular-nums text-slate-900">{ch.count}</dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-slate-600">Share</dt>
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
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </aside>

          <div className="space-y-6 lg:col-span-8">
            {showStream ? (
              <section
                ref={streamSectionRef}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                      Activity
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-600">
                      Search, filter, and export. New lines arrive in random bursts and pauses.
                      Priority: green → yellow → orange → red; faster pulse = higher severity.
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
                        className="text-sm font-semibold text-slate-700"
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
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-24 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#b91c1c] focus:ring-2 focus:ring-[#b91c1c]/25"
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
                      <div className="space-y-2">
                        <span
                          id="log-event-filter-label"
                          className="block text-sm font-semibold text-slate-700"
                        >
                          Event type
                        </span>
                        <Select
                          value={eventFilter === "" ? "__all__" : eventFilter}
                          onValueChange={(v) =>
                            setEventFilter(v == null || String(v) === "__all__" ? "" : String(v))
                          }
                        >
                          <SelectTrigger
                            id="log-event-filter"
                            aria-labelledby="log-event-filter-label"
                            className="h-11 min-w-0 w-full max-w-md border-slate-200 bg-white text-left text-[15px] font-medium text-slate-900 shadow-sm hover:border-slate-300 hover:bg-slate-50/90 focus-visible:border-[#b91c1c] focus-visible:ring-2 focus-visible:ring-[#b91c1c]/25 data-[size=default]:h-11 sm:min-w-[280px] dark:bg-white dark:hover:bg-slate-50"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent
                            align="start"
                            sideOffset={8}
                            className="max-h-72 min-w-[var(--anchor-width)] rounded-xl border border-slate-200 bg-white p-1.5 text-slate-900 shadow-xl ring-1 ring-slate-900/10 dark:bg-white dark:text-slate-900"
                          >
                            <SelectItem
                              value="__all__"
                              className="cursor-pointer rounded-lg py-2.5 pl-3 pr-8 text-[15px] font-semibold text-slate-800 focus:bg-slate-100"
                            >
                              All events
                            </SelectItem>
                            {eventTypes.map((t) => (
                              <SelectItem
                                key={t}
                                value={t}
                                className="cursor-pointer rounded-lg py-2.5 pl-3 pr-8 text-left font-mono text-[13px] leading-snug text-slate-800 focus:bg-slate-100"
                              >
                                <span className="line-clamp-3 break-all">{t}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <button type="button" className={lightBtn} onClick={exportCsv}>
                        Export CSV
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600">
                    <span className="font-semibold tabular-nums text-slate-900">
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
                        className={`${GRID} border-b border-slate-200 bg-slate-50 px-2 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-600`}
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
                          const stripe = `border-l-[3px] ${priorityVisual(p).stripe}`;
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
                              <span className="flex items-center font-mono text-sm font-medium tabular-nums text-slate-600">
                                {entry.liveSeq}
                              </span>
                              <span className="flex items-center font-mono text-sm font-medium leading-snug text-slate-800">
                                <HighlightText text={row.timestamp} query={queryForHighlight} />
                              </span>
                              <span className="flex min-w-0 items-center">
                                <span className="truncate rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[13px] font-medium leading-snug text-slate-900">
                                  <HighlightText text={row.event} query={queryForHighlight} />
                                </span>
                              </span>
                              <span className="flex items-center font-mono text-xs font-medium text-slate-600">
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
                        Select a row to inspect metadata. Inbox stays above; charts summarize the
                        same filtered window below.
                      </p>
                    )}
                  </aside>
                </div>
              </section>
            ) : null}

            {showCharts ? (
              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                        Throughput
                      </h2>
                      <p className="text-sm leading-relaxed text-slate-600">
                        Estimated rate in the current buffer window. Charts use the same filters as
                        the inbox above.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                        Ingestion
                      </p>
                      <p className="flex items-center justify-end gap-1.5 text-3xl font-semibold text-emerald-700">
                        {throughputLabel}
                        <TrendingUp className="size-5" aria-hidden />
                      </p>
                    </div>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-[15px] sm:grid-cols-3">
                    <div>
                      <dt className="text-slate-600">In view</dt>
                      <dd className="font-semibold tabular-nums text-slate-900">
                        {filteredEntries.length}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-600">Buffer fill</dt>
                      <dd className="font-semibold tabular-nums text-slate-900">
                        {liveBuffer.length}/{LIVE_POOL_SIZE}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-600">Stream</dt>
                      <dd className="font-semibold text-slate-900">
                        {livePaused ? "Paused" : "Live"}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="border-b border-slate-100 px-2 pb-2">
                  <p className="px-3 pt-3 text-sm font-semibold text-slate-600">
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
          </div>
        </div>
      </div>
    </div>
  );
}
