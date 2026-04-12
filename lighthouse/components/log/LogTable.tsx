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
import { EVENT_CATEGORY, CATEGORY_COLORS } from "@/lib/types";
import { LogAiAnalyticsSection } from "@/components/log/LogAiAnalyticsSection";
import { LogAlertsSection } from "@/components/log/LogAlertsSection";
import { LogSummaryCharts } from "@/components/log/LogSummaryCharts";
import { LogVolumeAreaChart } from "@/components/log/LogVolumeAreaChart";
import { getLogPriority, priorityVisual } from "@/lib/log-priority";
import { buildDemoThroughputRows } from "@/lib/demo-throughput-rows";
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
const ROW_HEIGHT = 34;
const GRID =
  "grid grid-cols-[32px_44px_minmax(96px,1fr)_minmax(0,1.35fr)_minmax(72px,104px)] gap-x-1.5 gap-y-0";

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
            className="bg-amber-100 px-0.5 text-slate-900 [color:inherit]"
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
      className="flex size-6 items-center justify-center"
      title={`${title} priority`}
    >
      <span
        className={`size-2 rounded-full ${dotBg} ${pulse} ring-1 ring-white`}
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
  const workspaceSectionRef = useRef<HTMLDivElement>(null);
  const activitySectionRef = useRef<HTMLDivElement>(null);
  const analyticsSectionRef = useRef<HTMLDivElement>(null);
  const alertsSectionRef = useRef<HTMLDivElement>(null);

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
        roll < 0.45
          ? randomBetween(25, 120)
          : roll < 0.78
            ? randomBetween(90, 280)
            : randomBetween(200, 520);
      arm(() => {
        if (cancelled || livePausedRef.current) return;
        const r = Math.random();
        const burst =
          r < 0.22
            ? randomBetween(10, 16)
            : r < 0.62
              ? randomBetween(5, 10)
              : randomBetween(3, 7);
        let n = 0;
        const runBurst = () => {
          if (cancelled || livePausedRef.current) return;
          emitOne();
          n += 1;
          if (n < burst) {
            arm(runBurst, randomBetween(8, 45));
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

  const newestStreamId = liveBuffer[0]?.streamId;
  useEffect(() => {
    const el = scrollParentRef.current;
    if (!el || !newestStreamId) return;
    el.scrollTop = 0;
  }, [newestStreamId]);

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

  const throughputChartRows = useMemo(
    () => [...buildDemoThroughputRows(), ...chartRows],
    [chartRows]
  );

  const channelMix = useMemo(() => {
    if (liveBuffer.length === 0) return [];
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
        pct: count / liveBuffer.length,
        color: CATEGORY_COLORS[id] ?? "#64748b",
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
    if (throughputChartRows.length < 2) return "—";
    const sorted = [...throughputChartRows].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const t0 = new Date(sorted[0].timestamp).getTime();
    const t1 = new Date(sorted[sorted.length - 1].timestamp).getTime();
    const mins = Math.max(1 / 60, (t1 - t0) / 60000);
    return `${Math.round(throughputChartRows.length / mins)} / min`;
  }, [throughputChartRows]);

  const scrollToTab = useCallback((tab: DashboardTab) => {
    setActiveTab(tab);
    requestAnimationFrame(() => {
      const target =
        tab === "dashboard"
          ? workspaceSectionRef.current
          : tab === "stream"
            ? activitySectionRef.current
            : tab === "analytics"
              ? analyticsSectionRef.current
              : alertsSectionRef.current;
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual scroll state is intentionally non-memoizable
  const rowVirtualizer = useVirtualizer({
    count: filteredEntries.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 24,
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
    "inline-flex h-8 items-center gap-1 border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50";

  return (
    <div className="min-h-screen bg-[#b9c0ca] text-foreground antialiased">
      <header className="border-b border-slate-400/90 bg-[#c5ccd6] px-4 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="pro-kicker text-brand">Inhibitor audit console</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[rgb(27,49,57)] sm:text-5xl">
              Log operations
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              High-rate tail: dense sub-second bursts, short pauses, and auto-scroll so the inbox
              stays in motion. Buffer holds up to {LIVE_POOL_SIZE} events.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-8 lg:justify-end">
            <div>
              <p className="pro-kicker text-slate-500">Archive depth</p>
              <p className="text-4xl font-semibold tabular-nums tracking-tight text-[rgb(27,49,57)] sm:text-5xl">
                {rows.length.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">events on file</p>
            </div>
            <div className="border-l border-slate-200 pl-8">
              <p className="pro-kicker text-slate-500">Rolling buffer</p>
              <p className="text-4xl font-semibold tabular-nums tracking-tight text-[rgb(27,49,57)] sm:text-5xl">
                {liveBuffer.length}
                <span className="text-xl font-normal text-slate-500">
                  /{LIVE_POOL_SIZE}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">live window</p>
            </div>
            <Link
              href="/"
              className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-[rgb(27,49,57)] shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              ← Harbor overview
            </Link>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-50 flex h-[52px] min-h-[52px] items-stretch border-b border-slate-900/40 bg-[#2d323b] shadow-md">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-stretch gap-1 px-4 sm:px-8 lg:px-12">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => scrollToTab(tab.id)}
              className={`relative my-1 flex items-center rounded-md px-3.5 py-1 text-[15px] font-semibold transition-all duration-200 hover:bg-white/10 hover:text-slate-100 hover:ring-1 hover:ring-white/15 active:scale-[0.98] ${
                activeTab === tab.id
                  ? "text-white ring-1 ring-white/90 after:absolute after:bottom-1 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-brand"
                  : "text-slate-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-8 lg:px-12">
        <div className="space-y-6">
          <div
            ref={workspaceSectionRef}
            id="log-section-workspace"
            className="scroll-mt-[72px] overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 md:divide-x md:divide-slate-200">
              <div className="flex items-start justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-3 md:col-span-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                      Pipeline overview
                    </h2>
                    {!livePaused ? (
                      <span className="border border-emerald-600 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                        Live
                      </span>
                    ) : (
                      <span className="border border-slate-400 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                        Paused
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-snug text-slate-600">
                    Buffer {liveBuffer.length}/{LIVE_POOL_SIZE} · {rows.length.toLocaleString()} lines
                    on file
                  </p>
                </div>
                <button
                  type="button"
                  className="border border-transparent p-1 text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-800"
                  aria-label="Settings"
                >
                  <Settings className="size-4" aria-hidden />
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:col-span-8">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                    Activity
                  </h2>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Dense bursts (tens of ms). Inbox auto-scrolls to newest. Priority: green → yellow
                    → orange → red.
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

              <aside className="min-h-0 md:col-span-4">
                <div className="lg:sticky lg:top-[120px] lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto">
              <div className="border-b border-slate-200 px-3 py-3">
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Signals
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">Intervention pressure</p>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="border border-red-200 bg-red-50/90 p-2">
                    <p className="text-[10px] font-bold uppercase text-red-800">Critical</p>
                    <p className="text-xl font-bold tabular-nums text-red-700">
                      {signalStats.critical}
                    </p>
                  </div>
                  <div className="border border-amber-200 bg-amber-50/90 p-2">
                    <p className="text-[10px] font-bold uppercase text-amber-900">Elevated</p>
                    <p className="text-xl font-bold tabular-nums text-amber-800">
                      {signalStats.elevated}
                    </p>
                  </div>
                </div>
              </div>

              {channelMix.length > 0 ? (
                <div className="border-b border-slate-200 px-3 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Channel mix
                  </p>
                  <div className="mt-2 flex h-3 w-full overflow-hidden border border-slate-200 divide-x divide-white/40">
                    {channelMix.map((ch) => (
                      <div
                        key={ch.id}
                        title={`${ch.label}: ${Math.round(ch.pct * 100)}%`}
                        className="min-w-px"
                        style={{
                          flexGrow: ch.count,
                          flexBasis: 0,
                          backgroundColor: ch.color,
                        }}
                      />
                    ))}
                  </div>
                  <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-600">
                    {channelMix.map((ch) => (
                      <li key={ch.id} className="flex items-center gap-1">
                        <span
                          className="size-1.5 shrink-0 border border-slate-300"
                          style={{ backgroundColor: ch.color }}
                          aria-hidden
                        />
                        <span className="font-mono">
                          {ch.label} {Math.round(ch.pct * 100)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="border-b border-slate-200 px-3 py-2">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 border border-dashed border-slate-300 bg-slate-50 py-2 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:bg-white"
                >
                  <Plus className="size-3.5" aria-hidden />
                  Add watch channel
                </button>
              </div>

              <div className="px-3 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  By channel
                </p>
                {channelMix.length === 0 ? (
                  <p className="mt-2 text-xs text-slate-600">Waiting for live events…</p>
                ) : (
                  <table className="mt-2 w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        <th className="py-1 pr-2 font-bold">Channel</th>
                        <th className="py-1 pr-2 text-right font-bold">N</th>
                        <th className="py-1 text-right font-bold">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channelMix.map((ch) => (
                        <tr key={ch.id} className="border-b border-slate-100">
                          <td className="py-1.5 pr-2">
                            <div className="flex items-center gap-1.5 font-medium text-slate-900">
                              <span
                                className="size-1.5 shrink-0 border border-slate-300"
                                style={{ backgroundColor: ch.color }}
                                aria-hidden
                              />
                              {ch.label}
                            </div>
                          </td>
                          <td className="py-1.5 pr-2 text-right font-mono tabular-nums text-slate-800">
                            {ch.count}
                          </td>
                          <td className="py-1.5 text-right font-mono tabular-nums text-slate-700">
                            {Math.round(ch.pct * 100)}
                            {liveBuffer.length > 0 && ch.count >= liveBuffer.length * 0.2 ? (
                              <TrendingUp
                                className="ml-0.5 inline size-3 text-emerald-600"
                                aria-hidden
                              />
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
                </div>
              </aside>

          <div ref={activitySectionRef} id="log-section-activity" className="min-h-0 md:col-span-8">
              <section className="overflow-hidden bg-white transition-shadow duration-200 hover:shadow-[inset_0_1px_0_0_rgb(226,232,240)]">
                <div className="border-b border-slate-200 p-4 space-y-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <label
                        htmlFor="log-search"
                        className="text-xs font-bold text-slate-700"
                      >
                        Search log
                      </label>
                      <div className="relative">
                        <Search
                          className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400"
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
                          className="h-8 w-full border border-slate-300 bg-white pl-9 pr-20 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#b91c1c] focus:ring-1 focus:ring-[#b91c1c]/30"
                        />
                        <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2 text-xs text-slate-400">
                          {searchPending ? (
                            <span className="pointer-events-auto border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px]">
                              …
                            </span>
                          ) : null}
                          <span className="hidden items-center gap-1 border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] sm:inline-flex">
                            <Keyboard className="size-3" aria-hidden />
                            K
                          </span>
                        </div>
                        {searchInput ? (
                          <button
                            type="button"
                            onClick={() => setSearchInput("")}
                            className="absolute right-12 top-1/2 -translate-y-1/2 border border-transparent p-1 text-slate-400 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-700 sm:right-[4.5rem]"
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
                          className="block text-xs font-bold text-slate-700"
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
                            className="h-8 min-w-0 w-full max-w-md border-slate-300 bg-white text-left text-xs font-medium text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 focus-visible:border-[#b91c1c] focus-visible:ring-1 focus-visible:ring-[#b91c1c]/30 data-[size=default]:h-8 sm:min-w-[220px]"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent
                            align="start"
                            sideOffset={8}
                            className="max-h-72 min-w-[var(--anchor-width)] border border-slate-300 bg-white p-0.5 text-slate-900 shadow-lg"
                          >
                            <SelectItem
                              value="__all__"
                              className="cursor-pointer py-1.5 pl-2 pr-7 text-xs font-semibold text-slate-800 focus:bg-slate-100"
                            >
                              All events
                            </SelectItem>
                            {eventTypes.map((t) => (
                              <SelectItem
                                key={t}
                                value={t}
                                className="cursor-pointer py-1.5 pl-2 pr-7 text-left font-mono text-[11px] leading-snug text-slate-800 focus:bg-slate-100"
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

                  <p className="text-xs text-slate-600">
                    <span className="font-bold tabular-nums text-slate-900">
                      {filteredEntries.length.toLocaleString()}
                    </span>{" "}
                    in view · pool {livePool.length} templates from {rows.length.toLocaleString()}{" "}
                    total
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
                        className={`${GRID} border-b border-slate-200 bg-slate-100 px-1.5 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-slate-600`}
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
                              className={`${GRID} ${stripe} absolute left-0 right-0 w-full border-b border-slate-100 px-1.5 py-0 text-left transition-colors hover:bg-slate-50 ${
                                isSelected ? "bg-slate-100" : "bg-white"
                              }`}
                              style={{
                                height: virtualRow.size,
                                transform: `translateY(${virtualRow.start}px)`,
                              }}
                            >
                              <PriorityDot event={row.event} />
                              <span className="flex items-center font-mono text-[10px] font-semibold tabular-nums text-slate-500">
                                {entry.liveSeq}
                              </span>
                              <span className="flex items-center font-mono text-[10px] font-medium leading-tight text-slate-800">
                                <HighlightText text={row.timestamp} query={queryForHighlight} />
                              </span>
                              <span className="flex min-w-0 items-center">
                                <span className="truncate border border-slate-200 bg-slate-50 px-1 py-0.5 font-mono text-[10px] font-medium leading-tight text-slate-900">
                                  <HighlightText text={row.event} query={queryForHighlight} />
                                </span>
                              </span>
                              <span className="flex items-center font-mono text-[10px] font-medium text-slate-600">
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
                          <pre className="mt-2 max-h-[min(36vh,320px)] overflow-auto border border-slate-200 bg-white p-2 text-[10px] leading-relaxed text-slate-800">
                            {JSON.stringify(selected.row.meta, null, 2)}
                          </pre>
                        </div>
                        <button
                          type="button"
                          className="w-full border border-slate-300 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
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
          </div>
            </div>
          </div>

          <div
            ref={analyticsSectionRef}
            id="log-section-ai"
            className="scroll-mt-[72px] transition-opacity duration-200 hover:opacity-[0.99]"
          >
            <LogAiAnalyticsSection />
          </div>

          <div ref={alertsSectionRef} id="log-section-alerts" className="scroll-mt-[72px]">
            <LogAlertsSection />
          </div>

          <section
            id="log-section-charts"
            className="scroll-mt-[72px] border border-slate-300 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
          >
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
                      <dt className="text-slate-600">In view (inbox)</dt>
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
                    <span className="mr-2 inline-block size-2 border border-emerald-800 bg-emerald-600" />
                    Event volume (visible window)
                  </p>
                  <LogVolumeAreaChart rows={throughputChartRows} />
                </div>
                <div className="p-4">
                  <p className="mb-2 text-[11px] text-slate-500">
                    Charts blend a synthetic baseline (last ~60 minutes) with your filtered inbox so
                    the curve always has shape.
                  </p>
                  <LogSummaryCharts rows={throughputChartRows} />
                </div>
          </section>
        </div>
      </div>
    </div>
  );
}
