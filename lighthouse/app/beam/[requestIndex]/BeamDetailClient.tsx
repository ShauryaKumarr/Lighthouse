"use client";

import Link from "next/link";
import { useData } from "@/lib/data-context";
import { BeamTimeline } from "@/components/beam/BeamTimeline";
import { ObservationPanel } from "@/components/beam/ObservationPanel";
import { PredictionPanel } from "@/components/beam/PredictionPanel";
import { Spotlight, SpotlightCard } from "@/components/beam/Spotlight";
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

export function BeamDetailClient({ requestIndex }: { requestIndex: string }) {
  const { loading, error, lifecycles } = useData();
  const idx = parseInt(requestIndex, 10);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="mx-auto h-12 w-12 animate-beacon-pulse rounded-full bg-beacon/20" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-coral">Error: {error}</p>
      </div>
    );
  }

  const lifecycle = lifecycles[idx];
  if (!lifecycle) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-coral">Request #{idx + 1} not found.</p>
        <Link
          href="/beam"
          className="mt-2 inline-block text-sm text-beacon hover:underline"
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
      color: "text-fog",
    },
    {
      label: "Duration",
      value: `${(lifecycle.durationMs / 1000).toFixed(1)}s`,
      icon: Clock,
      color: "text-fog",
    },
    {
      label: "Observations",
      value: lifecycle.observations.length,
      icon: Eye,
      color:
        lifecycle.observations.length > 0 ? "text-coral" : "text-fog",
    },
    {
      label: "Predictions",
      value: lifecycle.predictions.length,
      icon: Zap,
      color:
        lifecycle.predictions.length > 0 ? "text-beacon" : "text-fog",
    },
  ];

  return (
    <Spotlight>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 flex items-center justify-between"
        >
          <Link
            href="/beam"
            className="inline-flex items-center gap-1.5 text-xs text-fog/50 transition-colors hover:text-fog"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Traces
          </Link>

          <div className="flex items-center gap-1">
            {prevIdx !== null ? (
              <Link
                href={`/beam/${prevIdx}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-fog/50 transition-colors hover:border-white/[0.15] hover:text-fog"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.04] opacity-30">
                <ChevronLeft className="h-4 w-4 text-fog/40" />
              </div>
            )}
            <span className="px-2 font-mono text-xs text-fog/50">
              {idx + 1} / {lifecycles.length}
            </span>
            {nextIdx !== null ? (
              <Link
                href={`/beam/${nextIdx}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-fog/50 transition-colors hover:border-white/[0.15] hover:text-fog"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.04] opacity-30">
                <ChevronRight className="h-4 w-4 text-fog/40" />
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-start gap-4">
            <div
              className={`mt-1 flex h-11 w-11 items-center justify-center rounded-xl ${
                lifecycle.validationSuccess
                  ? "bg-safe/10 text-safe shadow-[0_0_20px_-4px_rgba(16,185,129,0.3)]"
                  : "bg-coral/10 text-coral shadow-[0_0_20px_-4px_rgba(239,68,68,0.3)]"
              }`}
            >
              <StatusIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-fog">
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
              <p className="mt-1 font-mono text-xs text-fog/40">
                {new Date(lifecycle.startTime).toLocaleString()} &rarr;{" "}
                {new Date(lifecycle.endTime).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <SpotlightCard
              key={stat.label}
              className="rounded-2xl border border-white/[0.08] bg-navy/40 backdrop-blur-md"
            >
              <div className="px-5 py-4">
                <div className="mb-2 flex items-center gap-2">
                  <stat.icon
                    className={`h-4 w-4 opacity-60 ${stat.color}`}
                  />
                  <span className="text-xs font-medium uppercase tracking-wider text-fog/50">
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
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
        >
          <BeamTimeline lifecycle={lifecycle} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          <ObservationPanel observations={lifecycle.observations} />
          <PredictionPanel predictions={lifecycle.predictions} />
        </motion.div>

        {lifecycle.ruleIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <SpotlightCard className="overflow-hidden rounded-2xl border border-white/[0.08] bg-navy/40 backdrop-blur-md">
              <div className="border-b border-white/[0.06] px-5 py-3">
                <span className="text-xs font-medium uppercase tracking-wider text-fog/50">
                  Rules Evaluated
                </span>
              </div>
              <div className="px-5 py-4">
                <div className="mb-3 flex flex-wrap gap-2">
                  {lifecycle.ruleIds.map((ruleId) => (
                    <span
                      key={ruleId}
                      className="inline-flex items-center rounded-lg border border-white/[0.08] bg-ocean/20 px-2.5 py-1 font-mono text-xs text-fog/80"
                    >
                      {ruleId}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-fog/50">
                  All rules{" "}
                  {lifecycle.rulesPassed ? (
                    <span className="font-medium text-safe">passed</span>
                  ) : (
                    <span className="font-medium text-coral">
                      had violations
                    </span>
                  )}{" "}
                  &middot; Final validation{" "}
                  {lifecycle.validationSuccess ? (
                    <span className="font-medium text-safe">succeeded</span>
                  ) : (
                    <span className="font-medium text-coral">failed</span>
                  )}
                </p>
              </div>
            </SpotlightCard>
          </motion.div>
        )}
      </div>
    </Spotlight>
  );
}
