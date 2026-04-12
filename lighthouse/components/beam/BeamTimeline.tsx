"use client";

import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { RequestLifecycle } from "@/lib/types";
import { EVENT_CATEGORY, CATEGORY_COLORS } from "@/lib/types";

interface Props {
  lifecycle: RequestLifecycle;
}

const CATEGORY_LABELS: Record<string, string> = {
  embedding: "Embedding",
  llm: "LLM",
  rules: "Rules",
  observation: "Observation",
  prediction: "Prediction",
  pipeline: "Pipeline",
};

export function BeamTimeline({ lifecycle }: Props) {
  const { bars, totalMs } = useMemo(() => {
    const events = lifecycle.events;
    if (events.length === 0) return { bars: [], totalMs: 1 };

    const baseTime = new Date(events[0].timestamp).getTime();
    const endTime = new Date(events[events.length - 1].timestamp).getTime();
    const totalMs = Math.max(endTime - baseTime, 1);

    const bars = events.map((e, i) => {
      const t = new Date(e.timestamp).getTime();
      const offset = t - baseTime;
      const nextT =
        i < events.length - 1
          ? new Date(events[i + 1].timestamp).getTime()
          : t + 50;
      const duration = Math.max(nextT - t, 20);
      const category = EVENT_CATEGORY[e.event] ?? "pipeline";
      const color = CATEGORY_COLORS[category] ?? "#6b7280";

      return {
        event: e.event,
        offset,
        duration,
        color,
        category,
        meta: e.meta,
        timestamp: e.timestamp,
      };
    });

    return { bars, totalMs };
  }, [lifecycle]);

  const categories = [
    "embedding",
    "llm",
    "rules",
    "observation",
    "prediction",
    "pipeline",
  ];

  const groupedBars = useMemo(() => {
    const groups: Record<string, typeof bars> = {};
    for (const cat of categories) {
      groups[cat] = bars.filter((b) => b.category === cat);
    }
    return groups;
  }, [bars]);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-navy/40 backdrop-blur-md overflow-hidden">
      <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-xs font-medium text-fog/50 uppercase tracking-wider">
          Pipeline Waterfall
        </span>
        <span className="text-xs text-fog/40 font-mono">
          {(totalMs / 1000).toFixed(2)}s &middot; {lifecycle.events.length}{" "}
          events
        </span>
      </div>

      <div className="px-5 py-5">
        <div className="space-y-3">
          {categories.map((cat) => {
            const catBars = groupedBars[cat];
            if (!catBars || catBars.length === 0) return null;
            return (
              <div key={cat} className="flex items-center gap-4">
                <div className="w-24 shrink-0 flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                  />
                  <span className="text-xs font-medium text-fog/60">
                    {CATEGORY_LABELS[cat] ?? cat}
                  </span>
                </div>
                <div className="relative flex-1 h-7 rounded-lg bg-white/[0.04]">
                  {catBars.map((bar, i) => {
                    const left = (bar.offset / totalMs) * 100;
                    const width = Math.max(
                      (bar.duration / totalMs) * 100,
                      0.4
                    );
                    return (
                      <Tooltip key={i}>
                        <TooltipTrigger
                          className="absolute top-1 h-5 rounded-md opacity-80 hover:opacity-100 transition-all duration-150 hover:scale-y-125 cursor-pointer"
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            backgroundColor: bar.color,
                            minWidth: "3px",
                            boxShadow: `0 0 6px -1px ${bar.color}40`,
                          }}
                        />
                        <TooltipContent
                          side="top"
                          className="bg-navy border-ocean text-xs max-w-xs shadow-lg"
                        >
                          <p className="font-semibold text-fog">
                            {bar.event.replace(/_/g, " ")}
                          </p>
                          <p className="text-fog/50 font-mono mt-0.5">
                            {new Date(bar.timestamp)
                              .toISOString()
                              .split("T")[1]}
                          </p>
                          {bar.meta &&
                            Object.keys(bar.meta).length > 0 &&
                            (bar.meta as Record<string, unknown>)._raw ===
                              undefined && (
                              <pre className="mt-1.5 text-[10px] text-fog/50 whitespace-pre-wrap break-all bg-ocean/30 rounded p-1.5">
                                {JSON.stringify(bar.meta, null, 1)}
                              </pre>
                            )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
                <span className="text-[10px] text-fog/40 font-mono w-8 text-right shrink-0">
                  {catBars.length}
                </span>
              </div>
            );
          })}
        </div>

        {/* Time axis markers */}
        <div className="flex items-center mt-4 ml-28 mr-8">
          <div className="flex-1 relative h-px bg-white/[0.08]">
            <span className="absolute left-0 -top-4 text-[10px] text-fog/40 font-mono">
              0s
            </span>
            <span className="absolute left-1/4 -top-4 text-[10px] text-fog/40 font-mono -translate-x-1/2">
              {(totalMs / 4000).toFixed(1)}s
            </span>
            <span className="absolute left-1/2 -top-4 text-[10px] text-fog/40 font-mono -translate-x-1/2">
              {(totalMs / 2000).toFixed(1)}s
            </span>
            <span className="absolute left-3/4 -top-4 text-[10px] text-fog/40 font-mono -translate-x-1/2">
              {((totalMs * 3) / 4000).toFixed(1)}s
            </span>
            <span className="absolute right-0 -top-4 text-[10px] text-fog/40 font-mono">
              {(totalMs / 1000).toFixed(1)}s
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-white/[0.06]">
          {categories.map((cat) => {
            const count = groupedBars[cat]?.length ?? 0;
            if (count === 0) return null;
            return (
              <div key={cat} className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                />
                <span className="text-xs text-fog/50">
                  {CATEGORY_LABELS[cat] ?? cat}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
