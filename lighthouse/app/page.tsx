"use client";

import { useData } from "@/lib/data-context";
import { HarborStats } from "@/components/harbor/HarborStats";
import { BeaconAlertCard } from "@/components/harbor/BeaconAlertCard";
import { InterventionTimeline } from "@/components/harbor/InterventionTimeline";
import { SeverityDonut } from "@/components/harbor/SeverityDonut";
import { HazardClassChart } from "@/components/harbor/HazardClassChart";
import { PageTransition } from "@/components/PageTransition";
import { FileUpload } from "@/components/FileUpload";

export default function HarborOverview() {
  const { loading, error, metrics, interventions } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto rounded-full bg-beacon/20 animate-beacon-pulse" />
          <p className="text-muted-foreground text-sm">
            Loading audit data...
          </p>
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
    <PageTransition>
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Harbor Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Executive summary of Inhibitor audit activity &mdash; all requests
            evaluated during the drift audit stress test.
          </p>
        </div>
        <FileUpload />
      </div>

      <HarborStats metrics={metrics} interventions={interventions} />

      <InterventionTimeline metrics={metrics} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SeverityDonut interventions={interventions} />
        <HazardClassChart metrics={metrics} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-beacon animate-beacon-pulse inline-block" />
          Beacon Alerts
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {interventions.map((event) => (
            <BeaconAlertCard key={event.request_id} event={event} />
          ))}
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
