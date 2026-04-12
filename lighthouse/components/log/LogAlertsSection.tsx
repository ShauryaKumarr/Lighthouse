"use client";

import { useState } from "react";
import { Bell, Mail, OctagonAlert, FileBarChart } from "lucide-react";

function ToggleRow({
  icon: Icon,
  title,
  description,
  enabled,
  onChange,
  danger,
}: {
  icon: typeof Mail;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
  danger?: boolean;
}) {
  return (
    <div className="group flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-sm">
      <div className="flex min-w-0 gap-3">
        <span
          className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border transition-transform duration-200 group-hover:scale-105 ${
            danger
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          <Icon className="size-4" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative h-7 w-12 shrink-0 rounded-full border-2 transition-all duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          enabled
            ? danger
              ? "border-red-600 bg-red-600"
              : "border-emerald-600 bg-emerald-600"
            : "border-slate-300 bg-slate-200/80 hover:border-slate-400"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ${
            enabled ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function MiniToggle({
  label,
  sub,
  enabled,
  onChange,
}: {
  label: string;
  sub: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="group flex flex-col gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 transition-all hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-800">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onChange(!enabled)}
          className={`relative h-6 w-10 shrink-0 rounded-full border-2 transition-all hover:scale-105 ${
            enabled ? "border-emerald-600 bg-emerald-600" : "border-slate-300 bg-slate-200"
          }`}
        >
          <span
            className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${
              enabled ? "left-4" : "left-0.5"
            }`}
          />
        </button>
      </div>
      <p className="text-[10px] leading-snug text-slate-500">{sub}</p>
    </div>
  );
}

/** Notification and escalation toggles for the log console. */
export function LogAlertsSection() {
  const [emailNotify, setEmailNotify] = useState(false);
  const [shutdownModel, setShutdownModel] = useState(false);
  const [reportTypeA, setReportTypeA] = useState(true);
  const [reportTypeB, setReportTypeB] = useState(true);
  const [reportCritical, setReportCritical] = useState(true);

  return (
    <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="mb-4 flex items-center gap-2">
        <Bell className="size-5 text-brand" aria-hidden />
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          Alerts & notifications
        </h2>
      </div>
      <p className="mb-5 max-w-3xl text-sm leading-relaxed text-slate-600">
        Configure how Lighthouse should react when inhibition patterns cross thresholds. These are
        demo toggles only—they do not call external services in this build.
      </p>
      <div className="space-y-3">
        <ToggleRow
          icon={Mail}
          title="Email notifications"
          description="Send digest and real-time emails to on-call when new Type A / Type B clusters appear in the rolling buffer."
          enabled={emailNotify}
          onChange={setEmailNotify}
        />
        <ToggleRow
          icon={OctagonAlert}
          title="Shut down model ingress"
          description="Halt scoring traffic for the affected deployment key until an operator clears the flag (simulated kill-switch)."
          enabled={shutdownModel}
          onChange={setShutdownModel}
          danger
        />
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <FileBarChart className="size-4 text-slate-600" aria-hidden />
            <p className="text-sm font-semibold text-slate-900">Error log reports by type</p>
          </div>
          <p className="mb-3 text-xs text-slate-600">
            Emit structured incident bundles (CSV + JSONL) filtered by error class for auditors.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <MiniToggle
              label="Type A"
              sub="Binding / validation faults."
              enabled={reportTypeA}
              onChange={setReportTypeA}
            />
            <MiniToggle
              label="Type B"
              sub="Auth drift / probes."
              enabled={reportTypeB}
              onChange={setReportTypeB}
            />
            <MiniToggle
              label="Critical-only"
              sub="Severities marked critical."
              enabled={reportCritical}
              onChange={setReportCritical}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
