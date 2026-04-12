"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
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

const LINE = "#15803d";
const FILL = "url(#logVolumeFill)";

export function LogVolumeAreaChart({ rows }: Props) {
  const data = useMemo(() => {
    const minuteMap = new Map<string, number>();
    for (const r of rows) {
      const minute = r.timestamp.slice(0, 16);
      minuteMap.set(minute, (minuteMap.get(minute) ?? 0) + 1);
    }
    return Array.from(minuteMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([slot, count]) => ({
        slot,
        label: slot.length >= 16 ? slot.slice(11, 16) : slot,
        events: count,
      }));
  }, [rows]);

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-500">
        No timeline data in the current window.
      </div>
    );
  }

  return (
    <div className="w-full px-2 pt-2" style={{ height: 224 }}>
      <ResponsiveContainer width="100%" height={224}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="logVolumeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={LINE} stopOpacity={0.35} />
              <stop offset="95%" stopColor={LINE} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            tickMargin={8}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={36}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload as { slot: string; events: number };
              return (
                <div className="rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs shadow-md">
                  <p className="font-mono text-[10px] text-slate-600">{row.slot}</p>
                  <p className="mt-0.5 font-medium text-slate-900">
                    {row.events.toLocaleString()} events
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="events"
            name="Events"
            stroke={LINE}
            strokeWidth={2}
            fill={FILL}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
