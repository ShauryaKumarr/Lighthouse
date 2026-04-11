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

/** Green → yellow → orange → red by severity; blink frequency increases with severity. */
export function priorityVisual(p: LogPriority): {
  dotBg: string;
  stripe: string;
  pulse: string;
} {
  switch (p) {
    case "low":
      return {
        dotBg: "bg-emerald-500",
        stripe: "border-l-emerald-500",
        pulse: "animate-log-pri-low",
      };
    case "normal":
      return {
        dotBg: "bg-yellow-400",
        stripe: "border-l-yellow-400",
        pulse: "animate-log-pri-normal",
      };
    case "high":
      return {
        dotBg: "bg-orange-500",
        stripe: "border-l-orange-500",
        pulse: "animate-log-pri-high",
      };
    case "critical":
      return {
        dotBg: "bg-red-600",
        stripe: "border-l-red-600",
        pulse: "animate-log-pri-critical",
      };
  }
}
