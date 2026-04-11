"use client";

import { use } from "react";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { BeamTimeline } from "@/components/beam/BeamTimeline";
import { ObservationPanel } from "@/components/beam/ObservationPanel";
import { PredictionPanel } from "@/components/beam/PredictionPanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BeamDetailPage({
  params,
}: {
  params: Promise<{ requestIndex: string }>;
}) {
  const { requestIndex } = use(params);
  const { loading, error, lifecycles } = useData();
  const idx = parseInt(requestIndex, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 mx-auto rounded-full bg-beacon/20 animate-beacon-pulse" />
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

  const lifecycle = lifecycles[idx];
  if (!lifecycle) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-destructive">Request #{idx + 1} not found.</p>
        <Link href="/beam" className="text-sm text-beacon hover:underline mt-2 inline-block">
          &larr; Back to all traces
        </Link>
      </div>
    );
  }

  const prevIdx = idx > 0 ? idx - 1 : null;
  const nextIdx = idx < lifecycles.length - 1 ? idx + 1 : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/beam"
            className="text-xs text-beacon hover:underline mb-1 inline-block"
          >
            &larr; All Traces
          </Link>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            The Beam &mdash; Request #{idx + 1}
            <Badge
              variant={lifecycle.validationSuccess ? "secondary" : "destructive"}
            >
              {lifecycle.validationSuccess ? "Safe Passage" : "Flagged"}
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {lifecycle.startTime} &rarr; {lifecycle.endTime}
          </p>
        </div>

        <div className="flex gap-2">
          {prevIdx !== null && (
            <Link
              href={`/beam/${prevIdx}`}
              className="text-xs text-muted-foreground hover:text-beacon transition-colors"
            >
              &larr; Prev
            </Link>
          )}
          {nextIdx !== null && (
            <Link
              href={`/beam/${nextIdx}`}
              className="text-xs text-muted-foreground hover:text-beacon transition-colors"
            >
              Next &rarr;
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{lifecycle.events.length}</p>
            <p className="text-xs text-muted-foreground">Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {(lifecycle.durationMs / 1000).toFixed(1)}s
            </p>
            <p className="text-xs text-muted-foreground">Duration</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-coral">
              {lifecycle.observations.length}
            </p>
            <p className="text-xs text-muted-foreground">Observations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-beacon">
              {lifecycle.predictions.length}
            </p>
            <p className="text-xs text-muted-foreground">Predictions</p>
          </CardContent>
        </Card>
      </div>

      <BeamTimeline lifecycle={lifecycle} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ObservationPanel observations={lifecycle.observations} />
        <PredictionPanel predictions={lifecycle.predictions} />
      </div>

      {lifecycle.ruleIds.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Rules Evaluated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lifecycle.ruleIds.map((ruleId) => (
                <Badge key={ruleId} variant="outline" className="font-mono text-xs">
                  {ruleId}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              All rules {lifecycle.rulesPassed ? "passed" : "had violations"}{" "}
              &middot; Final validation{" "}
              {lifecycle.validationSuccess ? "succeeded" : "failed"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
