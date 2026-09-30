# AI Pre-Renewal Intelligence Platform — Surety/Insurance Underwriting SPA

## What It Does

SuretyIQ is an enterprise-grade pre-renewal intelligence platform for surety and insurance underwriters. It aggregates renewal case data, surfaces AI-generated risk signals and underwriting briefs, and supports L1/L2 underwriting decisions with a mandatory human-acknowledgement workflow. The platform ensures AI assists — but never silently replaces — underwriter authority.

## Key Features

- **Underwriting Dashboard** — Portfolio KPI cards (aggregate exposure, hit rate, AI adoption), expiry pipeline bands (30/60/90 days), active alerts strip, and recent audit activity feed
- **Renewal Pipeline** — Filterable/sortable case table with risk scores, AI recommendations, and status badges; click-through to full case detail
- **AI Advisory Panel** — Collapsible teal-accented panel per case with confidence score ring, risk/positive factor breakdown, mandatory acknowledgement checkbox, and optional override reason capture
- **Case Detail View** — Full case header, bond metadata, risk signal chips, linked information requests, correspondence log, and L2 UW decision buttons (Approve / Approve w/ Conditions / Request Info / Decline)
- **Alert Management** — Severity-coded alerts (Critical/High/Medium) with one-click acknowledge actions surfaced on the dashboard
- **Async API Abstraction** — All data flows through a mock API client with simulated latency, ready to swap for real REST endpoints
- **Application Shell** — Fixed sidebar with collapsible nav, breadcrumb trail, notification bell, role pill (Sarah Chen — L2 Senior UW), toast notifications, and loading/empty states throughout

## How to Run

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal (typically `http://localhost:5173`).

## Tech Stack

- **React 18** — Functional components and hooks
- **Vite** — Fast dev server and build tooling
- **Tailwind CSS** — Utility-first styling (Risk Neutral Graphite & Teal theme)
- **React Router DOM v6** — HashRouter with nested routes
- **Lucide React** — Icon system
- **Recharts** — Available for future chart components

## Project Structure

- `src/data/mockData.js` — All domain mock entities: renewal cases, portfolio metrics, alerts, correspondence, info requests, AI advisory panels, and audit log
- `src/services/apiClient.js` — Async API adapter wrapping mock data with simulated delays; all CRUD operations ready for real endpoint substitution
- `src/components/UnderwritingDashboard.jsx` — Dashboard view with KPI cards, expiry pipeline, alerts strip, and activity feed
- `src/components/RenewalPipeline.jsx` — Pipeline table, case detail view, AI Advisory Panel, IR/correspondence sub-tables, and UW decision controls
- `src/App.jsx` — Application shell: HashRouter, sidebar navigation, header bar, toast context, modal context, and all route definitions
