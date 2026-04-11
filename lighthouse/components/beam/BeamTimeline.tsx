"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Pipeline Waterfall</CardTitle>
        <p className="text-xs text-muted-foreground">
          Total duration: {(totalMs / 1000).toFixed(2)}s &middot;{" "}
          {lifecycle.events.length} events
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {categories.map((cat) => {
            const catBars = groupedBars[cat];
            if (!catBars || catBars.length === 0) return null;
            return (
              <div key={cat} className="flex items-center gap-3">
                <span
                  className="w-24 text-right text-xs font-medium capitalize shrink-0"
                  style={{ color: CATEGORY_COLORS[cat] }}
                >
                  {cat}
                </span>
                <div className="relative flex-1 h-6 rounded bg-muted/30">
                  {catBars.map((bar, i) => {
                    const left = (bar.offset / totalMs) * 100;
                    const width = Math.max(
                      (bar.duration / totalMs) * 100,
                      0.3
                    );
                    return (
                      <Tooltip key={i}>
                        <TooltipTrigger
                          className="absolute top-0.5 h-5 rounded-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            backgroundColor: bar.color,
                            minWidth: "2px",
                          }}
                        />
                        <TooltipContent
                          side="top"
                          className="bg-navy text-fog border-ocean text-xs max-w-xs"
                        >
                          <p className="font-semibold">{bar.event}</p>
                          <p className="text-fog/70">
                            {new Date(bar.timestamp).toISOString().split("T")[1]}
                          </p>
                          {bar.meta &&
                            Object.keys(bar.meta).length > 0 &&
                            (bar.meta as Record<string, unknown>)._raw ===
                              undefined && (
                              <pre className="mt-1 text-[10px] text-fog/60 whitespace-pre-wrap break-all">
                                {JSON.stringify(bar.meta, null, 1)}
                              </pre>
                            )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: CATEGORY_COLORS[cat] }}
              />
              <span className="text-xs text-muted-foreground capitalize">
                {cat}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
