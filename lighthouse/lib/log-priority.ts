export type LogPriority = "critical" | "high" | "normal" | "low";

const CRITICAL = new Set([
  "auth_failed_invalid_key",
  "rules_inhibition_rule_binding_missing",
  "rules_extraction_value_missing",
]);

const HIGH = new Set([
  "inhibition_observation_description_response",
  "inhibition_prediction_reason_response",
  "inhibition_final_validation",
  "rules_inhibition_rule_start",
]);

const LOW = new Set(["rules_inhibition_rule_passed", "request_success"]);

export function getLogPriority(event: string): LogPriority {
  if (CRITICAL.has(event)) return "critical";
  if (HIGH.has(event)) return "high";
  if (LOW.has(event)) return "low";
  return "normal";
}

export function priorityBlinkClass(p: LogPriority): string | undefined {
  if (p === "critical") return "animate-log-blink-critical";
  if (p === "high") return "animate-log-blink-high";
  return undefined;
}
