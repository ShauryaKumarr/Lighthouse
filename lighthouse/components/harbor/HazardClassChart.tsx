"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DerivedMetrics } from "@/lib/types";
import {
  CHART_AXIS,
  CHART_GRID,
  CHART_TICK,
  lightChartTooltip,
} from "@/lib/chart-theme";
import { OBSERVATION_LABELS, PREDICTION_LABELS } from "@/lib/types";

interface Props {
  metrics: DerivedMetrics;
}

export function HazardClassChart({ metrics }: Props) {
  const combined: { name: string; count: number; type: string }[] = [];

  for (const [key, count] of Object.entries(metrics.observationFrequency)) {
    combined.push({
      name: OBSERVATION_LABELS[key] ?? key.replace(/_/g, " "),
      count,
      type: "Observation",
    });
  }
  for (const [key, count] of Object.entries(metrics.predictionFrequency)) {
    combined.push({
      name: PREDICTION_LABELS[key] ?? key.replace(/_/g, " "),
      count,
      type: "Prediction",
    });
  }

  combined.sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top Hazard Classes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={combined.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} opacity={0.85} />
              <XAxis
                type="number"
                tick={{ fill: CHART_TICK, fontSize: 11 }}
                axisLine={{ stroke: CHART_AXIS }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={180}
                tick={{ fill: CHART_TICK, fontSize: 10 }}
                axisLine={{ stroke: CHART_AXIS }}
              />
              <Tooltip contentStyle={{ ...lightChartTooltip }} />
              <Bar
                dataKey="count"
                fill="#f59e0b"
                radius={[0, 4, 4, 0]}
                name="Occurrences"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
