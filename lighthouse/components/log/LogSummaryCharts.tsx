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
} from "recharts";
import type { RawLogRow } from "@/lib/types";

interface Props {
  rows: RawLogRow[];
}

const AXIS = { fill: "#64748b", fontSize: 11 };
const GRID = { stroke: "#e2e8f0" };
const BAR = "#64748b";

export function LogSummaryCharts({ rows }: Props) {
  const { byDay, topEvents } = useMemo(() => {
    const dayMap = new Map<string, number>();
    const eventMap = new Map<string, number>();

    for (const r of rows) {
      const day = r.timestamp.slice(0, 10);
      dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
      eventMap.set(r.event, (eventMap.get(r.event) ?? 0) + 1);
    }

    const byDay = Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    const topEvents = Array.from(eventMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([event, count]) => ({
        event: event.length > 36 ? `${event.slice(0, 34)}…` : event,
        count,
        fullEvent: event,
      }));

    return { byDay, topEvents };
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
        No rows match the current filters.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Events by day
        </h3>
        <div className="mt-3 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDay} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID.stroke} vertical={false} />
              <XAxis
                dataKey="date"
                tick={AXIS}
                axisLine={{ stroke: GRID.stroke }}
                tickMargin={6}
              />
              <YAxis
                tick={AXIS}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={36}
              />
              <Tooltip
                cursor={{ fill: "oklch(0.95 0.01 250 / 0.6)" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const v = Number(payload[0].value);
                  return (
                    <div className="rounded-md border border-border bg-card px-2.5 py-2 text-xs shadow-sm">
                      <p className="font-medium text-foreground">Date: {String(label)}</p>
                      <p className="mt-1 text-muted-foreground">
                        {Number.isFinite(v) ? v.toLocaleString() : "—"} events
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" name="Events" fill={BAR} radius={[2, 2, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Top event types
        </h3>
        <div className="mt-3 h-52">
          <ResponsiveContainer width="100%" height="100%">
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
                cursor={{ fill: "oklch(0.95 0.01 250 / 0.6)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as { fullEvent: string; count: number };
                  return (
                    <div className="rounded-md border border-border bg-card px-2.5 py-2 text-xs shadow-sm">
                      <p className="max-w-xs break-all font-mono text-[10px] leading-snug text-foreground">
                        {p.fullEvent}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {p.count.toLocaleString()} events
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" name="Count" fill={BAR} radius={[0, 2, 2, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
