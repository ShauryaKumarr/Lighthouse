"use client";

import { useData } from "@/lib/data-context";
import { PageHero } from "@/components/PageHero";
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
    <div>
      <PageHero
        kicker="Risk intelligence"
        title="Hazard map"
        description="Aggregate view of risk signals across the audit window. See which hazard classes co-occur and how they map to regulatory frameworks."
        maxWidth="7xl"
      />

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <HazardTrendChart lifecycles={lifecycles} />

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <HazardHeatmap lifecycles={lifecycles} />
          <RegulationTags metrics={metrics} />
        </div>
      </div>
    </div>
  );
}
