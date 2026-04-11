"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PREDICTION_LABELS,
  PREDICTION_REGULATIONS,
} from "@/lib/types";
import type { DerivedMetrics } from "@/lib/types";

interface Props {
  metrics: DerivedMetrics;
}

const REGULATION_DESCRIPTIONS: Record<string, string> = {
  "GDPR Art. 13-14":
    "Right to transparent information about automated decision-making.",
  "EU AI Act Art. 14":
    "Human oversight requirements for high-risk AI systems.",
  "EU AI Act Art. 10":
    "Data governance and quality requirements to prevent bias.",
  "CCPA §1798.100":
    "California consumer right to know about personal data collection.",
  "EU AI Act":
    "European regulation on artificial intelligence systems.",
  "General Compliance":
    "General output quality and safety compliance requirements.",
};

export function RegulationTags({ metrics }: Props) {
  const predictions = metrics.uniquePredictionKeys;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Regulation Mapping</CardTitle>
        <p className="text-xs text-muted-foreground">
          Risk predictions mapped to specific regulatory frameworks.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {predictions.map((key) => {
            const regulation = PREDICTION_REGULATIONS[key] ?? "Unknown";
            const freq = metrics.predictionFrequency[key] ?? 0;
            return (
              <div
                key={key}
                className="rounded-lg bg-muted/30 p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {PREDICTION_LABELS[key] ?? key.replace(/_/g, " ")}
                  </span>
                  <Badge variant="outline" className="text-xs border-beacon/40 text-beacon">
                    {regulation}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {REGULATION_DESCRIPTIONS[regulation] ??
                    "Regulatory requirement for AI system compliance."}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-beacon"
                      style={{
                        width: `${Math.min((freq / Math.max(...Object.values(metrics.predictionFrequency))) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {freq}x
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
