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

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Harbor Overview
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Inhibitor drift audit diagnostics &mdash;{" "}
              {metrics.totalRequests} requests across{" "}
              {metrics.totalEvents.toLocaleString()} pipeline events.
              {criticalCount > 0 && (
                <span className="text-coral font-medium">
                  {" "}
                  {criticalCount} critical finding
                  {criticalCount > 1 ? "s" : ""} require attention.
                </span>
              )}
            </p>
          </div>
          <FileUpload />
        </div>

        {/* Priority 1: KPI Stats (diagnostic-weighted) */}
        <HarborStats metrics={metrics} interventions={interventions} />

        {/* Priority 2: Diagnostic Findings (ranked by impact) */}
        {metrics.findings.length > 0 && (
          <DiagnosticFindings findings={metrics.findings} />
        )}

        {/* Priority 3: Pipeline Health gauges + Timeline */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <PipelineHealth metrics={metrics} />
          <div className="lg:col-span-2">
            <InterventionTimeline metrics={metrics} />
          </div>
        </div>

        {/* Priority 4: Signal distribution */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SeverityDonut interventions={interventions} />
          <HazardClassChart metrics={metrics} />
        </div>

        {/* Priority 5: Beacon Alerts (intervention details) */}
        {interventions.length > 0 && (
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
        )}
      </div>
    </PageTransition>
  );
}
