"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { RequestLifecycle } from "@/lib/types";
import { OBSERVATION_LABELS, PREDICTION_LABELS } from "@/lib/types";

interface Props {
  lifecycles: RequestLifecycle[];
}

export function HazardHeatmap({ lifecycles }: Props) {
  const { obsKeys, predKeys, matrix, maxVal } = useMemo(() => {
    const obsSet = new Set<string>();
    const predSet = new Set<string>();
    const cooccurrence: Record<string, Record<string, number>> = {};

    for (const lc of lifecycles) {
      const uniqueObs = [...new Set(lc.observations)];
      const uniquePred = [...new Set(lc.predictions)];

      for (const o of uniqueObs) obsSet.add(o);
      for (const p of uniquePred) predSet.add(p);

      for (const o of uniqueObs) {
        for (const p of uniquePred) {
          if (!cooccurrence[o]) cooccurrence[o] = {};
          cooccurrence[o][p] = (cooccurrence[o][p] || 0) + 1;
        }
      }
    }

    const obsKeys = Array.from(obsSet).sort();
    const predKeys = Array.from(predSet).sort();

    let maxVal = 0;
    const matrix: number[][] = obsKeys.map((o) =>
      predKeys.map((p) => {
        const val = cooccurrence[o]?.[p] ?? 0;
        if (val > maxVal) maxVal = val;
        return val;
      })
    );

    return { obsKeys, predKeys, matrix, maxVal };
  }, [lifecycles]);

  if (obsKeys.length === 0 || predKeys.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Observation / Prediction Co-occurrence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Not enough data to render heatmap.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Observation / Prediction Co-occurrence
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Heatmap showing how often observation types and prediction types
          appear together in the same request.
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-2" />
              {predKeys.map((p) => (
                <th
                  key={p}
                  className="p-2 text-left font-medium text-beacon max-w-[120px] truncate"
                  title={PREDICTION_LABELS[p] ?? p}
                >
                  {PREDICTION_LABELS[p] ?? p.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {obsKeys.map((o, oi) => (
              <tr key={o}>
                <td
                  className="p-2 font-medium text-coral max-w-[160px] truncate text-right"
                  title={OBSERVATION_LABELS[o] ?? o}
                >
                  {OBSERVATION_LABELS[o] ?? o.replace(/_/g, " ")}
                </td>
                {predKeys.map((p, pi) => {
                  const val = matrix[oi][pi];
                  const intensity = maxVal > 0 ? val / maxVal : 0;
                  return (
                    <td key={p} className="p-1">
                      <Tooltip>
                        <TooltipTrigger
                          className="w-10 h-10 rounded-md flex items-center justify-center text-[10px] font-mono cursor-default transition-transform hover:scale-110"
                          style={{
                            backgroundColor:
                              val === 0
                                ? "rgba(30,58,95,0.15)"
                                : `rgba(245,158,11,${0.15 + intensity * 0.75})`,
                            color:
                              intensity > 0.5
                                ? "#0f172a"
                                : "rgba(248,250,252,0.7)",
                          }}
                        >
                          {val > 0 ? val : ""}
                        </TooltipTrigger>
                        <TooltipContent className="bg-navy text-fog border-ocean text-xs">
                          <p>
                            <span className="text-coral">
                              {OBSERVATION_LABELS[o] ?? o}
                            </span>{" "}
                            +{" "}
                            <span className="text-beacon">
                              {PREDICTION_LABELS[p] ?? p}
                            </span>
                          </p>
                          <p className="text-fog/60">
                            {val} co-occurrence{val !== 1 ? "s" : ""}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
