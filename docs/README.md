# KestrelCI — Orchestration & Pipeline Simulation Platform

```
 █▄▀ █▀▀ █▀ ▀█▀ █▀█ █▀▀ █   
 █ █ ██▄ ▄█  █  █▀▄ ██▄ █▄▄ 
 Continuous Integration & Delivery Simulation Engine
```

**KestrelCI** is an editorial, production-quality web application that simulates continuous integration and delivery pipelines. Software teams can define projects, trigger execution runs, observe live status transitions across seven sequential stages, inspect realistic timestamped logs, browse persisted run histories, and experiment with deterministic failure injection and recovery workflows.

---

## ╔══════════════════════════════════════════════════════════════╗
## ║  API KEY  >>>  set API_KEY in server/.env  (never commit it)  ║
## ╚══════════════════════════════════════════════════════════════╝

All write operations (`POST`, `PUT`, `DELETE`) require the `X-API-Key` authentication header:
```bash
API_KEY=kestrel_demo_key_7f8d9a2b1c4e6f
```
> **Honesty Note on Demo Authentication**: In this standalone single-user demo, the key identifies the browser client. Embedding credentials in client bundles is strictly for demo purposes; production multi-tenant deployments should use secure HTTP-only session cookies or an authenticated reverse proxy.

---

## The Honesty Rule (Non-Negotiable)

**Every pipeline stage in KestrelCI is simulated.**
The application emits realistic diagnostic logs (test case tallies, cyclomatic complexity alerts, CVE security findings, and Docker layer cache hits) and enforces realistic execution durations, but **never** connects to live external Docker daemons, clones external git remotes, or executes code on remote cloud clusters. Every stage, run, and documentation page displays a prominent **"Simulated"** badge.

---

## Tech Stack & Architecture

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS with custom CSS variables design tokens (`tokens.css`).
- **Backend**: Node.js + Express, versioned API under `/api/v1`.
- **Database**: SQLite via `better-sqlite3` (with native `node:sqlite` DatabaseSync fallback), WAL mode enabled, foreign keys enforced.
- **Validation**: Strict `zod` schemas on every request body, parameter, and query.
- **Testing**: Vitest (engine unit tests + frontend component tests) and Supertest (API integration tests).
- **Security**: Helmet, CORS allow-listing, express-rate-limit, request logging, and constant-time API key verification.

```
React client (Vite SPA)  --HTTP/JSON (1s Poll)-->  Express API (/api/v1)
                                                         │
                                        ┌────────────────┴───────────────┐
                                        ▼                                ▼
                              Services & Repositories            Pipeline Engine
                                        │                                │
                                        ▼                                ▼
                              SQLite File (WAL mode)            7 Stage Executors
```

---

## Quick Start (Zero to Running in 60s)

### 1. Prerequisites
- Node.js >= 18 (Node 20, 22, and 26 supported)
- npm >= 9

### 2. Install Dependencies
```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 3. Initialize Database & Seed Demo Data
```bash
npm run migrate
npm run seed
```

### 4. Start Development Server
Starts the Express API server (port 4000) and the React Vite client (port 5173) concurrently:
```bash
npm run dev
```

Open your browser to: **[http://localhost:5173](http://localhost:5173)**

---

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Concurrently starts Express API backend (4000) and Vite frontend (5173) |
| `npm run build` | Builds the optimized production frontend bundle into `client/dist` |
| `npm test` | Runs the full Vitest suite (both backend API/engine and frontend components) |
| `npm test:server` | Runs server unit and Supertest integration tests |
| `npm test:client` | Runs frontend React component tests |
| `npm run migrate` | Runs the transactional SQLite schema migration runner |
| `npm run seed` | Seeds demo projects, pipelines, and historical execution records |

---

## The Seven Pipeline Stages (In Order)

1. **Source Checkout** (`source_checkout`): Git clone simulation, commit sha verification, branch checkout.
2. **Build & Compile** (`build`): Dependency resolution, compiler toolchain, artifact bundle emission.
3. **Unit Tests** (`unit_tests`): Test suite execution, assertion passes/fails, coverage calculation.
4. **Code Quality** (`code_quality`): ESLint static analysis, cyclomatic complexity, maintainability grade.
5. **Security Scan** (`security_scan`): Dependency vulnerability audit, SAST check, CVE finding report with severity.
6. **Docker Build** (`docker_build`): Multi-stage container compilation, layer cache hits, OCI image tagging.
7. **Deploy (Dev)** (`deploy_dev`): Kubernetes rollout simulation, readiness probe polling, active ingress endpoint.

---

## Failure Injection & Resilience Testing

The execution modal offers:
- **Run normally**: Runs all seven stages cleanly to completion.
- **Run with failure at...**: Deterministically injects a failure at any chosen stage (e.g., `unit_tests` or `security_scan`).
- **Failure Propagation**: When a stage fails, all subsequent downstream stages are immediately marked as **`skipped`**, the run is marked **`failed`**, and root-cause diagnostic logs are recorded.
- **Smart Retry**: Clicking **"Retry from failed stage"** preserves earlier successful stage results and resumes execution directly from the stage that failed.

---

## Global Search & Keyboard Shortcuts

- Press <kbd>Cmd</kbd> + <kbd>K</kbd> or <kbd>Ctrl</kbd> + <kbd>K</kbd> anywhere in the application to open the command palette.
- Navigate results with <kbd>↑</kbd> and <kbd>↓</kbd> arrows, press <kbd>Enter</kbd> to jump, and <kbd>Esc</kbd> to close.
- Results are dynamically grouped across Pages, Projects, Runs, and Documentation/FAQ entries.

---

## Documentation Index

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): Architectural flow, state machines, and Mermaid diagrams.
- [`docs/DATABASE.md`](docs/DATABASE.md): Schema ERD in Mermaid, migration how-to, and PostgreSQL migration guide.
- [`docs/API.md`](docs/API.md): Complete REST API guide, error schemas, and cURL commands.
- [`docs/openapi.yaml`](docs/openapi.yaml): Full OpenAPI 3.0 specification.
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md): CSS variable design tokens, typography, motion curves, and anti-AI slop principles.
- [`docs/EXTENDING.md`](docs/EXTENDING.md): Step-by-step guide to adding stages, real Docker executors, and distributed job queues.
- [`docs/DECISIONS.md`](docs/DECISIONS.md): Architectural Decision Records (ADRs) explaining technical choices.
- [`docs/CHANGELOG.md`](docs/CHANGELOG.md): Version release history.

---

## Troubleshooting

- **EADDRINUSE (Port 4000 or 5173 busy)**: Update `PORT` in `server/.env` or specify `server: { port: 5174 }` in `client/vite.config.js`.
- **Resetting Database**: To wipe the database and re-seed from scratch, delete `server/data/app.sqlite` and run `npm run migrate && npm run seed`.
- **Keyboard Navigation**: Press <kbd>Tab</kbd> upon loading the page to reveal the skip links ("Skip to main content" and "Skip to contact").
