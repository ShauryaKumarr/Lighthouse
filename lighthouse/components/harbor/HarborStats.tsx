"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { DerivedMetrics, InterventionEvent } from "@/lib/types";

interface Props {
  metrics: DerivedMetrics;
  interventions: InterventionEvent[];
}

export function HarborStats({ metrics, interventions }: Props) {
  const criticalFindings = metrics.findings.filter(
    (f) => f.severity === "critical"
  ).length;
  const auditFlags = metrics.findings.filter((f) => f.auditFlag).length;

  const stats = [
    {
      label: "Critical Findings",
      value: criticalFindings.toLocaleString(),
      sub: `${auditFlags} require audit escalation`,
      highlight: criticalFindings > 0 ? "critical" as const : undefined,
    },
    {
      label: "Rule Binding Success",
      value: `${((1 - metrics.ruleBindingMissRate) * 100).toFixed(0)}%`,
      sub: `Target: >95% — enforcement is ${metrics.ruleBindingMissRate > 0.5 ? "disabled" : "active"}`,
      highlight: metrics.ruleBindingMissRate > 0.5 ? "critical" as const : undefined,
    },
    {
      label: "Requests Processed",
      value: metrics.totalRequests.toLocaleString(),
      sub: `${metrics.totalEvents.toLocaleString()} pipeline events over ~26hr window`,
    },
    {
      label: "Beacon Alerts",
      value: interventions.length.toLocaleString(),
      sub: `${metrics.totalBlocked} blocked or interrupted`,
      highlight: interventions.length > 0 ? "warn" as const : undefined,
    },
    {
      label: "Avg Observations / Req",
      value: metrics.avgObservationsPerRequest.toFixed(1),
      sub: `Target: 2-4 — ${metrics.avgObservationsPerRequest > 5 ? "alert fatigue risk" : "within range"}`,
      highlight: metrics.avgObservationsPerRequest > 5 ? "warn" as const : undefined,
    },
    {
      label: "Avg Embeddings / Req",
      value: metrics.avgEmbeddingsPerRequest.toFixed(1),
      sub: `Target: 1-5 batched — ${metrics.avgEmbeddingsPerRequest > 10 ? "unbatched" : "OK"}`,
      highlight: metrics.avgEmbeddingsPerRequest > 10 ? "warn" as const : undefined,
    },
    {
      label: "Validation Pass Rate",
      value: `${(metrics.validationPassRate * 100).toFixed(0)}%`,
      sub:
        metrics.validationPassRate === 1 && metrics.avgPredictionsPerRequest > 3
          ? "Suspicious — high risk signals but 100% pass"
          : "Threshold appears calibrated",
      highlight:
        metrics.validationPassRate === 1 && metrics.avgPredictionsPerRequest > 3
          ? "critical" as const
          : undefined,
    },
    {
      label: "Auth Probes Detected",
      value: metrics.authFailures.toLocaleString(),
      sub: metrics.authFailures > 0 ? "Includes .env credential harvesting" : "No unauthorized attempts",
      highlight: metrics.authFailures > 0 ? "low" as const : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const borderClass =
          stat.highlight === "critical"
            ? "border-coral/50"
            : stat.highlight === "warn"
              ? "border-beacon/50"
              : stat.highlight === "low"
                ? "border-sky-500/30"
                : "border-border";

        const topBarClass =
          stat.highlight === "critical"
            ? "bg-coral"
            : stat.highlight === "warn"
              ? "bg-beacon"
              : null;

        return (
          <Card
            key={stat.label}
            className={`relative overflow-hidden ${borderClass}`}
          >
            {topBarClass && (
              <div
                className={`absolute inset-x-0 top-0 h-1 ${topBarClass} animate-beacon-pulse`}
              />
            )}
            <CardContent className="p-5">
              <p className="pro-kicker text-muted-foreground">{stat.label}</p>
              <p
                className={`text-2xl font-bold tracking-tight mt-1 ${
                  stat.highlight === "critical"
                    ? "text-coral"
                    : stat.highlight === "warn"
                      ? "text-beacon"
                      : ""
                }`}
              >
                {stat.value}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                {stat.sub}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
