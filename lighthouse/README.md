# Lighthouse -- Glass Box Audit Dashboard

An audit dashboard that makes AI safety Inhibitor interventions visible and understandable. Built for the **Philly Codefest 2026 -- Challenge 3: Glass Box**.

## Quick Start

```bash
cd lighthouse
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Expected Log Input

Lighthouse consumes two data files from the Inhibitor drift audit:

### `inhibitor_logs.csv`

Raw pipeline event log. Schema:

| Column    | Type   | Description                                          |
|-----------|--------|------------------------------------------------------|
| (index)   | int    | Row index                                            |
| timestamp | string | ISO 8601 timestamp of the event                      |
| apiKey    | string | API key identifier for the request source            |
| event     | string | Internal event type (e.g. `embedding_start`)         |
| meta      | string | JSON metadata (Python dict syntax, auto-sanitized)   |

### `inhibitor_events.jsonl`

High-level intervention summaries. One JSON object per line:

| Field            | Type   | Description                                |
|------------------|--------|--------------------------------------------|
| timestamp        | string | ISO 8601 timestamp                         |
| agent_id         | string | Identifier of the AI agent                 |
| request_id       | string | Unique request identifier                  |
| mode             | string | `insight` or `performance`                 |
| policy_trigger   | string | Policy rule that triggered intervention    |
| severity         | string | `high`, `medium`, or `low`                 |
| action           | string | `blocked`, `interrupted`, or `warned`      |
| reason           | string | Human-readable explanation                 |
| proposed_action  | string | What the agent attempted                   |
| corrected_action | string | What the Inhibitor substituted             |

## Rendering Behavior

The dashboard loads sample data from `public/sample_logs/set_a/` on startup. Custom datasets can be uploaded via the **Upload custom logs** button on the Harbor Overview page.

### Pages

1. **Harbor Overview** (`/`) -- Executive summary with KPI cards, request volume timeline, severity breakdown, hazard class distribution, and Beacon Alert cards for each intervention.

2. **The Beam** (`/beam`) -- Browse all 120 request lifecycles. Click any request to see a full pipeline waterfall visualization showing embeddings, LLM reasoning, rule evaluation, observations, and predictions on a timeline. Each event is color-coded by category and has hover tooltips with metadata.

3. **Hazard Map** (`/hazards`) -- Aggregate risk signal analysis: observation/prediction co-occurrence heatmap, regulation mapping badges (GDPR, CCPA, EU AI Act), and hazard signal trends over time.

4. **Lighthouse Log** (`/log`) -- Searchable, filterable event table with pagination and CSV export. Click any row to expand its full metadata JSON.

## How This UI Supports Audit/Compliance Review

Lighthouse transforms raw Inhibitor pipeline logs into an auditor-friendly interface:

- **Transparent Interventions**: Every blocked or interrupted AI agent action is displayed with the proposed action, the reason it was flagged, and the corrected action -- giving compliance reviewers a complete before/after picture.

- **Pipeline Traceability**: The Beam view provides a glass-box look into the Inhibitor's internal reasoning for each request, showing exactly which embeddings were generated, which LLM prompts were executed, which rules were evaluated, and what observations and predictions emerged. This supports root-cause analysis and reproducibility requirements.

- **Regulatory Mapping**: Risk predictions are automatically tagged with the specific regulation they relate to (GDPR Art. 13-14, CCPA Section 1798.100, EU AI Act Art. 10/14), enabling compliance officers to trace interventions to regulatory obligations.

- **Exportable Evidence**: The log explorer supports filtered CSV export, producing audit trail evidence suitable for compliance documentation.

- **Non-Technical Accessibility**: All risk signals use plain-English labels alongside their technical keys. The interface is designed for auditors and executives, not just engineers.

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Recharts (charts) + Framer Motion (animations)
- PapaParse (CSV parsing) + TanStack Table (data grid)

## Project Structure

```
lighthouse/
  app/
    page.tsx            -- Harbor Overview
    beam/
      page.tsx          -- Request trace listing
      [requestIndex]/
        page.tsx        -- Pipeline waterfall detail
    hazards/
      page.tsx          -- Hazard heatmap + regulation map
    log/
      page.tsx          -- Filterable event table
  components/
    harbor/             -- KPI stats, charts, alert cards
    beam/               -- Waterfall timeline, observation/prediction panels
    hazards/            -- Heatmap, regulation tags, trend chart
    log/                -- Data table with filters
  lib/
    types.ts            -- TypeScript interfaces + constants
    parse-csv.ts        -- CSV ingestion with Python dict sanitization
    parse-jsonl.ts      -- JSONL parsing
    group-lifecycles.ts -- Request lifecycle reconstruction
    derive-metrics.ts   -- Computed aggregate metrics
    data-context.tsx    -- React context for app-wide data state
  public/
    sample_logs/set_a/  -- Read-only sample data
```
