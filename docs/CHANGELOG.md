# KestrelCI Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-10-13

### Added
- **GitHub Public API Repository Intelligence**:
  - Direct integration with GitHub REST API (`/repos/{owner}/{repo}`, `/commits`, `/languages`, `/contents/{manifest}`) for public repositories.
  - Robust SSRF protection in `server/utils/githubUrl.js` rejecting localhost, private IPs, cloud metadata IPs, non-GitHub domains, and SSH/file protocols.
  - Safe manifest parser supporting `package.json`, `requirements.txt`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`, `build.gradle`, and GitHub Actions workflows.
  - Strict 100 KB manifest file size ceiling; zero code execution, cloning, or dependency downloading.
  - Dual-tier caching (`RepoAnalyzer`) utilizing in-memory TTL map and SQLite `repo_analyses` persistence table (600s TTL).
  - Centralized GitHub configuration with rate-limit warnings and `GITHUB_TOKEN` support.
  - Endpoints: `POST /api/v1/projects/analyze-url`, `POST /api/v1/projects/:id/analyze`, `GET /api/v1/projects/:id/analysis`, `GET /api/v1/runs/:id/analysis`.
- **Hybrid Pipeline Execution**:
  - `Source Checkout` stage fetches real commit metadata (SHA, author, message, branch) and outputs a zero-download honesty notice (`source: 'real'`). Gracefully falls back to simulation when offline or unconfigured.
  - `Build` stage tailors diagnostic logs to detected ecosystems, frameworks, package managers, and scripts (`source: 'real'`), followed by simulated compiler telemetry (`source: 'simulated'`).
  - Strict provenance tagging across `stage_runs.source` and `logs.source` (`'real'` vs `'simulated'`).
- **Database Schema Migration (`002_github_repo_analysis.sql`)**:
  - Added `repo_analyses` table.
  - Added `repo_owner`, `repo_name` columns to `projects`.
  - Added `commit_sha`, `branch` columns to `pipeline_runs`.
  - Added `source` column to `stage_runs` and `logs` with check constraints `CHECK(source IN ('real', 'simulated'))`.
- **Frontend Provenance & Intelligence UI**:
  - Pre-save repository inspection button and live stack preview in `CreateProjectModal`.
  - Repository Intelligence panel in `ProjectDetailPage` with language distribution bar, detected tech stack chips, manifest file tags, and external commit links.
  - Restrained, quiet `SourceTag` component conforming to the pure black Squarespace Design Intelligence aesthetic.
  - Interactive source filter dropdown (`All Sources`, `Real (GitHub API)`, `Simulated`) and line-level tags in `LogViewer`.
  - External GitHub commit dispatch links in `RunDetailPage` and `HistoryPage`.
  - Updated FAQ and Privacy Policy sections with explicit zero-code-execution disclosures.
- **Automated Tests**:
  - Added 26 new unit tests across `githubUrl.spec.js`, `githubService.spec.js`, and `hybridExecutors.spec.js`.

---

## [1.1.0] - 2026-10-13

### Changed
- **Complete Presentation Layer Overhaul (Squarespace Design Intelligence Language)**:
  - Eliminated SaaS template aesthetic (no warm off-white pages, shouting bold headlines, pill badges, orange buttons, or stacked dashboard mockups).
  - Adopted pure black (`#000000`) cinematic stage canvas for hero and closing CTA band.
  - Replaced design tokens in `tokens.css` and `tailwind.config.js` with permanent stage black, crisp paper white light theme (`#FDFCFA`), warm obsidian dark theme (`#07070A`), and hairline borders (`rgba(255,255,255,0.12)`).
  - Transitioned typography to editorial triad: `Instrument Sans` (300/400/500), `Instrument Serif` (high-contrast display serif), and `JetBrains Mono` (tabular technical metrics).
  - Implemented Three.js WebGL particle sphere with 42,000 points, GPU vertex breathing, slow axial rotation, amber dust emission streams, intro assembly animation, and scroll dissolution.
  - Implemented 3D floating perspective cards with individual `rotateX/Y/Z` coordinate matrices and overlapping pinned status chips (`RUNNING`, `STDOUT`, `EXIT 1`, `PROV_OK`).
  - Restyled primary buttons into high-contrast monochrome solid rectangles with square corners (`rounded-[2px]`) and animated arrow glyphs.
  - Restyled secondary actions into text links with animated line drawing (`.draw-underline`).
  - Rebuilt landing page rhythm: Cinematic Hero → Statement Section → 5 Asymmetric Feature Blocks with live interactive components (`LiveMiniPipeline`, `LiveLogStream`, `LiveTelemetryMetrics`, `LiveExecutionArchive`, `LiveFaultInjection`) → Decoupled Architecture Strip → Restyled FAQ Accordion → Closing CTA Band → Permanently black multi-column Footer.
  - Restyled all internal app pages (`/dashboard`, `/projects`, `/projects/:id`, `/runs`, `/runs/:id`, `/docs`, `/faq`, `/privacy`, `/404`) to match square corners, hairline borders, and monospaced technical figures.
  - Integrated WCAG 2.2.2 Pause Motion toggle in AnnouncementBar to freeze particle animations.
  - Added comprehensive `docs/DESIGN_REFERENCE.md` and updated `docs/DESIGN_SYSTEM.md`.

---

## [1.0.0] - 2026-10-13

### Added
- **Core Simulation Engine**:
  - Seven sequential stage executors (`source_checkout`, `build`, `unit_tests`, `code_quality`, `security_scan`, `docker_build`, `deploy_dev`).
  - Extensible `StageRegistry` interface decoupling executors from engine loops.
  - Deterministic failure injection via `failAt` and `failureRate` pipeline configuration.
  - Automatic skip propagation: downstream stages marked `skipped` immediately upon stage failure or cancellation.
  - Smart retry from failed stage: preserves passing stages and resumes at failed stage.
  - Background asynchronous execution: `POST /pipelines/:id/run` returns 202 Accepted immediately.
- **REST API (`/api/v1`)**:
  - Express v4 server with Helmet security headers, rate limiting, and request logging.
  - Constant-time `X-API-Key` authentication middleware for mutation routes.
  - Projects CRUD, pipelines listing, runs history with pagination and status filters.
  - Timestamped diagnostic logs endpoint with stage and severity filtering.
  - Dashboard aggregate metrics and system health probe (`/health`).
  - Global site search endpoint (`/search`).
  - Public contact submission form (`/contact`).
  - OpenAPI 3.0 specification (`docs/openapi.yaml`).
- **Database Architecture**:
  - SQLite database module using WAL mode and foreign key constraints.
  - Transactional migration runner with numbered SQL files.
  - Isolated repository layer (`projectsRepo`, `pipelinesRepo`, `runsRepo`, `stageRunsRepo`, `logsRepo`, `contactRepo`).
  - Comprehensive database seeder with 3 projects and historical runs.
- **Frontend SPA (React 18 + Vite + Tailwind CSS)**:
  - Editorial design inspired by Squarespace Design Intelligence: oversized headlines, tight tracking, generous whitespace, confident industrial accent.
  - Zero-flash light and dark mode toggle with inline pre-paint script.
  - Connected 7-stage pipeline visualizer with animated connectors and live status pulses.
  - Terminal-style diagnostic LogViewer with level color tags, stage filtering, auto-scroll, and line copy buttons.
  - Command-palette search (`Cmd+K` / `Ctrl+K`) with keyboard navigation.
  - Accessible confirmation modals with focus traps for destructive actions.
  - Accessible expandable FAQ disclosure accordion.
  - Non-blocking functional cookie banner and plain-language Privacy Policy.
  - Keyboard skip links and pinned viewport scroll progress bar.
