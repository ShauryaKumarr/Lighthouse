"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { RawLogRow } from "@/lib/types";
import { EVENT_CATEGORY, CATEGORY_COLORS } from "@/lib/types";
interface Props {
  rows: RawLogRow[];
}

const AXIS = { fill: "#64748b", fontSize: 11 };
const GRID = { stroke: "#e2e8f0" };

/** Distinct, balanced palette for time buckets (not tied to event semantics). */
const TIME_BUCKET_PALETTE = [
  "#4f6db8",
  "#2d9b8f",
  "#c4863d",
  "#8b5cf6",
  "#d9546c",
  "#3b82c4",
  "#65a30d",
  "#b45309",
  "#6366f1",
  "#0d9488",
  "#be185d",
  "#4b5563",
];

const FALLBACK_EVENT_COLORS = [
  "#5b7cfa",
  "#2db3a4",
  "#d0943b",
  "#a855c9",
  "#e6546a",
  "#3b82f6",
  "#14b8a6",
  "#f97316",
  "#64748b",
];

function colorForEventType(eventKey: string, index: number): string {
  const cat = EVENT_CATEGORY[eventKey];
  if (cat && CATEGORY_COLORS[cat]) return CATEGORY_COLORS[cat];
  return FALLBACK_EVENT_COLORS[index % FALLBACK_EVENT_COLORS.length];
}

export function LogSummaryCharts({ rows }: Props) {
  const card = "border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5";
  const title = "text-xs font-medium uppercase tracking-wide text-slate-500";
  const empty =
    "border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-sm shadow-slate-900/5";
  const tip = "border border-slate-200 bg-white px-2.5 py-2 text-xs shadow-md shadow-slate-900/10";
  const tipMuted = "mt-1 text-slate-600";
  const tipTitle = "font-mono text-[10px] text-slate-800";
  const { byMinute, topEvents } = useMemo(() => {
    const minuteMap = new Map<string, number>();
    const eventMap = new Map<string, number>();

    for (const r of rows) {
      const minute = r.timestamp.slice(0, 16);
      minuteMap.set(minute, (minuteMap.get(minute) ?? 0) + 1);
      eventMap.set(r.event, (eventMap.get(r.event) ?? 0) + 1);
    }

    const byMinute = Array.from(minuteMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([slot, count], i) => ({
        slot,
        label: slot.length >= 16 ? slot.slice(5, 16).replace("T", " ") : slot,
        count,
        fill: TIME_BUCKET_PALETTE[i % TIME_BUCKET_PALETTE.length],
      }));

    const topEvents = Array.from(eventMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([event, count], i) => ({
        event: event.length > 36 ? `${event.slice(0, 34)}…` : event,
        count,
        fullEvent: event,
        fill: colorForEventType(event, i),
      }));

    return { byMinute, topEvents };
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className={empty}>
        No rows match the current filters.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className={card}>
        <h3 className={title}>
          Events by minute (visible window)
        </h3>
        <div className="mt-3" style={{ height: 208 }}>
          <ResponsiveContainer width="100%" height={208}>
            <BarChart data={byMinute} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID.stroke} vertical={false} />
              <XAxis
                dataKey="label"
                tick={AXIS}
                axisLine={{ stroke: GRID.stroke }}
                tickMargin={6}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={AXIS}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={36}
              />
              <Tooltip
                cursor={{ fill: "rgb(241 245 249 / 0.9)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload as {
                    slot: string;
                    count: number;
                  };
                  const v = Number(payload[0].value);
                  return (
                    <div className={tip}>
                      <p className={tipTitle}>{row.slot}</p>
                      <p className={tipMuted}>
                        {Number.isFinite(v) ? v.toLocaleString() : "—"} events
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" name="Events" radius={[2, 2, 0, 0]} maxBarSize={48}>
                {byMinute.map((entry, i) => (
                  <Cell key={`${entry.slot}-${i}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={card}>
        <h3 className={title}>
          Top event types
        </h3>
        <div className="mt-3" style={{ height: 208 }}>
          <ResponsiveContainer width="100%" height={208}>
            <BarChart
              data={topEvents}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={GRID.stroke} horizontal={false} />
              <XAxis type="number" tick={AXIS} axisLine={{ stroke: GRID.stroke }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="event"
                width={118}
                tick={AXIS}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <Tooltip
                cursor={{ fill: "rgb(241 245 249 / 0.9)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as { fullEvent: string; count: number };
                  return (
                    <div className={tip}>
                      <p className="max-w-xs break-all font-mono text-[10px] leading-snug text-slate-900">
                        {p.fullEvent}
                      </p>
                      <p className={tipMuted}>
                        {p.count.toLocaleString()} events
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" name="Count" radius={[0, 2, 2, 0]} maxBarSize={14}>
                {topEvents.map((entry, i) => (
                  <Cell key={`${entry.fullEvent}-${i}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
