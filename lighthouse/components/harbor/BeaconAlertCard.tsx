"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { InterventionEvent } from "@/lib/types";
import { SEVERITY_COLORS } from "@/lib/types";
import { getInterventionAuditBrief } from "@/lib/intervention-audit-plans";

interface Props {
  event: InterventionEvent;
}

const AGENT_DISPLAY: Record<string, string> = {
  "finance-agent-alpha": "Finance Agent Alpha",
  "privacy-agent-beta": "Privacy Agent Beta",
  "ops-agent-gamma": "Ops Agent Gamma",
};

function BriefBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h4>
      <div className="text-sm leading-relaxed text-foreground/95">{children}</div>
    </div>
  );
}

export function BeaconAlertCard({ event }: Props) {
  const severityColor = SEVERITY_COLORS[event.severity] ?? "#6b7280";
  const [briefOpen, setBriefOpen] = useState(false);
  const brief = getInterventionAuditBrief(event);

  return (
    <Card className="relative overflow-hidden border-l-4" style={{ borderLeftColor: severityColor }}>
      <div
        className="absolute right-4 top-4 h-3 w-3 rounded-full animate-beacon-pulse"
        style={{ backgroundColor: severityColor }}
      />
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold">
            {AGENT_DISPLAY[event.agent_id] ?? event.agent_id}
          </CardTitle>
          <Badge
            variant="outline"
            className="text-xs uppercase"
            style={{ borderColor: severityColor, color: severityColor }}
          >
            {event.severity}
          </Badge>
          <Badge
            variant={event.action === "blocked" ? "destructive" : "secondary"}
            className="text-xs uppercase"
          >
            {event.action}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground font-mono">
          {event.policy_trigger} &middot; {event.request_id}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <p className="text-sm text-muted-foreground">{event.reason}</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-destructive/10 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-destructive mb-1">
              Proposed Action
            </p>
            <p className="text-sm">{event.proposed_action}</p>
          </div>
          <div className="rounded-md bg-safe/10 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-safe mb-1">
              Corrected Action
            </p>
            <p className="text-sm">{event.corrected_action}</p>
          </div>
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/20">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm"
            onClick={() => setBriefOpen((o) => !o)}
            aria-expanded={briefOpen}
          >
            <span className="text-muted-foreground">
              {briefOpen ? "Hide audit brief" : "Explore audit brief — issue, model output, impact"}
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${briefOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
          {briefOpen ? (
            <div className="border-t border-border/50 px-3 pb-4 pt-3">
              <div className="max-h-[min(60vh,22rem)] space-y-4 overflow-y-auto pr-1">
                <BriefBlock label="The issue">{brief.issue}</BriefBlock>
                <BriefBlock label="What the model / pipeline did">{brief.modelSaid}</BriefBlock>
                <BriefBlock label="Why this is a problem">{brief.whyBad}</BriefBlock>
                {brief.regulatoryNote ? (
                  <BriefBlock label="Regulatory angle">{brief.regulatoryNote}</BriefBlock>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
