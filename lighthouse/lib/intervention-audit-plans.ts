import type { InterventionEvent } from "@/lib/types";
import type { FindingAuditBrief } from "@/lib/finding-audit-plans";

/** Pre-written audit context for a single intervention (beacon) event. */
export function getInterventionAuditBrief(event: InterventionEvent): FindingAuditBrief {
  const actionLabel =
    event.action === "blocked"
      ? "blocked the request"
      : event.action === "interrupted"
        ? "interrupted the agent mid-turn"
        : "logged a warning but allowed continuation";

  return {
    issue: `The Inhibitor ${actionLabel} after rule "${event.policy_trigger}" fired at ${event.severity} severity (${event.mode} mode). Request ${event.request_id}.`,
    modelSaid: `The agent’s proposed continuation was: “${event.proposed_action}”`,
    whyBad: `${event.reason} If this output had shipped, reviewers would need to prove whether harm actually occurred; the safer default is the substituted action: “${event.corrected_action}”.`,
    regulatoryNote:
      event.severity === "high"
        ? "High-severity interventions should be traceable in your DPIA / conformity assessment as concrete examples of mitigations in action."
        : undefined,
  };
}
