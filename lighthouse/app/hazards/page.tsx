"use client";

import { useData } from "@/lib/data-context";
import { HazardHeatmap } from "@/components/hazards/HazardHeatmap";
import { RegulationTags } from "@/components/hazards/RegulationTags";
import { HazardTrendChart } from "@/components/hazards/HazardTrendChart";

export default function HazardsPage() {
  const { loading, error, lifecycles, metrics } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto rounded-full bg-beacon/20 animate-beacon-pulse" />
          <p className="text-muted-foreground text-sm">Loading hazard data...</p>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-destructive">Error: {error ?? "No data"}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hazard Map</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Aggregate view of all risk signals detected across the full audit
          window. Understand which hazard classes co-occur and map them to
          regulatory frameworks.
        </p>
      </div>

      <HazardTrendChart lifecycles={lifecycles} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <HazardHeatmap lifecycles={lifecycles} />
        <RegulationTags metrics={metrics} />
      </div>
    </div>
  );
}
