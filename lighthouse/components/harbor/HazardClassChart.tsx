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
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" opacity={0.3} />
              <XAxis
                type="number"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#1e3a5f" }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={180}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                axisLine={{ stroke: "#1e3a5f" }}
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
