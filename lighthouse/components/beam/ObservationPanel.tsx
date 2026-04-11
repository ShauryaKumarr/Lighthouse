"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OBSERVATION_LABELS } from "@/lib/types";

interface Props {
  observations: string[];
}

export function ObservationPanel({ observations }: Props) {
  if (observations.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Observations Detected</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No risk observations flagged for this request.
          </p>
        </CardContent>
      </Card>
    );
  }

  const counts: Record<string, number> = {};
  for (const o of observations) {
    counts[o] = (counts[o] || 0) + 1;
  }

  return (
    <Card className="border-coral/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-coral" />
          Observations Detected
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(counts).map(([key, count]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-md bg-coral/5 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">
                  {OBSERVATION_LABELS[key] ?? key.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {key}
                </p>
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
