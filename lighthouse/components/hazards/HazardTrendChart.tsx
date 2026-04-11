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
import {
  CHART_AXIS,
  CHART_GRID,
  CHART_LEGEND,
  CHART_TICK,
  lightChartTooltip,
} from "@/lib/chart-theme";

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
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} opacity={0.85} />
              <XAxis
                dataKey="time"
                tick={{ fill: CHART_TICK, fontSize: 11 }}
                axisLine={{ stroke: CHART_AXIS }}
              />
              <YAxis
                tick={{ fill: CHART_TICK, fontSize: 11 }}
                axisLine={{ stroke: CHART_AXIS }}
                allowDecimals={false}
              />
              <Tooltip contentStyle={{ ...lightChartTooltip }} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: CHART_LEGEND, fontSize: 12 }}>
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
