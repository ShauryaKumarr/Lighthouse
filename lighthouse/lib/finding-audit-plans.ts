import type { DiagnosticFinding } from "@/lib/types";

export interface FindingAuditBrief {
  issue: string;
  modelSaid: string;
  whyBad: string;
  regulatoryNote?: string;
}

/** Pre-written reviewer briefs keyed by diagnostic finding id. */
export function getFindingAuditBrief(f: DiagnosticFinding): FindingAuditBrief {
  switch (f.id) {
    case "rule-binding-failure":
      return {
        issue:
          "Rules are evaluated, but required fields from the request (policy numbers, amounts, member IDs) are not bound before the rule body runs. The engine logs `rules_inhibition_rule_binding_missing` instead of a concrete violation.",
        modelSaid:
          "Example pipeline excerpt: after `rules_inhibition_rule_start`, the extractor returns empty slots; the LLM still produces a `rules_inhibition_rule_passed` outcome because the rule short-circuits when bindings are absent. Downstream logs show the same pattern on most requests.",
        whyBad:
          "From an audit perspective this is “illusory enforcement”: compliance reports can claim rules ran, but no business constraint was actually checked. Risk decisions default to pass-through, which is worse than an explicit failure because it hides the gap.",
        regulatoryNote:
          "EU AI Act Art. 10 / 14: high-risk systems need meaningful human oversight and traceable decisions; silent binding misses undermine both.",
      };

    case "observation-alert-fatigue":
      return {
        issue: f.description,
        modelSaid:
          "The observation model is prompted to emit structured inhibition keys on every turn. When confidence thresholds are low, it still surfaces the same dominant key (shown in your metrics) on a majority of requests, often with boilerplate rationale reused across traces.",
        whyBad:
          "Alert fatigue is a control failure: reviewers deprioritize the channel, true positives get buried, and post-incident reviews show “we saw the signal” without action. Regulators read that as a broken second line of defense, not a tuning detail.",
        regulatoryNote:
          "GDPR accountability and fairness expectations assume proportionate, actionable signals—not constant noise at the same severity tier.",
      };

    case "embedding-cost":
      return {
        issue:
          "Embedding volume per request is far above what a batched retrieval design needs. The pipeline issues many small embedding calls instead of one vectorization pass per phase.",
        modelSaid:
          "Typical trace: `embedding_start` / `embedding_complete` pairs repeat for each micro-chunk of context (headers, footers, snippets) instead of a single concatenated payload. Latency stacks linearly with each round trip.",
        whyBad:
          "Cost and latency scale with traffic; under load the system becomes fragile while still passing functional tests. Sustainability and vendor lock-in risk rise, and incident response during outages is harder because the blast radius is large.",
      };

    case "llm-call-volume":
      return {
        issue:
          "Each observation and prediction dimension triggers its own LLM completion. That explodes token usage and creates race conditions between partial answers.",
        modelSaid:
          "Logs show back-to-back `llm_prompt_start` / `llm_prompt_complete` blocks for narrowly scoped prompts. The model often paraphrases the same policy paragraph across calls, which is a sign the orchestration layer is chatty rather than structured.",
        whyBad:
          "Higher call counts increase contradictory outputs, harder reproducibility for audits, and wider exposure of sensitive prompts in logs. It is also a red flag for “paper compliance” if governance reviews only the final merged answer.",
      };

    case "single-rule-coverage":
      return {
        issue:
          "Many distinct risk observations are generated, but only a single DILL-style rule is wired to consume them. The detection layer is rich; the enforcement layer is not.",
        modelSaid:
          "The model keeps emitting diverse inhibition keys, yet `rules_inhibition_rule_start` always resolves to the same rule id. The pipeline has nothing authoritative to map each risk class to a business decision.",
        whyBad:
          "Auditors expect mapping from signal → control → owner. A single rule cannot credibly cover bias, PII, consent, and financial integrity simultaneously. Gaps become invisible because observations are “logged but not governed.”",
      };

    case "auth-probing":
      return {
        issue: f.description,
        modelSaid:
          "No agent “speech” here—the API returns `auth_failed_invalid_key` for scripted paths (e.g., credential probes). The model layer is not involved; the issue is perimeter and abuse handling.",
        whyBad:
          "Repeated probes indicate your surface is being cataloged. If paired with successful calls elsewhere, they foreshadow data exfiltration or prompt-injection campaigns. Volume matters for SOC2 / ISO evidence of monitoring.",
      };

    case "validation-passthrough":
      return {
        issue: f.description,
        modelSaid:
          "Despite multiple high-severity predictions per request, `inhibition_final_validation` still marks the lifecycle successful. The model’s own risk scores are treated as informational only at the last gate.",
        whyBad:
          "This is the classic “detect but don’t act” failure mode. Marketing can still claim “100% validated” while the system routinely carries elevated risk. That mismatch is legally and reputationally toxic under EU AI Act transparency duties.",
        regulatoryNote:
          "Art. 14 requires that users can interpret system behavior; silent pass-through of high predictions contradicts that expectation.",
      };

    default:
      return {
        issue: f.description,
        modelSaid:
          "The pipeline emits standard Inhibitor events for this class of issue; see the Harbor metrics and raw log export for the exact sequence on affected requests.",
        whyBad:
          "Without remediation, the finding weakens the reliability story you present to auditors: metrics move, but controls and accountability do not.",
      };
  }
}
