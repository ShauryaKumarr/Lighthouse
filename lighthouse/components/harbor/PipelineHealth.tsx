"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DerivedMetrics } from "@/lib/types";

interface Props {
  metrics: DerivedMetrics;
}

interface GaugeRow {
  label: string;
  value: number;
  target: number;
  unit: string;
  inverted?: boolean;
  format?: (v: number) => string;
}

export function PipelineHealth({ metrics }: Props) {
  const gauges: GaugeRow[] = [
    {
      label: "Rule Binding Success",
      value: (1 - metrics.ruleBindingMissRate) * 100,
      target: 95,
      unit: "%",
      format: (v) => `${v.toFixed(0)}%`,
    },
    {
      label: "Avg Observations / Req",
      value: metrics.avgObservationsPerRequest,
      target: 4,
      unit: "",
      inverted: true,
      format: (v) => v.toFixed(1),
    },
    {
      label: "Avg Predictions / Req",
      value: metrics.avgPredictionsPerRequest,
      target: 3,
      unit: "",
      inverted: true,
      format: (v) => v.toFixed(1),
    },
    {
      label: "Avg Embeddings / Req",
      value: metrics.avgEmbeddingsPerRequest,
      target: 5,
      unit: "",
      inverted: true,
      format: (v) => v.toFixed(1),
    },
    {
      label: "Avg LLM Calls / Req",
      value: metrics.avgLlmCallsPerRequest,
      target: 6,
      unit: "",
      inverted: true,
      format: (v) => v.toFixed(1),
    },
    {
      label: "Validation Pass Rate",
      value: metrics.validationPassRate * 100,
      target: -1,
      unit: "%",
      format: (v) => `${v.toFixed(0)}%`,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Pipeline Health</CardTitle>
        <p className="text-xs text-muted-foreground">
          Key performance indicators vs. recommended targets.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {gauges.map((g) => {
          const display = g.format ? g.format(g.value) : `${g.value}`;
          const targetDisplay = g.target === -1 ? "review" : g.format ? g.format(g.target) : `${g.target}`;

          let ratio: number;
          let status: "good" | "warn" | "bad";

          if (g.target === -1) {
            // Special case: 100% pass rate with high signals is suspicious
            status = g.value === 100 ? "warn" : "good";
            ratio = 1;
          } else if (g.inverted) {
            ratio = g.target / Math.max(g.value, 0.01);
            status = ratio >= 0.8 ? "good" : ratio >= 0.4 ? "warn" : "bad";
          } else {
            ratio = g.value / Math.max(g.target, 0.01);
            status = ratio >= 0.8 ? "good" : ratio >= 0.4 ? "warn" : "bad";
          }

          const barPct = Math.min(
            g.inverted ? (g.target / Math.max(g.value, 0.01)) * 100 : (g.value / Math.max(g.target, 1)) * 100,
            100
          );

          const barColor =
            status === "good"
              ? "bg-safe"
              : status === "warn"
                ? "bg-beacon"
                : "bg-coral";

          return (
            <div key={g.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">{g.label}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono font-bold ${
                      status === "good"
                        ? "text-safe"
                        : status === "warn"
                          ? "text-beacon"
                          : "text-coral"
                    }`}
                  >
                    {display}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    / {targetDisplay}
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: g.target === -1 ? "100%" : `${barPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
