"use client";

import { useData } from "@/lib/data-context";
import { HarborStats } from "@/components/harbor/HarborStats";
import { DiagnosticFindings } from "@/components/harbor/DiagnosticFindings";
import { PipelineHealth } from "@/components/harbor/PipelineHealth";
import { BeaconAlertCard } from "@/components/harbor/BeaconAlertCard";
import { InterventionTimeline } from "@/components/harbor/InterventionTimeline";
import { SeverityDonut } from "@/components/harbor/SeverityDonut";
import { HazardClassChart } from "@/components/harbor/HazardClassChart";
import { PageTransition } from "@/components/PageTransition";
import { PageHero } from "@/components/PageHero";
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

  const criticalCount = metrics.findings.filter(
    (f) => f.severity === "critical"
  ).length;

  const heroDescription = (
    <>
      Inhibitor drift audit diagnostics — {metrics.totalRequests} requests across{" "}
      {metrics.totalEvents.toLocaleString()} pipeline events.
      {criticalCount > 0 ? (
        <span className="font-medium text-coral">
          {" "}
          {criticalCount} critical finding{criticalCount > 1 ? "s" : ""} require attention.
        </span>
      ) : null}
    </>
  );

  return (
    <PageTransition>
      <PageHero
        kicker="Audit operations"
        title="Harbor overview"
        description={heroDescription}
        maxWidth="7xl"
      >
        <FileUpload />
      </PageHero>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        {/* Priority 1: KPI Stats (diagnostic-weighted) */}
        <HarborStats metrics={metrics} interventions={interventions} />

        {/* Priority 2: Diagnostic Findings (ranked by impact) */}
        {metrics.findings.length > 0 && (
          <DiagnosticFindings findings={metrics.findings} />
        )}

        {/* Priority 3: Pipeline Health gauges + Timeline */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <PipelineHealth metrics={metrics} />
          <div className="lg:col-span-2">
            <InterventionTimeline metrics={metrics} />
          </div>
        </div>

        {/* Priority 4: Signal distribution */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <SeverityDonut interventions={interventions} />
          <HazardClassChart metrics={metrics} />
        </div>

        {/* Priority 5: Beacon Alerts (intervention details) */}
        {interventions.length > 0 && (
          <div className="space-y-5">
            <div>
              <p className="pro-kicker text-brand">Live inbox</p>
              <h2 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight">
                <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-beacon animate-beacon-pulse" />
                Beacon alerts
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Recent Inhibitor interventions with proposed vs. corrected agent actions.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {interventions.map((event) => (
                <BeaconAlertCard key={event.request_id} event={event} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
