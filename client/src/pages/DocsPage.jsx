/**
 * @file client/src/pages/DocsPage.jsx
 * @description Technical documentation page detailing engine architecture,
 * stage executor interfaces, API authentication, and scaling roadmap.
 */

import React from 'react';
import CopyButton from '../components/ui/CopyButton.jsx';
import SimulatedBadge from '../components/banners/SimulatedBadge.jsx';
import { LAST_UPDATED } from '../content/constants.js';
import { Terminal, Shield, GitBranch, Database, Cpu, Layers } from 'lucide-react';

export function DocsPage() {
  const apiKeySnippet = `// ╔══════════════════════════════════════════════════════════════╗
// ║  API KEY  >>>  set API_KEY in server/.env  (never commit it)  ║
// ╚══════════════════════════════════════════════════════════════╝
API_KEY=kestrel_demo_key_7f8d9a2b1c4e6f`;

  const executorInterfaceSnippet = `/**
 * Custom Stage Executor Interface
 */
export class CustomStageExecutor {
  constructor() {
    this.name = 'custom_benchmark';
    this.displayName = 'Performance Benchmark';
  }

  async run(context) {
    const { runId, commitSha, shouldFail, failureReason } = context;

    if (shouldFail) {
      return {
        status: 'failed',
        error: failureReason || 'P99 latency threshold breached (240ms > 100ms)',
        durationMs: 820,
        logs: [
          { level: 'info', message: '[simulated] Running performance benchmark harness' },
          { level: 'error', message: '[simulated] Latency SLA violation' }
        ]
      };
    }

    return {
      status: 'success',
      durationMs: 910,
      logs: [
        { level: 'info', message: '[simulated] Benchmark passed: P95 42ms, P99 78ms' }
      ]
    };
  }
}

// Register into the engine loop:
registry.register(new CustomStageExecutor());`;

  const curlTriggerSnippet = `curl -X POST http://localhost:4000/api/v1/pipelines/pipe_core_main/run \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: kestrel_demo_key_7f8d9a2b1c4e6f" \\
  -d '{"failAt": "unit_tests", "failureRate": 1.0}'`;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
      {/* Header */}
      <div className="border-b border-line pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-ink-muted">TECHNICAL SPECIFICATION</span>
          <SimulatedBadge />
        </div>
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-ink">
          Engine Architecture & Guide
        </h1>
        <p className="text-xs font-mono text-ink-muted">
          LAST REVISED: {LAST_UPDATED} • SPECIFICATION V1.0
        </p>
      </div>

      {/* 1. Core Principles & Honesty Rule */}
      <section className="space-y-4">
        <h2 className="text-lg font-light text-ink tracking-tight flex items-center gap-2">
          <Shield className="w-4 h-4 text-ink-muted stroke-[1.5]" /> 1. Simulation Rules & Transparency
        </h2>
        <div className="p-5 bg-surface-subtle border border-line rounded-[2px] text-xs leading-relaxed text-ink-muted space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">The Honesty Rule (Non-Negotiable):</p>
          <p>
            All seven stages executed within KestrelCI are simulated. The engine emits realistic diagnostic logs and synthetic timestamps, but does not invoke real external Docker daemons, clone external git remotes, or interact with live cloud Kubernetes clusters.
          </p>
        </div>
      </section>

      {/* 2. Architecture & Data Flow */}
      <section className="space-y-4">
        <h2 className="text-lg font-light text-ink tracking-tight flex items-center gap-2">
          <Layers className="w-4 h-4 text-ink-muted stroke-[1.5]" /> 2. Architecture & Engine Pipeline
        </h2>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
          The system strictly enforces backend ownership of state. The React client merely reflects pipeline states emitted by the Express API. When a run is dispatched via <code className="text-ink bg-surface-subtle border border-line px-1.5 py-0.5 rounded-[2px] font-mono text-[11px]">POST /api/v1/pipelines/:id/run</code>, the endpoint creates all 7 stage rows in <code className="text-ink bg-surface-subtle border border-line px-1.5 py-0.5 rounded-[2px] font-mono text-[11px]">pending</code> state, triggers the background engine loop asynchronously, and returns <strong className="text-ink font-mono font-medium">HTTP 202 Accepted</strong> immediately.
        </p>

        <div className="p-5 bg-[#07070A] border border-line rounded-[2px] font-mono text-xs leading-relaxed space-y-2 text-[#9E9EA4]">
          <div className="text-white">React Client --HTTP/JSON (poll ~1s)--&gt; Express API (Routes)</div>
          <div className="pl-6">└── Services Layer (runService, projectService)</div>
          <div className="pl-12">├── Repositories (strict DB isolation) --&gt; SQLite (WAL mode)</div>
          <div className="pl-12">└── Pipeline Engine (Background asynchronous execution)</div>
          <div className="pl-18 text-white">└── Stage Registry &amp; Executors (7 stages)</div>
        </div>
      </section>

      {/* 3. API Key & Security */}
      <section className="space-y-4">
        <h2 className="text-lg font-light text-ink tracking-tight flex items-center gap-2">
          <Shield className="w-4 h-4 text-ink-muted stroke-[1.5]" /> 3. API Key Authentication
        </h2>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
          Write operations (POST, PUT, DELETE) require the <code className="bg-surface-subtle border border-line px-1.5 py-0.5 rounded-[2px] font-mono text-[11px] text-ink">X-API-Key</code> header. The server compares keys using <code className="bg-surface-subtle border border-line px-1.5 py-0.5 rounded-[2px] font-mono text-[11px] text-ink">crypto.timingSafeEqual</code> to prevent timing attacks.
        </p>

        <div className="relative border border-line rounded-[2px] overflow-hidden bg-[#07070A] text-[#E0E2EC] p-4 font-mono text-xs">
          <div className="absolute right-3 top-3">
            <CopyButton text={apiKeySnippet} label="Copy API key banner" />
          </div>
          <pre className="overflow-x-auto leading-relaxed">{apiKeySnippet}</pre>
        </div>
      </section>

      {/* 4. Extending Stages & Custom Executors */}
      <section className="space-y-4">
        <h2 className="text-lg font-light text-ink tracking-tight flex items-center gap-2">
          <Cpu className="w-4 h-4 text-ink-muted stroke-[1.5]" /> 4. Extending Stage Executors
        </h2>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
          Adding a new stage or replacing simulated steps with real integrations does not require editing the engine loop. Simply implement the <code className="text-ink bg-surface-subtle border border-line px-1.5 py-0.5 rounded-[2px] font-mono text-[11px]">StageExecutor</code> interface and register it into <code className="font-mono text-ink">registry</code>:
        </p>

        <div className="relative border border-line rounded-[2px] overflow-hidden bg-[#07070A] text-[#E0E2EC] p-4 font-mono text-xs">
          <div className="absolute right-3 top-3">
            <CopyButton text={executorInterfaceSnippet} label="Copy executor snippet" />
          </div>
          <pre className="overflow-x-auto leading-relaxed">{executorInterfaceSnippet}</pre>
        </div>
      </section>

      {/* 5. Triggering Runs with cURL */}
      <section className="space-y-4">
        <h2 className="text-lg font-light text-ink tracking-tight flex items-center gap-2">
          <Terminal className="w-4 h-4 text-ink-muted stroke-[1.5]" /> 5. API Dispatch Example
        </h2>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
          Trigger an execution with failure injection using cURL:
        </p>

        <div className="relative border border-line rounded-[2px] overflow-hidden bg-[#07070A] text-[#E0E2EC] p-4 font-mono text-xs">
          <div className="absolute right-3 top-3">
            <CopyButton text={curlTriggerSnippet} label="Copy cURL snippet" />
          </div>
          <pre className="overflow-x-auto leading-relaxed">{curlTriggerSnippet}</pre>
        </div>
      </section>

      {/* 6. Production Scaling Path */}
      <section className="space-y-4 border-t border-line pt-8">
        <h2 className="text-lg font-light text-ink tracking-tight flex items-center gap-2">
          <Database className="w-4 h-4 text-ink-muted stroke-[1.5]" /> 6. Production Scaling Roadmap
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-ink-muted">
          <div className="p-5 border border-line rounded-[2px] bg-surface-light dark:bg-surface-dark space-y-2">
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">SQLite to PostgreSQL</h3>
            <p>
              Because all SQL queries are confined strictly to <code className="font-mono text-ink">server/database/repositories/</code>, moving from SQLite to PostgreSQL only requires updating repository files and connection pooling.
            </p>
          </div>

          <div className="p-5 border border-line rounded-[2px] bg-surface-light dark:bg-surface-dark space-y-2">
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">Job Queue & Workers</h3>
            <p>
              Replace the in-process background execution loop with a durable queue (e.g., BullMQ with Redis or AWS SQS) and containerized runner workers.
            </p>
          </div>

          <div className="p-5 border border-line rounded-[2px] bg-surface-light dark:bg-surface-dark space-y-2">
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">Server-Sent Events (SSE)</h3>
            <p>
              Upgrade client polling to Server-Sent Events or WebSockets to broadcast stage status updates and streaming log lines with zero polling overhead.
            </p>
          </div>

          <div className="p-5 border border-line rounded-[2px] bg-surface-light dark:bg-surface-dark space-y-2">
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">Real Shell & Docker Runners</h3>
            <p>
              Replace the simulated executors with real child process spawns (<code className="font-mono text-ink">execa</code>) invoking <code className="font-mono text-ink">docker build</code> and real test suites in sandboxed containers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DocsPage;
