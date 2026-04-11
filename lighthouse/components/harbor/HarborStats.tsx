"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { DerivedMetrics, InterventionEvent } from "@/lib/types";

interface Props {
  metrics: DerivedMetrics;
  interventions: InterventionEvent[];
}

export function HarborStats({ metrics, interventions }: Props) {
  const stats = [
    {
      label: "Requests Processed",
      value: metrics.totalRequests.toLocaleString(),
      sub: "Safe passages through the Inhibitor",
      icon: "⚓",
    },
    {
      label: "Beacon Alerts",
      value: interventions.length.toLocaleString(),
      sub: `${metrics.totalBlocked} blocked or interrupted`,
      icon: "🔔",
      highlight: true,
    },
    {
      label: "Risk Signals Detected",
      value: (
        metrics.uniqueObservationKeys.length +
        metrics.uniquePredictionKeys.length
      ).toLocaleString(),
      sub: `${metrics.uniqueObservationKeys.length} observations, ${metrics.uniquePredictionKeys.length} predictions`,
      icon: "📡",
    },
    {
      label: "Avg. Processing Time",
      value: `${(metrics.avgDurationMs / 1000).toFixed(1)}s`,
      sub: `${metrics.totalEvents.toLocaleString()} pipeline events total`,
      icon: "⏱",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className={`relative overflow-hidden ${
            stat.highlight ? "border-beacon/50" : "border-border"
          }`}
        >
          {stat.highlight && (
            <div className="absolute inset-x-0 top-0 h-1 bg-beacon animate-beacon-pulse" />
          )}
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
