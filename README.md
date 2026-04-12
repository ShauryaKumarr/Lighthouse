# Lighthouse: Glass Box Audit Dashboard

A comprehensive audit and compliance dashboard designed to make AI safety Inhibitor interventions transparent, understandable, and auditor-friendly. Built for the **Philly Codefest 2026 -- Challenge 3: Glass Box**.

## Overview

Lighthouse transforms raw Inhibitor pipeline logs into an interactive, visually-driven audit interface that enables compliance reviewers, auditors, and executives to understand exactly how and why AI agent actions were blocked, interrupted, or warned. The dashboard provides complete traceability from request initiation through rule evaluation, observations, predictions, and corrective actions.

## Key Features

### 1. **Harbor Overview** (`/harbor`)
The executive summary dashboard provides at-a-glance visibility into safety interventions across your AI pipeline:
- **KPI Cards** – Total interventions, blocked requests, intervention rate, and system uptime metrics
- **Request Volume Timeline** – Visualize intervention trends over time with interactive Recharts
- **Severity Breakdown** – Pie chart distribution of high/medium/low severity interventions
- **Hazard Class Distribution** – Bar chart showing which risk categories trigger the most interventions
- **Beacon Alert Cards** – Individual intervention summaries with intervention type, policy trigger, and corrected action preview

### 2. **The Beam** (`/beam`)
Deep-dive into individual request lifecycles with full pipeline visibility:
- **Request Index** – Browse all 120 request lifecycles in the sample dataset
- **Pipeline Waterfall** – Click any request to open a detailed timeline visualization showing:
  - Embedding generation events
  - LLM reasoning and prompt execution
  - Rule evaluation checkpoints
  - Observations and risk signals
  - Predictions and policy triggers
  - Final intervention action
- **Color-Coded Events** – Each event category has distinct visual styling for quick scanning
- **Interactive Tooltips** – Hover over any event to see full JSON metadata
- **Proposed vs. Corrected Actions** – Side-by-side comparison of what the agent attempted vs. what the Inhibitor substituted

### 3. **Hazard Map** (`/hazards`)
Regulatory and risk analytics for compliance officers:
- **Observation/Prediction Co-occurrence Heatmap** – Identify which risk signals commonly appear together
- **Regulation Mapping** – Automatic tagging of interventions to applicable regulations:
  - GDPR Articles 13-14 (right to information)
  - CCPA Section 1798.100 (consumer rights)
  - EU AI Act Articles 10 & 14 (transparency and documentation)
- **Hazard Trend Analysis** – Time-series view of how hazard signals evolve
- **Severity Distribution** – Understand which hazard classes drive the most critical interventions

### 4. **Lighthouse Log** (`/log`)
Searchable, filterable event table for detailed audit trail work:
- **Full-Text Search** – Find events by agent ID, request ID, policy trigger, or reason text
- **Multi-Column Filtering** – Filter by timestamp range, severity, mode, action type, and hazard class
- **Pagination** – Efficiently browse large datasets with configurable page sizes
- **Expandable Rows** – Click any row to expand and view complete JSON metadata
- **CSV Export** – Download filtered results as a compliance-ready audit trail

## Architecture & Tech Stack

### Frontend
- **Next.js 16** (App Router) – Server and client components for optimal performance
- **React 19** – Latest hooks and concurrent rendering
- **TypeScript** – Full type safety across the application
- **Tailwind CSS v4** – Modern utility-first styling with JIT compilation
- **shadcn/ui** – Accessible component library built on Radix UI primitives

### Data Visualization
- **Recharts** – Composable, responsive charts for timelines, distributions, and heatmaps
- **Framer Motion** – Smooth animations and interactive transitions
- **TanStack Table (React Table)** – Headless data grid with advanced filtering and sorting
- **TanStack React Virtual** – Virtualization for rendering thousands of rows efficiently

### Data Processing
- **PapaParse** – Robust CSV parsing with Python dict syntax sanitization
- **JSONL Parser** – Custom line-by-line JSON streaming parser
- **React Context API** – App-wide data state management without external libraries

### Build & Deployment
- **Static Export** – Next.js `output: "export"` for edge-optimized static hosting
- **Unoptimized Images** – No server-side image optimization (all images are static assets)
- **Vercel** – Deployment platform with automatic preview deployments

## Quick Start

### Prerequisites
- Node.js 20+ (as specified in GitHub Actions)
- npm or yarn package manager

### Local Development

```bash
# Clone and navigate to the project
git clone https://github.com/ShauryaKumarr/Lighthouse.git
cd Lighthouse/lighthouse

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be redirected to the Harbor Overview page. The welcome landing page is available at [http://localhost:3000/welcome](http://localhost:3000/welcome).

### Production Build

```bash
# Build the static export
npm run build

# Output is generated in the `out/` directory
ls out/
```

## Data Format Specification

Lighthouse is designed to consume two primary data sources from the Inhibitor drift audit pipeline:

### 1. Inhibitor Logs CSV (`inhibitor_logs.csv`)

Raw event log containing every pipeline operation and state transition.

**Schema:**

| Column    | Type   | Description |
|-----------|--------|-------------|
| (index)   | int    | Row index for reference |
| timestamp | string | ISO 8601 datetime of the event (e.g., `2026-04-11T15:23:45.123Z`) |
| apiKey    | string | API key identifier for the request source (e.g., `key_abc123`) |
| event     | string | Internal event type (e.g., `embedding_start`, `llm_completion`, `rule_eval_begin`, `rule_eval_end`, `observation_recorded`, `prediction_made`) |
| meta      | string | JSON metadata in Python dict syntax (auto-sanitized by parser) |

**Example:**
```csv
timestamp,apiKey,event,meta
2026-04-11T10:00:00.000Z,key_user_001,embedding_start,"{'dimension': 1536, 'model': 'text-embedding-3-large'}"
2026-04-11T10:00:00.234Z,key_user_001,embedding_complete,"{'tokens': 42, 'latency_ms': 234}"
2026-04-11T10:00:00.500Z,key_user_001,llm_completion,"{'prompt_tokens': 128, 'completion_tokens': 87, 'model': 'gpt-4'}"
```

### 2. Inhibitor Events JSONL (`inhibitor_events.jsonl`)

High-level intervention summaries with one JSON object per line.

**Schema:**

| Field | Type | Description |
|-------|------|-------------|
| timestamp | string | ISO 8601 timestamp of the intervention |
| agent_id | string | Unique identifier of the AI agent (e.g., `agent_retrieval_001`) |
| request_id | string | Unique request identifier (e.g., `req_7f3a8b2c`) |
| mode | string | Intervention mode: `insight` (monitoring) or `performance` (active intervention) |
| policy_trigger | string | Human-readable policy rule that triggered (e.g., `"Output contains PII"`, `"High confidence hallucination"`) |
| severity | string | Risk level: `high`, `medium`, or `low` |
| action | string | Intervention type: `blocked` (request aborted), `interrupted` (action paused), or `warned` (notification sent) |
| reason | string | Detailed explanation suitable for auditors (e.g., `"Detected email address in generated output. Policy: CCPA Section 1798.100 (consumer data protection)"`) |
| proposed_action | string | What the agent intended to do (e.g., `"Email user support@example.com with generated response"`) |
| corrected_action | string | What the Inhibitor did instead (e.g., `"Blocked email send. User notified of policy violation."`) |

**Example:**
```json
{"timestamp": "2026-04-11T10:00:02.456Z", "agent_id": "agent_retrieval_001", "request_id": "req_7f3a8b2c", "mode": "performance", "policy_trigger": "Output contains PII", "severity": "high", "action": "blocked", "reason": "Detected email address in generated output. Policy: CCPA Section 1798.100 (consumer data protection).", "proposed_action": "Email user support@example.com with generated response", "corrected_action": "Blocked email send. User notified of policy violation."}
```

## Data Loading & File Upload

### Default Sample Data
On first load, Lighthouse automatically loads sample data from `public/sample_logs/set_a/`:
- `inhibitor_logs.csv` – 500+ event records
- `inhibitor_events.jsonl` – 120 intervention summaries

### Custom Dataset Upload
1. Navigate to **Harbor Overview** (`/harbor`)
2. Click **"Upload custom logs"** button
3. Select your CSV and JSONL files
4. The dashboard will parse, validate, and display your data in real-time

The upload parser:
- Sanitizes Python dict syntax in the `meta` column
- Validates required fields in JSONL objects
- Groups events into request lifecycles
- Computes aggregate metrics (KPIs, trend lines, etc.)
- Provides error feedback if the format is invalid

## Project Structure

```
Lighthouse/
├── LICENSE
├── README.md                          # Root README (you are here)
├── .github/
│   └── workflows/
│       └── deploy.yml                 # GitHub Pages static deployment config
├── .gitignore
├── vercel.json                        # Vercel build configuration
├── lighthouse/                        # Main Next.js application
│   ├── package.json
│   ├── next.config.ts                 # Static export + image config
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── README.md                      # Detailed project documentation
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with data context provider
│   │   ├── page.tsx                   # Redirects / → /harbor
│   │   ├── welcome/
│   │   │   └── page.tsx               # Marketing hero page (dark theme)
│   │   ├── harbor/
│   │   │   └── page.tsx               # Executive summary dashboard
│   │   ├── beam/
│   │   │   ├── page.tsx               # Request lifecycle list view
│   │   │   └── [requestIndex]/
│   │   │       └── page.tsx           # Pipeline waterfall detail view
│   │   ├── hazards/
│   │   │   └── page.tsx               # Risk heatmap + regulation mapping
│   │   └── log/
│   │       └── page.tsx               # Searchable event table
│   ├── components/
│   │   ├── NavBar.tsx                 # Top navigation bar
│   │   ├── LighthouseLogo.tsx         # SVG logo component
│   │   ├── harbor/                    # Harbor page components
│   │   │   ├── KPICards.tsx
│   │   │   ├── RequestTimeline.tsx
│   │   │   ├── SeverityChart.tsx
│   │   │   ├── HazardChart.tsx
│   │   │   └── AlertCards.tsx
│   │   ├── beam/                      # Beam page components
│   │   │   ├── RequestIndex.tsx
│   │   │   └── Waterfall.tsx
│   │   ├── hazards/                   # Hazard Map components
│   │   │   ├── ObservationHeatmap.tsx
│   │   │   ├── RegulationMap.tsx
│   │   │   └── TrendChart.tsx
│   │   └── log/                       # Log page components
│   │       ├── DataTable.tsx
│   │       ├── SearchFilter.tsx
│   │       └── ExpandableRow.tsx
│   ├── lib/
│   │   ├── types.ts                   # TypeScript interfaces and constants
│   │   ├── parse-csv.ts               # CSV parsing with dict sanitization
│   │   ├── parse-jsonl.ts             # JSONL line-by-line parser
│   │   ├── group-lifecycles.ts        # Request lifecycle reconstruction
│   │   ├── derive-metrics.ts          # KPI and aggregate metric calculation
│   │   └── data-context.tsx           # React context for app-wide state
│   ├── public/
│   │   └── sample_logs/
│   │       └── set_a/                 # Sample dataset (included in repo)
│   │           ├── inhibitor_logs.csv
│   │           └── inhibitor_events.jsonl
│   ├── styles/
│   │   └── globals.css                # Tailwind directives
│   └── out/                           # Build output (static export)
└── node_modules/
```

## Styling & Design System

Lighthouse uses Tailwind CSS v4 with a custom color palette optimized for audit interfaces:

### Color Tokens
- **Primary** – `#1B3139` (deep navy, brand color)
- **Beacon** – `#FF6B5B` (warning/alert red)
- **Fog** – `#8B98A8` (neutral gray for secondary text)
- **Brand** – `#1B3139` (logo and primary accents)

### Typography
- **Headings** – `font-sans` with `font-bold` / `font-semibold`
- **Body** – `font-sans` at 16px (1rem) with 1.5 line height
- **Mono** – `font-mono` for event types, code snippets, and API keys

### Dark Mode
The Harbor, Beam, and Hazards pages use a dark theme (`bg-navy`) optimized for extended audit sessions. The Welcome page uses a light theme. Navigation intelligently switches theme based on current route.

## Regulatory Compliance Mapping

Lighthouse automatically tags interventions to relevant regulations:

| Regulation | Reference | Trigger |
|-----------|-----------|---------|
| GDPR | Article 13-14 (Right to Information) | Detected personal data disclosure |
| CCPA | Section 1798.100 (Consumer Rights) | Detected PII in output, data export violation |
| EU AI Act | Article 10 (Transparency) | High-risk AI decision documented |
| EU AI Act | Article 14 (Documentation) | Intervention logged and auditable |

Tags appear as badges on the Hazard Map and are exported with CSV audit trails.

## Development Workflow

### Adding a New Page
1. Create a new directory under `app/` (e.g., `app/custom-page/`)
2. Add `page.tsx` with a React component
3. Update `NavBar.tsx` to add a link if needed
4. The route is automatically available at `/custom-page`

### Adding a New Chart
1. Import Recharts components in your page
2. Use the data from the global `DataContext`
3. Recharts handles responsiveness automatically
4. Test on multiple screen sizes

### Styling Components
1. Use Tailwind utility classes directly in JSX
2. For complex styles, define `className` strings at the top of the component
3. Use CSS custom properties for theme colors via `--` variables
4. Run `npm run build` to validate all styles compile correctly

### Parsing Custom Data
1. Export your parser function from `lib/parse-*.ts`
2. Call it in `DataContext.tsx`
3. Store results in the context's state
4. Components automatically access via `useContext(DataContext)`

## Testing & Quality Assurance

### Local Testing
```bash
npm run dev          # Start dev server
npm run build        # Test production build
npm run lint         # Run ESLint
```

### Build Validation
The GitHub Actions workflow (`.github/workflows/deploy.yml`) runs:
1. Install dependencies
2. ESLint validation
3. TypeScript type checking
4. Next.js build with static export
5. Deployment to Vercel (on main branch push)

## Deployment

### GitHub Pages (Static Export)
The project is configured for GitHub Pages via the `.github/workflows/deploy.yml` workflow:
- Triggers on every push to `main`
- Builds static HTML, CSS, and JavaScript
- Deploys to GitHub Pages (`/Lighthouse` repository)

### Vercel
The project is also deployed to Vercel with automatic preview deployments:
- Production: https://lighthouse-jade-nine.vercel.app
- Preview deployments on pull requests
- Configuration via `vercel.json`

To deploy locally:
```bash
npm run build
npm run start          # Preview the static export
```

## Performance Considerations

### Static Generation
All pages are pre-rendered as static HTML at build time. No server-side rendering or API routes are used. This ensures:
- **Fast Time to Interactive (TTI)** – Pages load in <100ms on modern connections
- **Zero Runtime Server Cost** – Can be hosted on any static file server
- **Edge Caching** – Static assets can be cached globally on CDNs

### Virtualization
Large datasets (1000+ rows in the log table) use TanStack React Virtual to render only visible rows, maintaining 60fps scrolling.

### Image Optimization
All images are static assets. No dynamic image optimization is performed (configured via `next.config.ts`).

## Troubleshooting

### "404: NOT_FOUND" on Vercel
If the deployed site shows a 404 error:
1. Verify `vercel.json` exists in the root
2. Ensure `outputDirectory` points to the correct build output path
3. Check that `buildCommand` correctly navigates to the `lighthouse` subdirectory
4. Manually trigger a redeployment from the Vercel dashboard

### Data Not Loading
If custom data doesn't appear after upload:
1. Check the browser console for parse errors
2. Validate CSV headers match the schema
3. Ensure JSONL contains one valid JSON object per line
4. Try the sample data first to rule out parser issues

### Styling Looks Broken
1. Verify Tailwind v4 is installed: `npm list tailwindcss`
2. Run `npm run build` to trigger CSS compilation
3. Clear browser cache (Cmd+Shift+Delete on macOS)
4. Check that `tailwind.config.ts` is in the root of the `lighthouse/` directory

## Contributing

This project was built for Philly Codefest 2026. To contribute:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a pull request with a detailed description

## License

This project is provided under the terms specified in the `LICENSE` file.

## Support & Contact

For questions about the Lighthouse project, compliance integrations, or data format support, please open an issue in the GitHub repository.

---

**Built with ❤️ for AI Safety & Compliance**

Lighthouse makes the invisible visible. Every intervention tells a story. Every story deserves an audit.
