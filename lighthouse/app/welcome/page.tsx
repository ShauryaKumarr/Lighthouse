"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Spotlight, SpotlightCard } from "@/components/beam/Spotlight";
import {
  Search,
  Shield,
  FileText,
  ArrowRight,
  Eye,
  Activity,
  Zap,
  BarChart3,
  ChevronRight,
  Anchor,
  Compass,
  Radio,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "The Beam",
    description:
      "Trace every AI request through the complete safety pipeline. See exactly how the Inhibitor reasons, observes, and decides.",
    href: "/beam",
    color: "text-beacon",
    bgColor: "bg-beacon/10",
  },
  {
    icon: Shield,
    title: "Hazard Map",
    description:
      "Visualize threat patterns and anomalies across your AI system. Identify emerging risks before they escalate into incidents.",
    href: "/hazards",
    color: "text-coral",
    bgColor: "bg-coral/10",
  },
  {
    icon: FileText,
    title: "Lighthouse Log",
    description:
      "A complete, searchable audit trail of every safety decision. Compliance-ready documentation always at your fingertips.",
    href: "/log",
    color: "text-safe",
    bgColor: "bg-safe/10",
  },
];

const pipelineSteps = [
  { icon: Eye, label: "Intercept", desc: "Capture every AI request in flight" },
  { icon: Activity, label: "Analyze", desc: "Evaluate against safety guardrails" },
  { icon: Zap, label: "Classify", desc: "Score and categorize threat levels" },
  { icon: BarChart3, label: "Report", desc: "Surface actionable insights" },
];

const capabilities = [
  {
    icon: Anchor,
    title: "Glass-Box Visibility",
    desc: "No black boxes. Every decision your AI safety layer makes is fully traceable and auditable.",
  },
  {
    icon: Compass,
    title: "Drift Detection",
    desc: "Automatically detect when your AI system drifts from expected behavior patterns under stress.",
  },
  {
    icon: Radio,
    title: "Real-Time Alerts",
    desc: "Beacon alerts surface critical interventions the moment they happen — nothing slips through.",
  },
];

const stagger = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  },
};

/** Marketing landing (dark hero). Main app entry is `/harbor`. */
export default function WelcomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);

  return (
    <Spotlight>
      <section ref={heroRef} className="relative flex min-h-[92vh] items-center justify-center overflow-hidden">
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="flex justify-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-beacon/30 bg-beacon/[0.08] px-4 py-1.5 text-xs font-medium text-beacon backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-beacon-pulse rounded-full bg-beacon" />
                AI Safety Audit Platform
              </span>
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
                <span className="text-fog">Illuminate Every</span>
                <br />
                <span className="bg-gradient-to-r from-beacon via-beacon-light to-beacon bg-clip-text text-transparent">
                  AI Decision
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-fog/55 sm:text-lg">
                Lighthouse gives your team glass-box visibility into AI safety
                Inhibitors. Trace requests, map hazards, and audit every
                intervention&nbsp;&mdash;&nbsp;all in real time.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row"
            >
              <Link
                href="/harbor"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-beacon px-7 py-3.5 text-sm font-semibold text-navy shadow-[0_0_20px_-4px_rgba(245,158,11,0.35)] transition-all duration-200 hover:bg-beacon-light hover:shadow-[0_0_36px_-4px_rgba(245,158,11,0.45)]"
              >
                Explore Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/beam"
                className="group inline-flex items-center gap-2 rounded-xl border border-fog/20 bg-fog/[0.03] px-7 py-3.5 text-sm font-semibold text-fog backdrop-blur-sm transition-all duration-200 hover:border-beacon/40 hover:bg-beacon/[0.06] hover:text-beacon"
              >
                Trace a Request
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <div className="flex flex-col items-center gap-2 text-fog/25">
              <span className="text-[10px] font-medium uppercase tracking-[0.25em]">Scroll</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="h-8 w-px bg-gradient-to-b from-fog/25 to-transparent"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-fog sm:text-4xl">
              Your Complete Safety Toolkit
            </h2>
            <p className="mx-auto max-w-xl leading-relaxed text-fog/45">
              Three powerful lenses into your AI system&apos;s safety layer,
              purpose-built for auditors, engineers, and compliance teams.
            </p>
          </motion.div>

          <motion.div
            variants={stagger.container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={stagger.item}>
                <Link href={feature.href} className="group block h-full">
                  <SpotlightCard className="h-full rounded-2xl border border-white/[0.08] bg-navy/40 backdrop-blur-md transition-all duration-300 group-hover:border-white/[0.15]">
                    <div className="flex h-full flex-col p-7 sm:p-8">
                      <div
                        className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor} ${feature.color}`}
                      >
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-fog">
                        {feature.title}
                      </h3>
                      <p className="flex-1 text-sm leading-relaxed text-fog/45">
                        {feature.description}
                      </p>
                      <div className="mt-5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium opacity-60 transition-opacity ${feature.color} group-hover:opacity-100`}>
                          Explore
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </SpotlightCard>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-28 sm:py-36">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-ocean/[0.04] to-transparent" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-fog sm:text-4xl">
              How Lighthouse Works
            </h2>
            <p className="mx-auto max-w-xl leading-relaxed text-fog/45">
              Every AI request flows through a transparent safety pipeline.
              Lighthouse captures and illuminates each stage.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-[10%] right-[10%] top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-beacon/20 to-transparent lg:block" />

            <motion.div
              variants={stagger.container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {pipelineSteps.map((step, i) => (
                <motion.div key={step.label} variants={stagger.item} className="relative">
                  <SpotlightCard className="rounded-2xl border border-white/[0.06] bg-navy/30 backdrop-blur-sm">
                    <div className="p-6 text-center">
                      <div className="mb-4 font-mono text-[10px] uppercase tracking-widest text-beacon/50">
                        Stage {i + 1}
                      </div>
                      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ocean/30 text-fog/70 ring-1 ring-inset ring-white/[0.06]">
                        <step.icon className="h-5 w-5" />
                      </div>
                      <h3 className="mb-1.5 text-sm font-semibold text-fog">
                        {step.label}
                      </h3>
                      <p className="text-xs leading-relaxed text-fog/35">{step.desc}</p>
                    </div>
                  </SpotlightCard>
                  {i < pipelineSteps.length - 1 && (
                    <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-fog/10 lg:flex">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-fog sm:text-4xl">
              Built for Trust &amp; Transparency
            </h2>
            <p className="mx-auto max-w-xl leading-relaxed text-fog/45">
              Lighthouse doesn&apos;t just monitor&nbsp;&mdash;&nbsp;it provides
              the evidence your stakeholders need to trust your AI systems.
            </p>
          </motion.div>

          <motion.div
            variants={stagger.container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {capabilities.map((cap) => (
              <motion.div key={cap.title} variants={stagger.item}>
                <SpotlightCard className="h-full rounded-2xl border border-white/[0.06] bg-navy/30 backdrop-blur-sm">
                  <div className="p-7">
                    <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-beacon/10 text-beacon">
                      <cap.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-fog">{cap.title}</h3>
                    <p className="text-sm leading-relaxed text-fog/40">{cap.desc}</p>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <SpotlightCard className="overflow-hidden rounded-3xl border border-white/[0.06] bg-navy/30 backdrop-blur-md">
              <div className="grid grid-cols-2 lg:grid-cols-4">
                {[
                  { value: "100%", label: "Request Visibility" },
                  { value: "Every", extra: "stage", label: "Pipeline Coverage" },
                  { value: "Real", extra: "time", label: "Alert Latency" },
                  { value: "Full", extra: "audit", label: "Compliance Trail" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className={`px-6 py-10 text-center ${
                      i > 0 ? "border-l border-white/[0.06]" : ""
                    }`}
                  >
                    <div className="text-3xl font-bold tracking-tight text-beacon sm:text-4xl">
                      {stat.value}
                      {stat.extra && (
                        <span className="ml-1 text-lg font-semibold text-beacon/50 sm:text-xl">
                          {stat.extra}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-fog/35">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </SpotlightCard>
          </motion.div>
        </div>
      </section>

      <section className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-fog sm:text-4xl">
                Ready to Navigate Safely?
              </h2>
              <p className="mx-auto max-w-lg leading-relaxed text-fog/45">
                Upload your audit data and let Lighthouse illuminate the path
                forward. Full transparency, zero blind spots.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/harbor"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-beacon px-8 py-3.5 text-sm font-semibold text-navy shadow-[0_0_24px_-4px_rgba(245,158,11,0.35)] transition-all duration-200 hover:bg-beacon-light hover:shadow-[0_0_40px_-4px_rgba(245,158,11,0.5)]"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/beam"
                className="group inline-flex items-center gap-2 text-sm font-medium text-fog/50 transition-colors hover:text-beacon"
              >
                Or explore the Beam
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="h-20" />
    </Spotlight>
  );
}
