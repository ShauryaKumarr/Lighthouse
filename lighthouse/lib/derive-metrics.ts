import type {
  RequestLifecycle,
  InterventionEvent,
  DerivedMetrics,
} from "./types";

export function deriveMetrics(
  lifecycles: RequestLifecycle[],
  interventions: InterventionEvent[]
): DerivedMetrics {
  const totalRequests = lifecycles.length;
  const totalEvents = lifecycles.reduce((sum, lc) => sum + lc.events.length, 0);
  const avgDurationMs =
    totalRequests > 0
      ? lifecycles.reduce((sum, lc) => sum + lc.durationMs, 0) / totalRequests
      : 0;

  const totalBlocked = interventions.filter(
    (e) => e.action === "blocked" || e.action === "interrupted"
  ).length;

  const observationFrequency: Record<string, number> = {};
  const predictionFrequency: Record<string, number> = {};
  const eventTypeCounts: Record<string, number> = {};
  const allObservationKeys = new Set<string>();
  const allPredictionKeys = new Set<string>();
  const allRuleIds = new Set<string>();

  for (const lc of lifecycles) {
    for (const obs of lc.observations) {
      allObservationKeys.add(obs);
      observationFrequency[obs] = (observationFrequency[obs] || 0) + 1;
    }
    for (const pred of lc.predictions) {
      allPredictionKeys.add(pred);
      predictionFrequency[pred] = (predictionFrequency[pred] || 0) + 1;
    }
    for (const ruleId of lc.ruleIds) {
      allRuleIds.add(ruleId);
    }
    for (const [event, count] of Object.entries(lc.eventCounts)) {
      eventTypeCounts[event] = (eventTypeCounts[event] || 0) + count;
    }
  }

  const hourBuckets: Record<string, number> = {};
  for (const lc of lifecycles) {
    const d = new Date(lc.startTime);
    const hourKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")} ${String(d.getUTCHours()).padStart(2, "0")}:00`;
    hourBuckets[hourKey] = (hourBuckets[hourKey] || 0) + 1;
  }
  const timelinePoints = Object.entries(hourBuckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, count]) => ({ time, count }));

  return {
    totalRequests,
    totalEvents,
    avgDurationMs,
    totalBlocked,
    totalObservations: Array.from(allObservationKeys).length,
    totalPredictions: Array.from(allPredictionKeys).length,
    uniqueObservationKeys: Array.from(allObservationKeys).sort(),
    uniquePredictionKeys: Array.from(allPredictionKeys).sort(),
    uniqueRuleIds: Array.from(allRuleIds).sort(),
    eventTypeCounts,
    observationFrequency,
    predictionFrequency,
    timelinePoints,
  };
}
