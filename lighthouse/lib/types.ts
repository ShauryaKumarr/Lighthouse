export interface RawLogRow {
  index: number;
  timestamp: string;
  apiKey: string;
  event: string;
  meta: Record<string, unknown>;
}

export interface InterventionEvent {
  timestamp: string;
  agent_id: string;
  request_id: string;
  mode: string;
  policy_trigger: string;
  severity: "high" | "medium" | "low";
  action: "blocked" | "interrupted" | "warned";
  reason: string;
  proposed_action: string;
  corrected_action: string;
}

export type EventType =
  | "embedding_start"
  | "embedding_complete"
  | "llm_prompt_start"
  | "llm_prompt_complete"
  | "inhibition_observation_description_response"
  | "inhibition_prediction_reason_response"
  | "rules_inhibition_rule_start"
  | "rules_inhibition_rule_passed"
  | "rules_inhibition_rule_binding_missing"
  | "rules_extraction_value_missing"
  | "rules_inhibition_complete"
  | "inhibition_describe_result_validation"
  | "inhibition_final_validation"
  | "request_success"
  | "auth_failed_invalid_key";

export interface RequestLifecycle {
  index: number;
  apiKey: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  events: RawLogRow[];
  observations: string[];
  predictions: string[];
  ruleIds: string[];
  rulesPassed: boolean;
  validationSuccess: boolean;
  eventCounts: Record<string, number>;
}

export interface DerivedMetrics {
  totalRequests: number;
  totalEvents: number;
  avgDurationMs: number;
  totalBlocked: number;
  totalObservations: number;
  totalPredictions: number;
  uniqueObservationKeys: string[];
  uniquePredictionKeys: string[];
  uniqueRuleIds: string[];
  eventTypeCounts: Record<string, number>;
  observationFrequency: Record<string, number>;
  predictionFrequency: Record<string, number>;
  timelinePoints: { time: string; count: number }[];
}

export const EVENT_CATEGORY: Record<string, string> = {
  embedding_start: "embedding",
  embedding_complete: "embedding",
  llm_prompt_start: "llm",
  llm_prompt_complete: "llm",
  inhibition_observation_description_response: "observation",
  inhibition_prediction_reason_response: "prediction",
  rules_inhibition_rule_start: "rules",
  rules_inhibition_rule_passed: "rules",
  rules_inhibition_rule_binding_missing: "rules",
  rules_extraction_value_missing: "rules",
  rules_inhibition_complete: "pipeline",
  inhibition_describe_result_validation: "pipeline",
  inhibition_final_validation: "pipeline",
  request_success: "pipeline",
  auth_failed_invalid_key: "error",
};

export const CATEGORY_COLORS: Record<string, string> = {
  embedding: "#3b82f6",
  llm: "#8b5cf6",
  rules: "#f59e0b",
  observation: "#ef4444",
  prediction: "#f97316",
  pipeline: "#10b981",
  error: "#6b7280",
};

export const SEVERITY_COLORS: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#3b82f6",
};

export const OBSERVATION_LABELS: Record<string, string> = {
  ai_provides_invalid_or_missing_justification: "Invalid or Missing Justification",
  ai_undermines_fair_decision_process: "Undermines Fair Decision Process",
  ai_obscures_information: "Obscures Information",
  ai_misrepresents_risk: "Misrepresents Risk",
  ai_outputs_biased_response: "Biased Response Output",
  ai_applies_insecure_data_handling: "Insecure Data Handling",
  ai_ignores_contextual_disparities: "Ignores Contextual Disparities",
};

export const PREDICTION_LABELS: Record<string, string> = {
  transparency_or_consent_violated: "Transparency / Consent Violation",
  decision_quality_violated: "Decision Quality Violation",
  unfair_treatment: "Unfair Treatment",
  ccpa_violation: "CCPA Violation",
  ai_act_violation: "EU AI Act Violation",
  invalid_output: "Invalid Output",
};

export const PREDICTION_REGULATIONS: Record<string, string> = {
  transparency_or_consent_violated: "GDPR Art. 13-14",
  decision_quality_violated: "EU AI Act Art. 14",
  unfair_treatment: "EU AI Act Art. 10",
  ccpa_violation: "CCPA §1798.100",
  ai_act_violation: "EU AI Act",
  invalid_output: "General Compliance",
};
