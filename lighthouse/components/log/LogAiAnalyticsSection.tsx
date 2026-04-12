"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/** Weekly synthetic counts + combined trend (line) rising across the window. */
const SERIES = [
  { period: "Jan W1", typeA: 9, typeB: 41, combinedTrend: 52 },
  { period: "Jan W2", typeA: 12, typeB: 44, combinedTrend: 58 },
  { period: "Jan W3", typeA: 15, typeB: 48, combinedTrend: 65 },
  { period: "Feb W1", typeA: 18, typeB: 46, combinedTrend: 70 },
  { period: "Feb W2", typeA: 20, typeB: 52, combinedTrend: 76 },
  { period: "Feb W3", typeA: 24, typeB: 56, combinedTrend: 84 },
  { period: "Mar W1", typeA: 27, typeB: 59, combinedTrend: 92 },
];

const HISTORICAL = [
  { ts: "2026-03-12 06:14:02", route: "/v1/claims/bind", cls: "Type A", detail: "rules_inhibition_rule_binding_missing" },
  { ts: "2026-03-12 06:14:08", route: "/v1/claims/bind", cls: "Type A", detail: "validation_retry_phi_path" },
  { ts: "2026-03-12 06:15:41", route: "/v1/auth/session", cls: "Type B", detail: "cross_region_token_drift (peer norm)" },
  { ts: "2026-03-12 06:18:22", route: "/v1/claims/bind", cls: "Type A", detail: "late_field_validation_member_id" },
  { ts: "2026-03-12 06:21:03", route: "/v1/embed/batch", cls: "Type A", detail: "embedding_batch_fragmentation" },
  { ts: "2026-03-12 06:24:51", route: "/v1/auth/session", cls: "Type B", detail: "credential_probe_shadow (industry composite)" },
];

const tipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  color: "rgb(27, 49, 57)",
  fontSize: 12,
};

/**
 * Sticky “AI Generated Analytics” band — pins below the log tab bar while scrolling
 * so it reads as its own workspace once you move past the hero metrics.
 */
export function LogAiAnalyticsSection() {
  return (
    <section className="sticky top-[52px] z-40 mb-6 border-y border-slate-400/60 bg-[#e8ecf2] shadow-[0_4px_18px_rgba(15,23,42,0.12)]">
      <div className="border-b border-slate-300/80 bg-[#f4f6fa] px-5 py-5 sm:px-6">
        <p className="pro-kicker text-brand">Model-assisted readout</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          AI Generated Analytics
        </h2>
        <div className="mt-5 max-w-5xl space-y-4 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
          <p>
            Assisted triage is anchored on <span className="font-semibold text-slate-800">Nimbus Clinical Exchange</span>
            , a clearinghouse whose production traffic is overwhelmingly{" "}
            <span className="font-semibold text-slate-800">healthcare</span>-oriented: large payer
            edits, hospital ADT feeds, and delegated risk contracts. Over the last ninety days we
            retained structured extracts of every inhibition key, HTTP route, and retry chain so the
            model can separate one-off noise from structural drift. That history is what lets us say,
            with confidence, that <span className="font-semibold text-slate-800">Type A</span>{" "}
            failures—binding gaps where required slots never hydrate before the rule engine runs,
            followed by validation retries on PHI-adjacent paths—are now pacing meaningfully above
            Nimbus&apos;s own trailing median, not merely spiking on a single bad deploy.
          </p>
          <p>
            The same pipeline ingests a anonymized <span className="font-semibold text-slate-800">financial services</span>{" "}
            composite built from SaaS lenders and card processors (no raw payloads, only class
            labels and coarse volumes). There, <span className="font-semibold text-slate-800">Type B</span>{" "}
            dominates: credential probing, cross-region auth drift, and token-replay attempts that
            rarely appear in the healthcare slice at comparable prevalence. Showing both cohorts on
            one timeline keeps incident commanders honest—your uptick is specific to Type A in a
            healthcare posture, while Type B remains the industry-wide background hum for financial
            peers.
          </p>
          <p>
            The table below lists a condensed window of representative lines the ranker surfaced when
            explaining this week&apos;s lift. They are not exhaustive; they are the highest-signal
            exemplars tying narrative to raw log keys so auditors can jump from prose to evidence in
            one click in downstream tools.
          </p>
        </div>
      </div>

      <div className="grid gap-4 border-b border-slate-300/60 bg-[#eef1f6] px-4 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="rounded-md border border-slate-300 bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Historical error excerpts
          </h3>
          <p className="mt-1 text-[11px] leading-snug text-slate-500">
            Synthetic sample rows — same schema as live inhibitor logs, scrubbed for demo.
          </p>
          <div className="mt-3 max-h-[220px] overflow-auto rounded border border-slate-200 bg-slate-50">
            <table className="w-full border-collapse text-left text-[10px] font-mono text-slate-800">
              <thead className="sticky top-0 bg-slate-200/90 text-[9px] uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="border-b border-slate-300 px-2 py-1.5">Timestamp</th>
                  <th className="border-b border-slate-300 px-2 py-1.5">Route</th>
                  <th className="border-b border-slate-300 px-2 py-1.5">Class</th>
                  <th className="border-b border-slate-300 px-2 py-1.5">Detail</th>
                </tr>
              </thead>
              <tbody>
                {HISTORICAL.map((row, i) => (
                  <tr key={i} className="border-b border-slate-200/80 hover:bg-white">
                    <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{row.ts}</td>
                    <td className="px-2 py-1.5">{row.route}</td>
                    <td className="px-2 py-1.5">
                      <span
                        className={
                          row.cls === "Type A"
                            ? "font-semibold text-teal-800"
                            : "font-semibold text-indigo-800"
                        }
                      >
                        {row.cls}
                      </span>
                    </td>
                    <td className="max-w-[140px] truncate px-2 py-1.5 text-slate-700" title={row.detail}>
                      {row.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-md border border-slate-300 bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Weekly volume — bars + combined trend
          </h3>
          <p className="mt-1 text-[11px] leading-snug text-slate-500">
            Bars: Type A (healthcare tenant) and Type B (financial industry composite). Line: combined
            weekly total — slope highlights the rising pressure the model is calling out.
          </p>
          <div className="mt-2 h-[260px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={SERIES} margin={{ top: 10, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="period"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  axisLine={{ stroke: "#cbd5e1" }}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  height={54}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={36}
                />
                <Tooltip contentStyle={tipStyle} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar
                  dataKey="typeA"
                  name="Type A (healthcare tenant)"
                  fill="#0d9488"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={22}
                />
                <Bar
                  dataKey="typeB"
                  name="Type B (financial industry)"
                  fill="#6366f1"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={22}
                />
                <Line
                  type="monotone"
                  dataKey="combinedTrend"
                  name="Combined trend"
                  stroke="#b45309"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#b45309" }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
