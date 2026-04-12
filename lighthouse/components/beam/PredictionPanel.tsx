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
      <div className="rounded-2xl border border-white/[0.08] bg-navy/40 backdrop-blur-md overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-fog/50" />
          <span className="text-xs font-medium text-fog/50 uppercase tracking-wider">
            Predictions
          </span>
        </div>
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-fog/50">
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
    <div className="rounded-2xl border border-beacon/25 bg-navy/40 backdrop-blur-md overflow-hidden shadow-[0_0_30px_-10px_rgba(245,158,11,0.1)]">
      <div className="px-5 py-3 border-b border-beacon/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-beacon shadow-[0_0_8px_2px_rgba(245,158,11,0.3)]" />
          <span className="text-xs font-medium text-fog/50 uppercase tracking-wider">
            Predictions
          </span>
        </div>
        <span className="text-xs text-beacon font-medium">
          {predictions.length} raised
        </span>
      </div>
      <div className="divide-y divide-white/[0.05]">
        {Object.entries(counts).map(([key, count]) => (
          <div
            key={key}
            className="px-5 py-3.5 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium leading-snug text-fog">
                {PREDICTION_LABELS[key] ?? key.replace(/_/g, " ")}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[11px] text-fog/40 font-mono truncate">
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
