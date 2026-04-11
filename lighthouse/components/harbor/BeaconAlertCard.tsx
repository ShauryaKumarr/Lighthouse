"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { InterventionEvent } from "@/lib/types";
import { SEVERITY_COLORS } from "@/lib/types";

interface Props {
  event: InterventionEvent;
}

const AGENT_DISPLAY: Record<string, string> = {
  "finance-agent-alpha": "Finance Agent Alpha",
  "privacy-agent-beta": "Privacy Agent Beta",
  "ops-agent-gamma": "Ops Agent Gamma",
};

export function BeaconAlertCard({ event }: Props) {
  const severityColor = SEVERITY_COLORS[event.severity] ?? "#6b7280";

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
      </CardContent>
    </Card>
  );
}
