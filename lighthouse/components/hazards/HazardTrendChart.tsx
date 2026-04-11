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
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RequestLifecycle } from "@/lib/types";

interface Props {
  lifecycles: RequestLifecycle[];
}

export function HazardTrendChart({ lifecycles }: Props) {
  const data = useMemo(() => {
    const buckets: Record<
      string,
      { observations: number; predictions: number }
    > = {};

    for (const lc of lifecycles) {
      const d = new Date(lc.startTime);
      const hourKey = `${String(d.getUTCHours()).padStart(2, "0")}:00`;
      if (!buckets[hourKey]) {
        buckets[hourKey] = { observations: 0, predictions: 0 };
      }
      buckets[hourKey].observations += lc.observations.length;
      buckets[hourKey].predictions += lc.predictions.length;
    }

    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([time, vals]) => ({ time, ...vals }));
  }, [lifecycles]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Hazard Signals Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e3a5f"
                opacity={0.3}
              />
              <XAxis
                dataKey="time"
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
              <Legend
                formatter={(value) => (
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey="observations"
                fill="#ef4444"
                name="Observations"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="predictions"
                fill="#f59e0b"
                name="Predictions"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
