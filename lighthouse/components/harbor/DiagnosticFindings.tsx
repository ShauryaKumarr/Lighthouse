"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DiagnosticFinding } from "@/lib/types";

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

export function DiagnosticFindings({ findings }: Props) {
  const [expanded, setExpanded] = useState<string | null>(
    findings[0]?.id ?? null
  );

  const criticalCount = findings.filter(
    (f) => f.severity === "critical"
  ).length;
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
          Issues ranked by impact. Expand for recommendations and target
          baselines.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {findings.map((f) => {
          const style = SEVERITY_STYLES[f.severity] ?? SEVERITY_STYLES.low;
          const isExpanded = expanded === f.id;

          return (
            <div
              key={f.id}
              className={`rounded-lg border ${style.border} ${style.bg} transition-all cursor-pointer`}
              onClick={() => setExpanded(isExpanded ? null : f.id)}
            >
              <div className="flex items-start gap-3 p-3">
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
                  <p className="text-xs text-muted-foreground mt-1">
                    {f.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-mono font-bold ${style.text}`}>
                    {f.metric}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    target: {f.target}
                  </p>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border/50 px-3 py-3 ml-9">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                    Recommendation
                  </p>
                  <p className="text-sm leading-relaxed">{f.recommendation}</p>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
