"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DerivedMetrics } from "@/lib/types";
import {
  CHART_AXIS,
  CHART_GRID,
  CHART_TICK,
  lightChartTooltip,
} from "@/lib/chart-theme";

interface Props {
  metrics: DerivedMetrics;
}

export function InterventionTimeline({ metrics }: Props) {
  const data = metrics.timelinePoints.map((p) => ({
    ...p,
    label: p.time.split(" ")[1] ?? p.time,
  }));

  return (
    <Card>
      <CardHeader className="space-y-1.5 pb-3">
        <p className="pro-kicker text-brand">Load profile</p>
        <CardTitle className="text-lg font-semibold tracking-tight">
          Request volume
        </CardTitle>
        <CardDescription className="text-sm">
          Requests observed across the simulated audit window (hourly buckets).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 256 }}>
          <ResponsiveContainer width="100%" height={256}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="beaconGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} opacity={0.85} />
              <XAxis
                dataKey="label"
                tick={{ fill: CHART_TICK, fontSize: 11 }}
                axisLine={{ stroke: CHART_AXIS }}
              />
              <YAxis
                tick={{ fill: CHART_TICK, fontSize: 11 }}
                axisLine={{ stroke: CHART_AXIS }}
                allowDecimals={false}
              />
              <Tooltip contentStyle={{ ...lightChartTooltip }} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#beaconGrad)"
                name="Requests"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
