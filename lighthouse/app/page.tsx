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

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);

  return (
    <Spotlight>
      {/* ─── HERO ─── */}
      <section ref={heroRef} className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center"
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
                <span className="h-1.5 w-1.5 rounded-full bg-beacon animate-beacon-pulse" />
                AI Safety Audit Platform
              </span>
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]">
                <span className="text-fog">Illuminate Every</span>
                <br />
                <span className="bg-gradient-to-r from-beacon via-beacon-light to-beacon bg-clip-text text-transparent">
                  AI Decision
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-base sm:text-lg text-fog/55 leading-relaxed">
                Lighthouse gives your team glass-box visibility into AI safety
                Inhibitors. Trace requests, map hazards, and audit every
                intervention&nbsp;&mdash;&nbsp;all in real time.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
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
                className="group inline-flex items-center gap-2 rounded-xl border border-fog/20 bg-fog/[0.03] px-7 py-3.5 text-sm font-semibold text-fog backdrop-blur-sm transition-all duration-200 hover:border-beacon/40 hover:text-beacon hover:bg-beacon/[0.06]"
              >
                Trace a Request
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <div className="flex flex-col items-center gap-2 text-fog/25">
              <span className="text-[10px] uppercase tracking-[0.25em] font-medium">Scroll</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="h-8 w-px bg-gradient-to-b from-fog/25 to-transparent"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-fog mb-4">
              Your Complete Safety Toolkit
            </h2>
            <p className="mx-auto max-w-xl text-fog/45 leading-relaxed">
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
                <Link href={feature.href} className="block h-full group">
                  <SpotlightCard className="h-full rounded-2xl border border-white/[0.08] bg-navy/40 backdrop-blur-md transition-all duration-300 group-hover:border-white/[0.15]">
                    <div className="p-7 sm:p-8 flex flex-col h-full">
                      <div
                        className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${feature.bgColor} ${feature.color} mb-6`}
                      >
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-fog mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-fog/45 leading-relaxed flex-1">
                        {feature.description}
                      </p>
                      <div className="mt-5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${feature.color} opacity-60 group-hover:opacity-100 transition-opacity`}>
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

      {/* ─── HOW IT WORKS ─── */}
      <section className="relative py-28 sm:py-36">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ocean/[0.04] to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-fog mb-4">
              How Lighthouse Works
            </h2>
            <p className="mx-auto max-w-xl text-fog/45 leading-relaxed">
              Every AI request flows through a transparent safety pipeline.
              Lighthouse captures and illuminates each stage.
            </p>
          </motion.div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-beacon/20 to-transparent" />

            <motion.div
              variants={stagger.container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {pipelineSteps.map((step, i) => (
                <motion.div key={step.label} variants={stagger.item} className="relative">
                  <SpotlightCard className="rounded-2xl border border-white/[0.06] bg-navy/30 backdrop-blur-sm">
                    <div className="p-6 text-center">
                      <div className="text-[10px] font-mono text-beacon/50 mb-4 uppercase tracking-widest">
                        Stage {i + 1}
                      </div>
                      <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-ocean/30 text-fog/70 mb-4 ring-1 ring-inset ring-white/[0.06]">
                        <step.icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-semibold text-fog mb-1.5">
                        {step.label}
                      </h3>
                      <p className="text-xs text-fog/35 leading-relaxed">{step.desc}</p>
                    </div>
                  </SpotlightCard>
                  {i < pipelineSteps.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 text-fog/10">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CAPABILITIES ─── */}
      <section className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-fog mb-4">
              Built for Trust &amp; Transparency
            </h2>
            <p className="mx-auto max-w-xl text-fog/45 leading-relaxed">
              Lighthouse doesn&apos;t just monitor&nbsp;&mdash;&nbsp;it provides
              the evidence your stakeholders need to trust your AI systems.
            </p>
          </motion.div>

          <motion.div
            variants={stagger.container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {capabilities.map((cap) => (
              <motion.div key={cap.title} variants={stagger.item}>
                <SpotlightCard className="h-full rounded-2xl border border-white/[0.06] bg-navy/30 backdrop-blur-sm">
                  <div className="p-7">
                    <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-beacon/10 text-beacon mb-5">
                      <cap.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-fog mb-2">{cap.title}</h3>
                    <p className="text-sm text-fog/40 leading-relaxed">{cap.desc}</p>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── STATS BANNER ─── */}
      <section className="relative py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <SpotlightCard className="rounded-3xl border border-white/[0.06] bg-navy/30 backdrop-blur-md overflow-hidden">
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
                    <div className="text-3xl sm:text-4xl font-bold text-beacon tracking-tight">
                      {stat.value}
                      {stat.extra && (
                        <span className="text-beacon/50 text-lg sm:text-xl ml-1 font-semibold">
                          {stat.extra}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-fog/35 uppercase tracking-wider font-medium mt-1.5">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </SpotlightCard>
          </motion.div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-fog">
                Ready to Navigate Safely?
              </h2>
              <p className="mx-auto max-w-lg text-fog/45 leading-relaxed">
                Upload your audit data and let Lighthouse illuminate the path
                forward. Full transparency, zero blind spots.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
