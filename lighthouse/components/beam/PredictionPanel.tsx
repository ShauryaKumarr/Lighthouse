"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PREDICTION_LABELS, PREDICTION_REGULATIONS } from "@/lib/types";

interface Props {
  predictions: string[];
}

export function PredictionPanel({ predictions }: Props) {
  if (predictions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Risk Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No risk predictions raised for this request.
          </p>
        </CardContent>
      </Card>
    );
  }

  const counts: Record<string, number> = {};
  for (const p of predictions) {
    counts[p] = (counts[p] || 0) + 1;
  }

  return (
    <Card className="border-beacon/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-beacon" />
          Risk Predictions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(counts).map(([key, count]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-md bg-beacon/5 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">
                  {PREDICTION_LABELS[key] ?? key.replace(/_/g, " ")}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-muted-foreground font-mono">
                    {key}
                  </p>
                  {PREDICTION_REGULATIONS[key] && (
                    <Badge
                      variant="outline"
                      className="text-[10px] border-beacon/40 text-beacon"
                    >
                      {PREDICTION_REGULATIONS[key]}
                    </Badge>
                  )}
                </div>
              </div>
              {count > 1 && (
                <Badge variant="secondary" className="text-xs">
                  x{count}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
