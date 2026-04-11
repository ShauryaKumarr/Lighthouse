"use client";

import Link from "next/link";
import { useData } from "@/lib/data-context";
import { PageHero } from "@/components/PageHero";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function BeamListPage() {
  const { loading, error, lifecycles } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto rounded-full bg-beacon/20 animate-beacon-pulse" />
          <p className="text-muted-foreground text-sm">
            Loading request traces&hellip;
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  const totalRequests = lifecycles.length;
  const flaggedCount = lifecycles.filter((lc) => !lc.validationSuccess).length;
  const safeCount = totalRequests - flaggedCount;
  const avgDuration =
    totalRequests > 0
      ? lifecycles.reduce((sum, lc) => sum + lc.durationMs, 0) /
        totalRequests /
        1000
      : 0;

  const summaryStats = [
    {
      label: "Total Traces",
      value: totalRequests,
      icon: Activity,
      color: "text-foreground",
    },
    {
      label: "Safe Passage",
      value: safeCount,
      icon: ShieldCheck,
      color: "text-safe",
    },
    {
      label: "Flagged",
      value: flaggedCount,
      icon: ShieldAlert,
      color: "text-coral",
    },
    {
      label: "Avg Duration",
      value: `${avgDuration.toFixed(1)}s`,
      icon: Clock,
      color: "text-muted-foreground",
    },
  ];

  return (
    <div>
      <PageHero
        kicker="Trace inspection"
        title="The Beam"
        description="Shine light on the Inhibitor's internal reasoning. Select a request trace to explore its full pipeline."
        maxWidth="6xl"
      />

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-2 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {summaryStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border/80 bg-card px-5 py-4 shadow-sm shadow-slate-900/5"
            >
              <div className="mb-2 flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color} opacity-70`} />
                <span className="pro-kicker text-muted-foreground">{stat.label}</span>
              </div>
              <p className={`text-2xl font-semibold tracking-tight ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm shadow-slate-900/5"
        >
          <div className="border-b border-border/40 px-5 py-3">
            <span className="pro-kicker text-brand">Request traces</span>
          </div>

          <div className="divide-y divide-border/30">
            {lifecycles.map((lc, i) => (
              <motion.div
                key={lc.index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.05 * Math.min(i, 10) }}
              >
                <Link href={`/beam/${lc.index}`} className="group block">
                  <div className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
                    <div
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        lc.validationSuccess ? "bg-safe" : "bg-coral"
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                          Request #{lc.index + 1}
                        </span>
                        <Badge
                          variant={
                            lc.validationSuccess ? "secondary" : "destructive"
                          }
                          className="text-[10px] font-medium"
                        >
                          {lc.validationSuccess ? "Safe Passage" : "Flagged"}
                        </Badge>
                      </div>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {new Date(lc.startTime).toLocaleString()}
                      </p>
                    </div>

                    <div className="hidden shrink-0 items-center gap-6 text-xs text-muted-foreground sm:flex">
                      <div className="text-right">
                        <span className="block font-medium text-foreground/80">
                          {lc.events.length}
                        </span>
                        <span>events</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-medium text-foreground/80">
                          {(lc.durationMs / 1000).toFixed(1)}s
                        </span>
                        <span>duration</span>
                      </div>
                      {lc.observations.length > 0 && (
                        <div className="text-right">
                          <span className="block font-medium text-coral">
                            {lc.observations.length}
                          </span>
                          <span>obs</span>
                        </div>
                      )}
                      {lc.predictions.length > 0 && (
                        <div className="text-right">
                          <span className="block font-medium text-beacon">
                            {lc.predictions.length}
                          </span>
                          <span>pred</span>
                        </div>
                      )}
                    </div>

                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-beacon" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
