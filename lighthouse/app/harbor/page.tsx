"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useData } from "@/lib/data-context";
import { HarborStats } from "@/components/harbor/HarborStats";
import { BeaconAlertCard } from "@/components/harbor/BeaconAlertCard";
import { InterventionTimeline } from "@/components/harbor/InterventionTimeline";
import { SeverityDonut } from "@/components/harbor/SeverityDonut";
import { HazardClassChart } from "@/components/harbor/HazardClassChart";
import { PageTransition } from "@/components/PageTransition";
import { FileUpload } from "@/components/FileUpload";

const SEAGULLS = [
  { top: "14%", delay: 0, dur: 7, size: 18, flap: "0.45s", opacity: 0.5 },
  { top: "32%", delay: 1.4, dur: 7, size: 13, flap: "0.55s", opacity: 0.38 },
  { top: "22%", delay: 2.8, dur: 7, size: 22, flap: "0.38s", opacity: 0.55 },
  { top: "44%", delay: 4.2, dur: 7, size: 11, flap: "0.65s", opacity: 0.32 },
  { top: "9%", delay: 5.6, dur: 7, size: 15, flap: "0.5s", opacity: 0.42 },
] as const;

function HarborSeagulls() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {SEAGULLS.map((g, i) => (
        <motion.span
          key={i}
          className="absolute left-0 will-change-transform"
          style={{ top: g.top }}
          initial={{ x: "-25vw", y: 0 }}
          animate={{
            /* Full bleed: start well left of viewport, exit well right */
            x: ["-25vw", "125vw"],
            y: [0, -16],
          }}
          transition={{
            duration: g.dur,
            delay: g.delay,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 0,
          }}
        >
          <svg
            width={g.size * 2}
            height={g.size}
            viewBox="0 0 32 16"
            fill="none"
            className="seagull-flap"
            style={
              { "--flap-dur": g.flap, opacity: g.opacity } as CSSProperties
            }
          >
            <path
              d="M16,8 C12,2 6,1 0,5"
              stroke="#5c6b73"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M16,8 C20,2 26,1 32,5"
              stroke="#5c6b73"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </motion.span>
      ))}
    </div>,
    document.body
  );
}

export default function HarborOverview() {
  const { loading, error, metrics, interventions } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto rounded-full bg-beacon/20 animate-beacon-pulse" />
          <p className="text-muted-foreground text-sm">
            Loading audit data...
          </p>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-destructive">Error: {error ?? "No data"}</p>
      </div>
    );
  }

  return (
    <>
    <HarborSeagulls />

    <PageTransition>
    <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Harbor Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Executive summary of Inhibitor audit activity &mdash; all requests
            evaluated during the drift audit stress test.
          </p>
        </div>
        <FileUpload />
      </div>

      <HarborStats metrics={metrics} interventions={interventions} />

      <InterventionTimeline metrics={metrics} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SeverityDonut interventions={interventions} />
        <HazardClassChart metrics={metrics} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-beacon animate-beacon-pulse inline-block" />
          Beacon Alerts
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {interventions.map((event) => (
            <BeaconAlertCard key={event.request_id} event={event} />
          ))}
        </div>
      </div>
    </div>
    </PageTransition>
    </>
  );
}
