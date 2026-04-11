"use client";

import { use } from "react";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { BeamTimeline } from "@/components/beam/BeamTimeline";
import { ObservationPanel } from "@/components/beam/ObservationPanel";
import { PredictionPanel } from "@/components/beam/PredictionPanel";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Layers,
  Clock,
  Eye,
  Zap,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

export default function BeamDetailPage({
  params,
}: {
  params: Promise<{ requestIndex: string }>;
}) {
  const { requestIndex } = use(params);
  const { loading, error, lifecycles } = useData();
  const idx = parseInt(requestIndex, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 mx-auto rounded-full bg-beacon/20 animate-beacon-pulse" />
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

  const lifecycle = lifecycles[idx];
  if (!lifecycle) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-destructive">Request #{idx + 1} not found.</p>
        <Link
          href="/beam"
          className="text-sm text-beacon hover:underline mt-2 inline-block"
        >
          &larr; Back to all traces
        </Link>
      </div>
    );
  }

  const prevIdx = idx > 0 ? idx - 1 : null;
  const nextIdx = idx < lifecycles.length - 1 ? idx + 1 : null;

  const StatusIcon = lifecycle.validationSuccess ? ShieldCheck : ShieldAlert;

  const stats = [
    {
      label: "Events",
      value: lifecycle.events.length,
      icon: Layers,
      color: "text-foreground",
    },
    {
      label: "Duration",
      value: `${(lifecycle.durationMs / 1000).toFixed(1)}s`,
      icon: Clock,
      color: "text-foreground",
    },
    {
      label: "Observations",
      value: lifecycle.observations.length,
      icon: Eye,
      color: lifecycle.observations.length > 0 ? "text-coral" : "text-foreground",
    },
    {
      label: "Predictions",
      value: lifecycle.predictions.length,
      icon: Zap,
      color:
        lifecycle.predictions.length > 0 ? "text-beacon" : "text-foreground",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Navigation bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-8"
      >
        <Link
          href="/beam"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Traces
        </Link>

        <div className="flex items-center gap-1">
          {prevIdx !== null ? (
            <Link
              href={`/beam/${prevIdx}`}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : (
            <div className="h-8 w-8 rounded-lg border border-border/30 flex items-center justify-center opacity-30">
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <span className="text-xs text-muted-foreground px-2 font-mono">
            {idx + 1} / {lifecycles.length}
          </span>
          {nextIdx !== null ? (
            <Link
              href={`/beam/${nextIdx}`}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="h-8 w-8 rounded-lg border border-border/30 flex items-center justify-center opacity-30">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </motion.div>

      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-start gap-4">
          <div
            className={`mt-1 flex items-center justify-center h-10 w-10 rounded-xl ${
              lifecycle.validationSuccess
                ? "bg-safe/10 text-safe"
                : "bg-coral/10 text-coral"
            }`}
          >
            <StatusIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">
                Request #{idx + 1}
              </h1>
              <Badge
                variant={
                  lifecycle.validationSuccess ? "secondary" : "destructive"
                }
                className="text-xs"
              >
                {lifecycle.validationSuccess ? "Safe Passage" : "Flagged"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {new Date(lifecycle.startTime).toLocaleString()} &rarr;{" "}
              {new Date(lifecycle.endTime).toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm px-5 py-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon
                className={`h-4 w-4 opacity-60 ${stat.color}`}
              />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <p className={`text-2xl font-semibold tracking-tight ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-8"
      >
        <BeamTimeline lifecycle={lifecycle} />
      </motion.div>

      {/* Observations & Predictions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8"
      >
        <ObservationPanel observations={lifecycle.observations} />
        <PredictionPanel predictions={lifecycle.predictions} />
      </motion.div>

      {/* Rules Evaluated */}
      {lifecycle.ruleIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-border/40">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Rules Evaluated
            </span>
          </div>
          <div className="px-5 py-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {lifecycle.ruleIds.map((ruleId) => (
                <span
                  key={ruleId}
                  className="inline-flex items-center rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-xs font-mono text-foreground/80"
                >
                  {ruleId}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              All rules{" "}
              {lifecycle.rulesPassed ? (
                <span className="text-safe font-medium">passed</span>
              ) : (
                <span className="text-coral font-medium">had violations</span>
              )}{" "}
              &middot; Final validation{" "}
              {lifecycle.validationSuccess ? (
                <span className="text-safe font-medium">succeeded</span>
              ) : (
                <span className="text-coral font-medium">failed</span>
              )}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
