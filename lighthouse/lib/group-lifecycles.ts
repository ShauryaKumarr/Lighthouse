import type { RawLogRow, RequestLifecycle } from "./types";

export function groupLifecycles(rows: RawLogRow[]): RequestLifecycle[] {
  const authRows = rows.filter((r) => r.event === "auth_failed_invalid_key");
  const validRows = rows.filter(
    (r) => r.event !== "auth_failed_invalid_key" && r.apiKey !== "anon"
  );

  const lifecycles: RequestLifecycle[] = [];
  let currentEvents: RawLogRow[] = [];
  let lifecycleIndex = 0;

  for (const row of validRows) {
    currentEvents.push(row);

    if (row.event === "inhibition_final_validation") {
      const lc = buildLifecycle(lifecycleIndex, currentEvents);
      if (lc) {
        lifecycles.push(lc);
        lifecycleIndex++;
      }
      currentEvents = [];
    }
  }

  if (currentEvents.length > 0) {
    const lc = buildLifecycle(lifecycleIndex, currentEvents);
    if (lc) {
      lifecycles.push(lc);
    }
  }

  void authRows;

  return lifecycles;
}

function buildLifecycle(
  index: number,
  events: RawLogRow[]
): RequestLifecycle | null {
  if (events.length === 0) return null;

  const timestamps = events
    .map((e) => new Date(e.timestamp).getTime())
    .filter((t) => !isNaN(t));
  const startTime = events[0].timestamp;
  const endTime = events[events.length - 1].timestamp;
  const durationMs =
    timestamps.length >= 2
      ? Math.max(...timestamps) - Math.min(...timestamps)
      : 0;

  const observations: string[] = [];
  const predictions: string[] = [];
  const ruleIds = new Set<string>();
  const eventCounts: Record<string, number> = {};

  let rulesPassed = true;
  let validationSuccess = true;

  for (const e of events) {
    eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;

    if (e.event === "inhibition_observation_description_response") {
      const key = (e.meta as Record<string, unknown>)?.key;
      if (typeof key === "string") observations.push(key);
    }

    if (e.event === "inhibition_prediction_reason_response") {
      const key = (e.meta as Record<string, unknown>)?.key;
      if (typeof key === "string") predictions.push(key);
    }

    if (
      e.event === "rules_inhibition_rule_start" ||
      e.event === "rules_inhibition_rule_passed"
    ) {
      const ruleId = (e.meta as Record<string, unknown>)?.ruleId;
      if (typeof ruleId === "string") ruleIds.add(ruleId);
    }

    if (e.event === "rules_inhibition_complete") {
      const passed = (e.meta as Record<string, unknown>)?.passed;
      if (passed === false) rulesPassed = false;
    }

    if (e.event === "inhibition_final_validation") {
      const success = (e.meta as Record<string, unknown>)?.validationSuccess;
      if (success === false) validationSuccess = false;
    }
  }

  return {
    index,
    apiKey: events[0].apiKey,
    startTime,
    endTime,
    durationMs,
    events,
    observations,
    predictions,
    ruleIds: Array.from(ruleIds),
    rulesPassed,
    validationSuccess,
    eventCounts,
  };
}
