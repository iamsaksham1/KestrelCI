/**
 * @file client/src/content/faqData.js
 * @description Structured FAQ entries detailing simulation reality, GitHub API integration,
 * failure injection, storage architecture, and stage customization.
 */

export const FAQ_ITEMS = [
  {
    id: 'simulation-honesty',
    question: 'What parts of KestrelCI are real versus simulated?',
    answer: 'For projects configured with a public GitHub repository URL, the Source Checkout and Build stages inspect verified live metadata and small manifest files (such as package.json, Cargo.toml, go.mod) using the public GitHub REST API. All downstream stages (unit tests, code quality, security scan, docker build, and deployment) run simulated executors that emit realistic diagnostics. Under no circumstances does KestrelCI clone, build, test, scan, or execute user repository code. Every stage and log line carries an explicit provenance tag ("REAL" or "SIMULATED").'
  },
  {
    id: 'github-api-safety',
    question: 'Does KestrelCI download or execute repository source code?',
    answer: 'No, never. KestrelCI enforces a strict zero-execution policy. It only fetches read-only JSON metadata and small manifest files (capped at 100 KB) via GitHub\'s public REST API to detect the project stack, primary language, and latest commit SHA. No git clone, shell command, container build, or code execution ever occurs on our servers.'
  },
  {
    id: 'failure-propagation',
    question: 'How does failure injection and skip propagation work?',
    answer: 'When triggering a pipeline run, you can optionally supply a "failAt" stage parameter (e.g., unit_tests or security_scan) along with a failure probability rate. When the pipeline engine reaches that stage, it deterministically injects a failure exception, records an error log, and immediately marks all subsequent downstream stages as "skipped". The run is marked "failed" with the exact failure duration and reason.'
  },
  {
    id: 'data-storage',
    question: 'Where is pipeline data and history stored?',
    answer: 'All projects, pipelines, runs, stage timings, logs, and repository analysis snapshots are persisted locally in an SQLite database file located at server/data/app.sqlite using write-ahead logging (WAL) mode. No data is sent to external cloud telemetry providers, analytics vendors, or third parties.'
  },
  {
    id: 'extending-executors',
    question: 'How do I add a new stage or replace a simulated executor with a real integration?',
    answer: 'Stages implement the StageExecutor interface: { name, displayName, run(context) }. You register executors into the central StageRegistry without touching the engine loop. To invoke a real container build or shell command, implement a class adhering to this interface and call registry.register(myExecutor). See docs/EXTENDING.md for step-by-step guidance.'
  },
  {
    id: 'retry-from-failed-stage',
    question: 'How does the "Retry from failed stage" feature function?',
    answer: 'Rather than re-running already successful early stages (such as source checkout or compilation), retrying a failed run preserves the passing state and logs of previous stages and triggers execution beginning specifically from the stage that failed, saving execution time and resources.'
  },
  {
    id: 'resetting-data',
    question: 'How do I reset demo data or clear run history?',
    answer: 'You can clear all persisted run records using the "Wipe Archive" button on the Run History page (backed by DELETE /api/v1/runs/history). To perform a full factory reset, delete the server/data/app.sqlite file and run "npm run migrate && npm run seed".'
  }
];

export default FAQ_ITEMS;
