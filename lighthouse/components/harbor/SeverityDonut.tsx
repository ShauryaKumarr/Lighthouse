"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InterventionEvent } from "@/lib/types";
import { SEVERITY_COLORS } from "@/lib/types";
import { CHART_LEGEND, lightChartTooltip } from "@/lib/chart-theme";

interface Props {
  interventions: InterventionEvent[];
}

export function SeverityDonut({ interventions }: Props) {
  const counts: Record<string, number> = {};
  for (const e of interventions) {
    counts[e.severity] = (counts[e.severity] || 0) + 1;
  }

  const data = Object.entries(counts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: SEVERITY_COLORS[name] ?? "#6b7280",
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Alert Severity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ ...lightChartTooltip }} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: CHART_LEGEND, fontSize: 12 }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
