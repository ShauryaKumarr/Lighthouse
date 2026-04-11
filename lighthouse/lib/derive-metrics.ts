import type {
  RequestLifecycle,
  InterventionEvent,
  DerivedMetrics,
  DiagnosticFinding,
  RawLogRow,
} from "./types";

export function deriveMetrics(
  lifecycles: RequestLifecycle[],
  interventions: InterventionEvent[],
  rawRows?: RawLogRow[]
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

  let totalObsCount = 0;
  let totalPredCount = 0;

  for (const lc of lifecycles) {
    for (const obs of lc.observations) {
      allObservationKeys.add(obs);
      observationFrequency[obs] = (observationFrequency[obs] || 0) + 1;
      totalObsCount++;
    }
    for (const pred of lc.predictions) {
      allPredictionKeys.add(pred);
      predictionFrequency[pred] = (predictionFrequency[pred] || 0) + 1;
      totalPredCount++;
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

  const ruleBindingMissing = eventTypeCounts["rules_inhibition_rule_binding_missing"] ?? 0;
  const ruleStarts = eventTypeCounts["rules_inhibition_rule_start"] ?? 0;
  const ruleBindingMissRate = ruleStarts > 0 ? ruleBindingMissing / (ruleStarts * 2) : 0;

  const avgObservationsPerRequest = totalRequests > 0 ? totalObsCount / totalRequests : 0;
  const avgPredictionsPerRequest = totalRequests > 0 ? totalPredCount / totalRequests : 0;

  const embeddingStarts = eventTypeCounts["embedding_start"] ?? 0;
  const avgEmbeddingsPerRequest = totalRequests > 0 ? embeddingStarts / totalRequests : 0;

  const llmStarts = eventTypeCounts["llm_prompt_start"] ?? 0;
  const avgLlmCallsPerRequest = totalRequests > 0 ? llmStarts / totalRequests : 0;

  const authFailures = rawRows
    ? rawRows.filter((r) => r.event === "auth_failed_invalid_key").length
    : eventTypeCounts["auth_failed_invalid_key"] ?? 0;

  const validationSuccessCount = lifecycles.filter((lc) => lc.validationSuccess).length;
  const validationPassRate = totalRequests > 0 ? validationSuccessCount / totalRequests : 0;

  const sortedObs = Object.entries(observationFrequency).sort((a, b) => b[1] - a[1]);
  const topObservationKey = sortedObs.length > 0 ? sortedObs[0][0] : "";
  const topObservationPct =
    sortedObs.length > 0 && totalRequests > 0
      ? sortedObs[0][1] / totalRequests
      : 0;

  const findings = generateFindings({
    ruleBindingMissRate,
    avgObservationsPerRequest,
    avgPredictionsPerRequest,
    avgEmbeddingsPerRequest,
    avgLlmCallsPerRequest,
    authFailures,
    validationPassRate,
    topObservationKey,
    topObservationPct,
    uniqueRuleCount: allRuleIds.size,
    totalRequests,
  });

  return {
    totalRequests,
    totalEvents,
    avgDurationMs,
    totalBlocked,
    totalObservations: allObservationKeys.size,
    totalPredictions: allPredictionKeys.size,
    uniqueObservationKeys: Array.from(allObservationKeys).sort(),
    uniquePredictionKeys: Array.from(allPredictionKeys).sort(),
    uniqueRuleIds: Array.from(allRuleIds).sort(),
    eventTypeCounts,
    observationFrequency,
    predictionFrequency,
    timelinePoints,
    ruleBindingMissRate,
    avgObservationsPerRequest,
    avgPredictionsPerRequest,
    avgEmbeddingsPerRequest,
    avgLlmCallsPerRequest,
    authFailures,
    validationPassRate,
    topObservationKey,
    topObservationPct,
    findings,
  };
}

interface FindingInputs {
  ruleBindingMissRate: number;
  avgObservationsPerRequest: number;
  avgPredictionsPerRequest: number;
  avgEmbeddingsPerRequest: number;
  avgLlmCallsPerRequest: number;
  authFailures: number;
  validationPassRate: number;
  topObservationKey: string;
  topObservationPct: number;
  uniqueRuleCount: number;
  totalRequests: number;
}

function generateFindings(input: FindingInputs): DiagnosticFinding[] {
  const findings: DiagnosticFinding[] = [];

  if (input.ruleBindingMissRate > 0.5) {
    findings.push({
      id: "rule-binding-failure",
      priority: 1,
      severity: "critical",
      title: "Rule Enforcement is Illusory",
      description: `${(input.ruleBindingMissRate * 100).toFixed(0)}% of rule variable extractions fail. The rule evaluates but can never enforce its business logic because required fields (amount, id) are never extracted from request payloads.`,
      metric: `${(input.ruleBindingMissRate * 100).toFixed(0)}% miss rate`,
      target: "<5% miss rate",
      recommendation:
        "Fix the extraction prompt in the insurance_check DILL rule or verify upstream agent payloads contain the expected fields. Missing bindings should flag as indeterminate, not silently pass.",
      auditFlag: true,
    });
  }

  if (input.topObservationPct > 0.5) {
    findings.push({
      id: "observation-alert-fatigue",
      priority: 2,
      severity: "high",
      title: "Observation Alert Fatigue",
      description: `"${input.topObservationKey.replace(/_/g, " ")}" fires on ${(input.topObservationPct * 100).toFixed(0)}% of requests. When nearly every request triggers the same observation, reviewers ignore all of them.`,
      metric: `${input.avgObservationsPerRequest.toFixed(1)} obs/request`,
      target: "2-4 obs/request",
      recommendation:
        "Raise confidence threshold for high-frequency observations, add contextual scoping (only flag bias in hiring/lending/claims contexts), and deduplicate within request lifecycles.",
      auditFlag: false,
    });
  }

  if (input.avgEmbeddingsPerRequest > 10) {
    findings.push({
      id: "embedding-cost",
      priority: 3,
      severity: "high",
      title: "Disproportionate Embedding Cost",
      description: `${input.avgEmbeddingsPerRequest.toFixed(1)} embedding API calls per request. Each is a round-trip to OpenAI. This is the single largest event category, suggesting per-key calls instead of batched requests.`,
      metric: `${input.avgEmbeddingsPerRequest.toFixed(1)} embeddings/req`,
      target: "1-5 (batched)",
      recommendation:
        "Batch all text inputs into a single embedding API call per request phase. OpenAI supports batch embedding. Expected ~90% reduction in embedding latency and cost.",
      auditFlag: false,
    });
  }

  if (input.avgLlmCallsPerRequest > 8) {
    findings.push({
      id: "llm-call-volume",
      priority: 4,
      severity: "medium",
      title: "High LLM Call Volume",
      description: `${input.avgLlmCallsPerRequest.toFixed(1)} LLM prompt calls per request. Each observation and prediction key triggers a separate reasoning call to Groq llama-3.3-70b.`,
      metric: `${input.avgLlmCallsPerRequest.toFixed(1)} LLM calls/req`,
      target: "3-6 calls/req",
      recommendation:
        "Consolidate into one LLM call for all observations and one for all predictions using structured multi-key prompts. Reduces 20+ calls to 2-4 per request.",
      auditFlag: false,
    });
  }

  if (input.uniqueRuleCount <= 1 && input.totalRequests > 10) {
    findings.push({
      id: "single-rule-coverage",
      priority: 5,
      severity: "medium",
      title: "Single Rule Coverage",
      description: `Only ${input.uniqueRuleCount} rule evaluated across ${input.totalRequests} requests. The detection layer flags ${input.avgObservationsPerRequest.toFixed(0)}+ risk signals per request, but only one business rule exists to act on them.`,
      metric: `${input.uniqueRuleCount} rule(s)`,
      target: "5-15 rules",
      recommendation:
        "Author DILL rules for each risk domain: PII handling, bias mitigation, prompt injection, financial verification. The observations are finding signals — rules need to enforce them.",
      auditFlag: false,
    });
  }

  if (input.authFailures > 0) {
    findings.push({
      id: "auth-probing",
      priority: 6,
      severity: "low",
      title: "Reconnaissance / Auth Probing",
      description: `${input.authFailures} unauthorized access attempts detected, including .env credential-harvesting probes from external IPs.`,
      metric: `${input.authFailures} auth failures`,
      target: "<1/hr with alerting",
      recommendation:
        "Add Cloudflare WAF rules to block sensitive path probes (/.env, /config). Rate-limit unauthenticated requests. Alert on auth_failed spikes.",
      auditFlag: input.authFailures > 10,
    });
  }

  if (input.validationPassRate === 1 && input.avgPredictionsPerRequest > 3) {
    findings.push({
      id: "validation-passthrough",
      priority: 2,
      severity: "critical",
      title: "Validation Passes Despite High Risk Signals",
      description: `100% validation pass rate while averaging ${input.avgPredictionsPerRequest.toFixed(1)} risk predictions per request. The system detects problems then waves every request through. Compliance claims based on "all validations passed" are misleading.`,
      metric: `${(input.validationPassRate * 100).toFixed(0)}% pass rate`,
      target: "N/A — threshold review needed",
      recommendation:
        "Revisit final validation thresholds. When prediction severity is high, validation should fail or escalate. The detection layer is working; the enforcement layer is not.",
      auditFlag: true,
    });
  }

  findings.sort((a, b) => a.priority - b.priority);
  return findings;
}
