"use client";

import Link from "next/link";
import { useData } from "@/lib/data-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BeamListPage() {
  const { loading, error, lifecycles } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto rounded-full bg-beacon/20 animate-beacon-pulse" />
          <p className="text-muted-foreground text-sm">
            Loading request traces...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">The Beam</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Shine light on the Inhibitor&apos;s internal reasoning. Select a
          request trace to explore its full pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lifecycles.map((lc) => (
          <Link key={lc.index} href={`/beam/${lc.index}`}>
            <Card className="hover:border-beacon/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    Request #{lc.index + 1}
                  </span>
                  <Badge
                    variant={lc.validationSuccess ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {lc.validationSuccess ? "Safe Passage" : "Flagged"}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    {lc.events.length} events
                  </span>
                  <span className="text-xs text-muted-foreground">&middot;</span>
                  <span className="text-xs text-muted-foreground">
                    {(lc.durationMs / 1000).toFixed(1)}s
                  </span>
                  {lc.observations.length > 0 && (
                    <>
                      <span className="text-xs text-muted-foreground">
                        &middot;
                      </span>
                      <span className="text-xs text-coral">
                        {lc.observations.length} obs
                      </span>
                    </>
                  )}
                  {lc.predictions.length > 0 && (
                    <>
                      <span className="text-xs text-muted-foreground">
                        &middot;
                      </span>
                      <span className="text-xs text-beacon">
                        {lc.predictions.length} pred
                      </span>
                    </>
                  )}
                </div>

                <p className="text-[11px] text-muted-foreground font-mono truncate">
                  {new Date(lc.startTime).toISOString()}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
