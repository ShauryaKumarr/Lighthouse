"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const WEEKLY = [
  { week: "W1", typeA: 11, typeB: 44 },
  { week: "W2", typeA: 14, typeB: 47 },
  { week: "W3", typeA: 17, typeB: 51 },
  { week: "W4", typeA: 21, typeB: 49 },
  { week: "W5", typeA: 19, typeB: 54 },
  { week: "W6", typeA: 24, typeB: 57 },
];

const tipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  color: "rgb(27, 49, 57)",
  fontSize: 12,
};

/** Synthetic “AI assisted” narrative + chart for the log console. */
export function LogAiAnalyticsSection() {
  return (
    <section className="mb-6 border border-slate-300 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <p className="pro-kicker text-brand">Model-assisted readout</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          AI assisted analytics
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
          <p>
            <span className="font-semibold text-slate-800">Nimbus Clinical Exchange</span>{" "}
            primarily serves a <span className="font-semibold text-slate-800">healthcare</span>{" "}
            customer base (hospital networks and regional payers). In the current window, assisted
            review flags recurring <span className="font-semibold text-slate-800">Type A</span> log
            errors—binding gaps on policy fields and validation retries on PHI-adjacent paths—above
            this tenant&apos;s own trailing baseline.
          </p>
          <p>
            By contrast, <span className="font-semibold text-slate-800">Type B</span> errors
            (credential probing and cross-region auth drift) are far more common across{" "}
            <span className="font-semibold text-slate-800">financial-services</span> companies in
            this industry benchmark. The chart contrasts your healthcare-tenant Type A signal with a
            composite Type B curve from financial peers so teams can see which failure class
            dominates outside your segment.
          </p>
        </div>
      </div>
      <div className="px-3 pb-4 pt-2 sm:px-5">
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Type A (healthcare tenant) vs Type B (financial industry composite)
        </p>
        <div className="h-[220px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WEEKLY} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={{ stroke: "#cbd5e1" }} />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={40}
              />
              <Tooltip contentStyle={tipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="typeA"
                name="Type A — healthcare tenant (Nimbus)"
                fill="#0d9488"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="typeB"
                name="Type B — financial industry norm"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
