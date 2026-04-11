"use client";

import { Badge } from "@/components/ui/badge";
import { PREDICTION_LABELS, PREDICTION_REGULATIONS } from "@/lib/types";
import { Zap } from "lucide-react";

interface Props {
  predictions: string[];
}

export function PredictionPanel({ predictions }: Props) {
  if (predictions.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border/40 flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Predictions
          </span>
        </div>
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No risk predictions raised.
          </p>
        </div>
      </div>
    );
  }

  const counts: Record<string, number> = {};
  for (const p of predictions) {
    counts[p] = (counts[p] || 0) + 1;
  }

  return (
    <div className="rounded-2xl border border-beacon/20 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-beacon/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-beacon" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Predictions
          </span>
        </div>
        <span className="text-xs text-beacon font-medium">
          {predictions.length} raised
        </span>
      </div>
      <div className="divide-y divide-border/20">
        {Object.entries(counts).map(([key, count]) => (
          <div
            key={key}
            className="px-5 py-3.5 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium leading-snug">
                {PREDICTION_LABELS[key] ?? key.replace(/_/g, " ")}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[11px] text-muted-foreground font-mono truncate">
                  {key}
                </p>
                {PREDICTION_REGULATIONS[key] && (
                  <span className="inline-flex items-center rounded-md border border-beacon/30 bg-beacon/5 px-1.5 py-0.5 text-[10px] font-medium text-beacon shrink-0">
                    {PREDICTION_REGULATIONS[key]}
                  </span>
                )}
              </div>
            </div>
            {count > 1 && (
              <Badge variant="secondary" className="text-[10px] shrink-0">
                &times;{count}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
