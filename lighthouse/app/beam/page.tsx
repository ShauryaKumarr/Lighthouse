"use client";

import Link from "next/link";
import { useData } from "@/lib/data-context";
import { Badge } from "@/components/ui/badge";
import { Spotlight, SpotlightCard } from "@/components/beam/Spotlight";
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
    <Spotlight>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-1 mb-10"
        >
          <h1 className="text-3xl font-bold tracking-tight text-fog">The Beam</h1>
          <p className="text-sm text-fog/60 max-w-lg">
            Shine light on the Inhibitor&apos;s internal reasoning. Select a
            request trace to explore its full pipeline.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10"
        >
          {summaryStats.map((stat) => (
            <SpotlightCard
              key={stat.label}
              className="rounded-2xl border border-white/[0.08] bg-navy/40 backdrop-blur-md"
            >
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`h-4 w-4 ${stat.color} opacity-70`} />
                  <span className="text-xs text-fog/50 font-medium uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
                <p
                  className={`text-2xl font-semibold tracking-tight ${stat.color}`}
                >
                  {stat.value}
                </p>
              </div>
            </SpotlightCard>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <SpotlightCard className="rounded-2xl border border-white/[0.08] bg-navy/40 backdrop-blur-md">
            <div className="px-5 py-3 border-b border-white/[0.06]">
              <span className="text-xs font-medium text-fog/50 uppercase tracking-wider">
                Request Traces
              </span>
            </div>

            <div className="divide-y divide-white/[0.05]">
              {lifecycles.map((lc, i) => (
                <motion.div
                  key={lc.index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.05 * Math.min(i, 10),
                  }}
                >
                  <Link href={`/beam/${lc.index}`} className="block group">
                    <div className="flex items-center gap-4 px-5 py-4 transition-all duration-200 hover:bg-beacon/[0.06]">
                      <div
                        className={`h-2.5 w-2.5 rounded-full shrink-0 transition-shadow duration-200 ${
                          lc.validationSuccess
                            ? "bg-safe group-hover:shadow-[0_0_8px_2px_rgba(16,185,129,0.4)]"
                            : "bg-coral group-hover:shadow-[0_0_8px_2px_rgba(239,68,68,0.4)]"
                        }`}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-fog">
                            Request #{lc.index + 1}
                          </span>
                          <Badge
                            variant={
                              lc.validationSuccess
                                ? "secondary"
                                : "destructive"
                            }
                            className="text-[10px] font-medium"
                          >
                            {lc.validationSuccess ? "Safe Passage" : "Flagged"}
                          </Badge>
                        </div>
                        <p className="text-xs text-fog/40 mt-0.5 font-mono">
                          {new Date(lc.startTime).toLocaleString()}
                        </p>
                      </div>

                      <div className="hidden sm:flex items-center gap-6 text-xs text-fog/50 shrink-0">
                        <div className="text-right">
                          <span className="block font-medium text-fog/80">
                            {lc.events.length}
                          </span>
                          <span>events</span>
                        </div>
                        <div className="text-right">
                          <span className="block font-medium text-fog/80">
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

                      <ArrowRight className="h-4 w-4 text-fog/30 group-hover:text-beacon transition-colors shrink-0" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </Spotlight>
  );
}
