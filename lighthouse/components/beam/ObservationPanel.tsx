"use client";

import { Badge } from "@/components/ui/badge";
import { OBSERVATION_LABELS } from "@/lib/types";
import { Eye } from "lucide-react";

interface Props {
  observations: string[];
}

export function ObservationPanel({ observations }: Props) {
  if (observations.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-navy/40 backdrop-blur-md overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-fog/50" />
          <span className="text-xs font-medium text-fog/50 uppercase tracking-wider">
            Observations
          </span>
        </div>
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-fog/50">
            No risk observations flagged.
          </p>
        </div>
      </div>
    );
  }

  const counts: Record<string, number> = {};
  for (const o of observations) {
    counts[o] = (counts[o] || 0) + 1;
  }

  return (
    <div className="rounded-2xl border border-coral/25 bg-navy/40 backdrop-blur-md overflow-hidden shadow-[0_0_30px_-10px_rgba(239,68,68,0.1)]">
      <div className="px-5 py-3 border-b border-coral/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-coral shadow-[0_0_8px_2px_rgba(239,68,68,0.3)]" />
          <span className="text-xs font-medium text-fog/50 uppercase tracking-wider">
            Observations
          </span>
        </div>
        <span className="text-xs text-coral font-medium">
          {observations.length} detected
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
                {OBSERVATION_LABELS[key] ?? key.replace(/_/g, " ")}
              </p>
              <p className="text-[11px] text-fog/40 font-mono mt-0.5 truncate">
                {key}
              </p>
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
