/**
 * @file client/src/components/landing/LiveFeatureComponents.jsx
 * @description Five live, working interactive components for the Landing Page feature blocks:
 * 1. Mini Pipeline Flow: Interactive 7-stage conduit with live step transitions
 * 2. Terminal Log Stream: Real-time formatted diagnostic output with copy buttons
 * 3. Telemetry Metrics: Monotonic run counters, pass rate meters, and SVG health histogram
 * 4. Execution Archive Table: Interactive run ledger with commit SHAs and status badges
 * 5. Fault Injection & Retry Controller: Interactive failAt injection and smart resumption demonstration
 */

import React, { useState, useEffect } from 'react';
import { CopyButton } from '../ui/CopyButton.jsx';
import { Play, RotateCcw, ShieldAlert, CheckCircle2, XCircle, ArrowRight, Terminal } from 'lucide-react';

/* ╔══════════════════════════════════════════════════════════════╗
   ║ 1. Live Interactive Pipeline Conduit (7 Stages)              ║
   ╚══════════════════════════════════════════════════════════════╝ */
export function LiveMiniPipeline() {
  const stageNames = ['checkout', 'build', 'unit_test', 'quality', 'security', 'docker', 'deploy'];
  const [activeStage, setActiveStage] = useState(2); // 0-indexed
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStage(prev => (prev + 1) % stageNames.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isPlaying, stageNames.length]);

  return (
    <div className="w-full bg-[#0E1015] border border-white/12 p-5 text-white select-none">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-mono text-xs uppercase tracking-wider text-white/90">
            Pipeline #904 • Branch main
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="text-[10px] font-mono uppercase tracking-wider text-white/60 hover:text-white px-2 py-0.5 border border-white/15"
        >
          {isPlaying ? 'Pause' : 'Auto Run'}
        </button>
      </div>

      {/* 7-Stage Horizontal Conduit */}
      <div className="grid grid-cols-7 gap-2">
        {stageNames.map((name, idx) => {
          const isPassed = idx < activeStage;
          const isCurrent = idx === activeStage;
          const isPending = idx > activeStage;

          return (
            <button
              key={name}
              type="button"
              onClick={() => {
                setActiveStage(idx);
                setIsPlaying(false);
              }}
              className={`p-2.5 border text-left transition-all ${
                isCurrent
                  ? 'bg-amber-400/10 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                  : isPassed
                  ? 'bg-emerald-500/5 border-emerald-500/40 text-emerald-400'
                  : 'bg-white/[0.02] border-white/10 text-white/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 font-mono text-[9px] text-white/50">
                <span>0{idx + 1}</span>
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                {isPassed && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider font-semibold truncate">
                {name}
              </div>
              <div className="text-[9px] font-mono mt-1 opacity-70">
                {isCurrent ? 'RUNNING' : isPassed ? 'PASS' : 'WAIT'}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/50">
        <span>Active: stage_{stageNames[activeStage]}</span>
        <span>Duration: 1,840 ms</span>
      </div>
    </div>
  );
}

/* ╔══════════════════════════════════════════════════════════════╗
   ║ 2. Live Terminal Log Stream Viewer                           ║
   ╚══════════════════════════════════════════════════════════════╝ */
export function LiveLogStream() {
  const logLines = [
    { time: '17:10:01.042', lvl: 'INFO', msg: 'git checkout tags/v1.4.2 [sha: c8f1e09]' },
    { time: '17:10:02.180', lvl: 'PASS', msg: 'compiled 14 targets in 1,120ms (0 errors)' },
    { time: '17:10:03.450', lvl: 'WARN', msg: 'bundle size exceeds soft threshold by 4.2%' },
    { time: '17:10:04.912', lvl: 'PASS', msg: 'vitest: 19/19 specifications confirmed' },
    { time: '17:10:06.104', lvl: 'INFO', msg: 'docker build --platform linux/amd64 sha256:7e02' },
    { time: '17:10:07.380', lvl: 'PASS', msg: 'ingress readiness probe 200 OK -> /health' },
  ];

  return (
    <div className="w-full bg-[#0E1015] border border-white/12 p-4 text-white font-mono text-xs select-none">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-white/50" />
          <span className="text-[11px] uppercase tracking-wider text-white/80">Diagnostic Stream</span>
        </div>
        <CopyButton
          textToCopy={logLines.map(l => `${l.time} [${l.lvl}] ${l.msg}`).join('\n')}
          label="all logs"
          className="text-[10px] text-white/60 hover:text-white px-2 py-0.5 border border-white/15"
        />
      </div>

      <div className="space-y-1.5 overflow-x-auto text-[11px] leading-relaxed">
        {logLines.map((l, i) => (
          <div key={i} className="flex items-start gap-2.5 py-0.5 hover:bg-white/5 px-1.5 transition-colors group">
            <span className="text-white/30 text-[10px] select-none">{l.time}</span>
            <span className={`text-[9px] px-1 py-0.2 border uppercase tracking-wider ${
              l.lvl === 'PASS' ? 'text-emerald-400 border-emerald-500/30' :
              l.lvl === 'WARN' ? 'text-amber-400 border-amber-500/30' :
              'text-white/60 border-white/15'
            }`}>
              {l.lvl}
            </span>
            <span className="text-white/80 flex-1 truncate">{l.msg}</span>
            <CopyButton textToCopy={l.msg} label="line" className="opacity-0 group-hover:opacity-100 p-0 text-[10px]" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ╔══════════════════════════════════════════════════════════════╗
   ║ 3. Live Telemetry Metrics & Histogram                        ║
   ╚══════════════════════════════════════════════════════════════╝ */
export function LiveTelemetryMetrics() {
  const bars = [65, 80, 45, 90, 70, 85, 95, 60, 88, 75, 92, 100, 80, 94];

  return (
    <div className="w-full bg-[#0E1015] border border-white/12 p-5 text-white select-none">
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="p-3 bg-white/[0.02] border border-white/10">
          <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">Total Runs</div>
          <div className="text-xl font-mono font-bold mt-1 text-white">418</div>
        </div>
        <div className="p-3 bg-white/[0.02] border border-white/10">
          <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">Pass Rate</div>
          <div className="text-xl font-mono font-bold mt-1 text-emerald-400">92.4%</div>
        </div>
        <div className="p-3 bg-white/[0.02] border border-white/10">
          <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">Avg Duration</div>
          <div className="text-xl font-mono font-bold mt-1 text-white">1,640 ms</div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/50 mb-2">
          <span>Execution Velocity Histogram</span>
          <span>Last 14 Dispatches</span>
        </div>
        <div className="h-16 flex items-end gap-1.5 pt-2 border-b border-white/10">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-white/20 hover:bg-white/80 transition-all cursor-pointer relative group"
              style={{ height: `${h}%` }}
              title={`Run #${400 + i}: ${h * 20}ms`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ╔══════════════════════════════════════════════════════════════╗
   ║ 4. Live Execution Archive Table                              ║
   ╚══════════════════════════════════════════════════════════════╝ */
export function LiveExecutionArchive() {
  const runs = [
    { id: '#418', branch: 'main', sha: 'c8f1e09', status: 'SUCCESS', dur: '1,420 ms' },
    { id: '#417', branch: 'feat/auth', sha: '99b24e1', status: 'FAILED', dur: '890 ms' },
    { id: '#416', branch: 'fix/tokens', sha: '34a17fd', status: 'SUCCESS', dur: '1,380 ms' },
    { id: '#415', branch: 'main', sha: 'e108cb9', status: 'SUCCESS', dur: '1,510 ms' },
  ];

  return (
    <div className="w-full bg-[#0E1015] border border-white/12 p-4 text-white font-mono text-xs select-none">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
        <span className="text-[11px] uppercase tracking-wider text-white/80 font-sans font-medium">Recent Ledger</span>
        <span className="text-[10px] text-white/40">POST /api/v1/runs</span>
      </div>

      <div className="divide-y divide-white/5 text-[11px]">
        {runs.map((r) => (
          <div key={r.id} className="py-2 flex items-center justify-between hover:bg-white/5 px-2 transition-colors">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white">{r.id}</span>
              <span className="text-white/50 text-[10px]">{r.branch}</span>
              <span className="text-white/30 text-[10px]">{r.sha}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[9px] px-1.5 py-0.5 border font-semibold ${
                r.status === 'SUCCESS' ? 'text-emerald-400 border-emerald-500/30' : 'text-red-400 border-red-500/30'
              }`}>
                {r.status}
              </span>
              <span className="text-white/40 text-[10px]">{r.dur}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ╔══════════════════════════════════════════════════════════════╗
   ║ 5. Live Fault Injection & Retry Controller                   ║
   ╚══════════════════════════════════════════════════════════════╝ */
export function LiveFaultInjection() {
  const [failStage, setFailStage] = useState('security_scan');
  const [runState, setRunState] = useState('idle'); // idle | failed | retrying | recovered

  const handleSimulateFailure = () => {
    setRunState('failed');
  };

  const handleRetry = () => {
    setRunState('retrying');
    setTimeout(() => {
      setRunState('recovered');
    }, 1200);
  };

  return (
    <div className="w-full bg-[#0E1015] border border-white/12 p-5 text-white select-none">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span className="font-mono text-xs uppercase tracking-wider text-white">Fault Injection Simulator</span>
        </div>
        <span className="text-[10px] font-mono text-white/40">CONFIG: failAt</span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        <div>
          <label className="text-[10px] uppercase text-white/50 block mb-1.5">Target Failure Stage</label>
          <div className="grid grid-cols-3 gap-2">
            {['unit_tests', 'security_scan', 'docker_build'].map(stage => (
              <button
                key={stage}
                type="button"
                onClick={() => {
                  setFailStage(stage);
                  setRunState('idle');
                }}
                className={`p-2 border text-[10px] uppercase text-center transition-colors ${
                  failStage === stage ? 'border-red-400 bg-red-500/10 text-red-300' : 'border-white/10 hover:border-white/30 text-white/60'
                }`}
              >
                {stage.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* State Display & Controls */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="text-[11px]">
            {runState === 'idle' && <span className="text-white/60">Ready to inject fault</span>}
            {runState === 'failed' && (
              <span className="text-red-400 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" /> Stage {failStage} failed • Remaining skipped
              </span>
            )}
            {runState === 'retrying' && <span className="text-amber-400">Resuming from {failStage}...</span>}
            {runState === 'recovered' && (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Retry Succeeded (Stages 1-4 preserved)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {runState === 'idle' && (
              <button
                type="button"
                onClick={handleSimulateFailure}
                className="px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white font-mono text-[10px] uppercase tracking-wider"
              >
                Trigger Fault
              </button>
            )}
            {runState === 'failed' && (
              <button
                type="button"
                onClick={handleRetry}
                className="px-3 py-1.5 bg-white text-black hover:bg-white/90 font-mono text-[10px] uppercase tracking-wider font-semibold"
              >
                Retry from Failure
              </button>
            )}
            {runState === 'recovered' && (
              <button
                type="button"
                onClick={() => setRunState('idle')}
                className="px-2.5 py-1 text-white/50 hover:text-white border border-white/20 text-[10px]"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
