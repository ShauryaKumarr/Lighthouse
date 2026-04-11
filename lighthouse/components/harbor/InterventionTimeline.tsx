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
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="beaconGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" opacity={0.3} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#1e3a5f" }}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#1e3a5f" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #1e3a5f",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  fontSize: 12,
                }}
              />
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
