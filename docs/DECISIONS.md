# Architectural Decision Records (ADRs)

---

## ADR-001: Why SQLite for Local Storage

### Context
KestrelCI requires a local database for persisting projects, pipeline definitions, execution runs, 7-stage states, and logs without requiring external database server containers.

### Decision
We selected SQLite using write-ahead logging (`WAL`) mode and foreign key enforcement (`PRAGMA foreign_keys = ON;`).

### Consequences
- **Pros**: Zero infrastructure dependencies; fast in-process queries; zero setup required by evaluators (`npm run dev` works immediately).
- **Cons**: Concurrency is limited to single-writer.
- **Mitigation**: An independent repository layer (`server/database/repositories/`) decouples queries so that migrating to PostgreSQL is a change in one single folder.

---

## ADR-002: Why 1-Second Client Polling over WebSockets

### Context
The client needs to display live stage transitions, running status indicators, and logs as the pipeline engine executes.

### Decision
We implemented client polling against `GET /api/v1/runs/:id` every 1 second while a run is active (`pending` or `running`), terminating automatically upon terminal status.

### Consequences
- **Pros**: Trivially reliable across any proxy, firewall, or network configuration; stateless backend; no websocket connection drops or heartbeats to manage.
- **Cons**: Slight HTTP request overhead (~1 req/sec during active runs).
- **Mitigation**: The API response payload is lightweight (~2KB), and polling halts as soon as the run finishes.

---

## ADR-003: Why Pipeline Simulation with Strict Honesty Disclosures

### Context
Real CI/CD pipelines require multi-gigabyte Docker daemons, privileged root container capabilities, and cloud infrastructure access, which cannot run reliably or safely in arbitrary development environments.

### Decision
Simulate all seven stages deterministically with realistic timing ranges, realistic diagnostic logs, and failure injection, while explicitly enforcing the **Honesty Rule**: clearly labeling every stage and run with `"Simulated"` badges.

### Consequences
- **Pros**: 100% reproducible, fast, reliable, zero security risk of running arbitrary external scripts, and ideal for demonstrating pipeline failure cascades and recovery workflows.
- **Cons**: Does not deploy real production artifacts.
- **Mitigation**: The `StageExecutor` interface is completely decoupled from the engine loop, allowing developers to drop in real executors if desired.

---

## ADR-004: Why Strict Repository Isolation Layer

### Context
Leaking raw SQL into Express route handlers or engine loops creates tight coupling and makes database migrations painful.

### Decision
Enforce that zero SQL queries exist outside `server/database/repositories/` and numbered migrations.

### Consequences
- **Pros**: Clean testability with in-memory SQLite; simple refactoring; transparent roadmap to PostgreSQL.
- **Cons**: Minor boilerplate wrapping simple queries in repository methods.

---

## ADR-005: Read-Only Public GitHub API Metadata Inspection with Zero Code Execution

### Context
Users requested that pipeline dispatches for projects linked to GitHub repositories reflect real repository metadata (latest commit SHA, author, branch, detected tech stack, and manifest scripts) while strictly adhering to system safety and honesty principles.

### Decision
Implement a hybrid inspection model:
1. **Metadata Only**: Fetch read-only repository metadata, commit info, language percentages, and small manifests (≤100 KB) via the official GitHub REST API v3.
2. **Zero Code Execution**: Under no circumstances clone git repositories to disk, execute shell scripts, run compilers, or invoke container builds.
3. **SSRF Guard**: Restrict outbound HTTP calls strictly to the configured GitHub API host; reject localhost, cloud metadata services, and arbitrary IP addresses.
4. **Mandatory Provenance Tagging**: Every stage execution and diagnostic log line must carry an explicit `source` provenance tag (`'real'` or `'simulated'`).
5. **Dual-Tier Caching**: Cache analysis results in-memory and in the `repo_analyses` SQLite table for 10 minutes (TTL 600s) to conserve GitHub API rate limits.
6. **Graceful Fallback**: If GitHub API calls fail (e.g., rate limit reached or offline), log a clear warning and seamlessly proceed using simulated executors, unless `strictRepoAnalysis` is explicitly configured.

### Consequences
- **Pros**:
  - Genuine stack detection and commit provenance directly in the UI.
  - Zero vulnerability surface: no malicious repository code can ever execute on the host machine.
  - Fast, responsive user experience without heavy git clone network delays.
- **Cons**:
  - Analysis is limited to public repositories on GitHub.
  - Rate limited to 60 requests/hour unauthenticated (raised to 5,000/hour with optional `GITHUB_TOKEN`).
- **Mitigation**:
  - Clear UI indicators showing remaining API rate limit and cache age.
  - Highlighted `.env` configuration for `GITHUB_TOKEN`.
