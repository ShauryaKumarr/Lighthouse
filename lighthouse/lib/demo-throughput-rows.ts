import type { RawLogRow } from "@/lib/types";

const DEMO_EVENTS = [
  "embedding_start",
  "embedding_complete",
  "llm_prompt_start",
  "llm_prompt_complete",
  "rules_inhibition_rule_passed",
  "rules_inhibition_rule_start",
  "inhibition_observation_description_response",
  "inhibition_prediction_reason_response",
  "request_success",
  "inhibition_final_validation",
] as const;

/**
 * Synthetic rows spread across recent minutes so throughput charts always have
 * a visible timeline and event mix (merged with real stream data in the UI).
 */
export function buildDemoThroughputRows(): RawLogRow[] {
  const rows: RawLogRow[] = [];
  let idx = -10_000;
  for (let m = 58; m >= 0; m -= 2) {
    const base = Date.now() - m * 60_000;
    const n = 2 + ((Math.floor(m / 2) % 5) + 1);
    for (let k = 0; k < n; k++) {
      const ts = new Date(base + k * 1_400).toISOString();
      rows.push({
        index: idx--,
        timestamp: ts,
        apiKey: "__throughput_demo__",
        event: DEMO_EVENTS[(m + k) % DEMO_EVENTS.length],
        meta: { _throughputDemo: true },
      });
    }
  }
  return rows;
}
