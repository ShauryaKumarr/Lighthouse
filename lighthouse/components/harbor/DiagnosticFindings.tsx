"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DiagnosticFinding } from "@/lib/types";
import { getFindingAuditBrief } from "@/lib/finding-audit-plans";

interface Props {
  findings: DiagnosticFinding[];
}

const SEVERITY_STYLES: Record<
  string,
  { bg: string; border: string; text: string; badge: string }
> = {
  critical: {
    bg: "bg-coral/5",
    border: "border-coral/40",
    text: "text-coral",
    badge: "bg-coral/15 text-coral border-coral/30",
  },
  high: {
    bg: "bg-beacon/5",
    border: "border-beacon/40",
    text: "text-beacon",
    badge: "bg-beacon/15 text-beacon border-beacon/30",
  },
  medium: {
    bg: "bg-sky-500/5",
    border: "border-sky-500/40",
    text: "text-sky-400",
    badge: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  },
  low: {
    bg: "bg-muted/30",
    border: "border-border",
    text: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground border-border",
  },
};

function BriefBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h4>
      <div className="text-sm leading-relaxed text-foreground/95">{children}</div>
    </div>
  );
}

export function DiagnosticFindings({ findings }: Props) {
  const [expanded, setExpanded] = useState<string | null>(findings[0]?.id ?? null);

  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const auditFlagCount = findings.filter((f) => f.auditFlag).length;

  return (
    <Card className="border-coral/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-coral animate-beacon-pulse" />
            Diagnostic Findings
          </CardTitle>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge
                variant="outline"
                className="text-xs bg-coral/15 text-coral border-coral/30"
              >
                {criticalCount} critical
              </Badge>
            )}
            {auditFlagCount > 0 && (
              <Badge
                variant="outline"
                className="text-xs bg-beacon/15 text-beacon border-beacon/30"
              >
                {auditFlagCount} audit flag{auditFlagCount > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Each finding includes a reviewer brief: the issue, what the model/pipeline did, and why it
          matters. Expand to read the full plan.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {findings.map((f) => {
          const style = SEVERITY_STYLES[f.severity] ?? SEVERITY_STYLES.low;
          const isExpanded = expanded === f.id;
          const brief = getFindingAuditBrief(f);

          return (
            <div
              key={f.id}
              className={`rounded-lg border ${style.border} ${style.bg} transition-colors`}
            >
              <button
                type="button"
                className="flex w-full items-start gap-3 p-3 text-left"
                onClick={() => setExpanded(isExpanded ? null : f.id)}
                aria-expanded={isExpanded}
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background text-xs font-bold">
                  {f.priority}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{f.title}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase ${style.badge}`}
                    >
                      {f.severity}
                    </Badge>
                    {f.auditFlag && (
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase bg-coral/10 text-coral border-coral/30"
                      >
                        Audit Flag
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{f.description}</p>
                  <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                    {isExpanded ? "Hide audit brief" : "Explore audit brief — issue, model behavior, impact"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <div className="text-right">
                    <p className={`text-sm font-mono font-bold ${style.text}`}>{f.metric}</p>
                    <p className="text-[10px] text-muted-foreground">target: {f.target}</p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border/50 px-3 pb-4 pt-3 sm:pl-12">
                  <div className="max-h-[min(70vh,28rem)] space-y-5 overflow-y-auto pr-1">
                    <BriefBlock label="The issue">{brief.issue}</BriefBlock>
                    <BriefBlock label="What the model / pipeline did">{brief.modelSaid}</BriefBlock>
                    <BriefBlock label="Why this is a problem">{brief.whyBad}</BriefBlock>
                    {brief.regulatoryNote ? (
                      <BriefBlock label="Regulatory angle">{brief.regulatoryNote}</BriefBlock>
                    ) : null}
                    <div className="space-y-1.5 border-t border-border/40 pt-4">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Recommended plan
                      </h4>
                      <p className="text-sm leading-relaxed">{f.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
