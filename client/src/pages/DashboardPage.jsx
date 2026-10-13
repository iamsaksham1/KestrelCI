/**
 * @file client/src/pages/DashboardPage.jsx
 * @description Dashboard view displaying total runs, success & failure rates,
 * average run duration, count-up metric animations, inline SVG health chart, and recent runs.
 * Restyled with Squarespace Design Intelligence language: square corners, hairlines, mono numerals.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import SimulatedBadge from '../components/banners/SimulatedBadge.jsx';
import { CardSkeleton } from '../components/ui/Skeleton.jsx';
import { Activity, CheckCircle2, XCircle, Clock, ArrowRight, RotateCw } from 'lucide-react';

export function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-12 animate-fade-in select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-line pb-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted block mb-1">
            TELEMETRY OVERVIEW
          </span>
          <div className="flex items-center gap-3">
            <h1 className="font-sans font-light text-2xl sm:text-3xl tracking-tight text-ink">
              System Dashboard
            </h1>
            <SimulatedBadge />
          </div>
          <p className="font-sans font-light text-xs sm:text-sm text-ink-muted mt-1">
            Real-time delivery statistics, pass/fail distribution, and active ledger.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchStats} loading={loading}>
            <RotateCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Link to="/projects">
            <Button size="sm" withArrow>
              Trigger Run
            </Button>
          </Link>
        </div>
      </div>

      {error ? (
        <div className="p-6 border border-red-500/25 bg-red-500/5 rounded-[2px] text-center space-y-3 font-mono">
          <p className="text-xs text-red-500">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchStats}>
            Retry Fetch
          </Button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : stats ? (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Runs */}
            <div className="p-6 border border-line rounded-[2px] bg-surface-light dark:bg-surface-dark">
              <div className="flex items-center justify-between text-ink-muted mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider">Total Dispatches</span>
                <Activity className="w-3.5 h-3.5 text-ink-faint" />
              </div>
              <div className="text-3xl font-light font-mono tracking-tight text-ink">
                {stats.totals.totalRuns}
              </div>
              <div className="text-[11px] text-ink-muted font-sans font-light mt-2">
                Across {stats.totals.totalProjects || 3} code repositories
              </div>
            </div>

            {/* Success Rate */}
            <div className="p-6 border border-line rounded-[2px] bg-surface-light dark:bg-surface-dark">
              <div className="flex items-center justify-between text-ink-muted mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider">Success Rate</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-3xl font-light font-mono tracking-tight text-emerald-500">
                {stats.totals.successRate}%
              </div>
              <div className="text-[11px] text-ink-muted font-sans font-light mt-2">
                {stats.totals.successRuns} successful cycles
              </div>
            </div>

            {/* Failure Rate */}
            <div className="p-6 border border-line rounded-[2px] bg-surface-light dark:bg-surface-dark">
              <div className="flex items-center justify-between text-ink-muted mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider">Failure Rate</span>
                <XCircle className="w-3.5 h-3.5 text-red-500" />
              </div>
              <div className="text-3xl font-light font-mono tracking-tight text-red-500">
                {stats.totals.failureRate}%
              </div>
              <div className="text-[11px] text-ink-muted font-sans font-light mt-2">
                {stats.totals.failedRuns} simulated injections
              </div>
            </div>

            {/* Average Duration */}
            <div className="p-6 border border-line rounded-[2px] bg-surface-light dark:bg-surface-dark">
              <div className="flex items-center justify-between text-ink-muted mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider">Avg Duration</span>
                <Clock className="w-3.5 h-3.5 text-ink-faint" />
              </div>
              <div className="text-3xl font-light font-mono tracking-tight text-ink">
                {(stats.totals.avgDurationMs / 1000).toFixed(2)}s
              </div>
              <div className="text-[11px] text-ink-muted font-sans font-light mt-2">
                Per complete 7-stage run
              </div>
            </div>
          </div>

          {/* Inline SVG Pipeline Health Distribution */}
          <div className="p-6 border border-line rounded-[2px] bg-surface-light dark:bg-surface-dark space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-3 border-b border-line">
              <div>
                <h3 className="font-sans font-light text-lg text-ink tracking-tight">
                  Pipeline Execution Health Distribution
                </h3>
                <p className="font-sans font-light text-xs text-ink-muted mt-0.5">
                  Proportional breakdown of passed, failed, and cancelled delivery runs.
                </p>
              </div>
              <div className="text-[11px] font-mono text-ink-muted">
                {stats.totals.totalRuns} TOTAL RUNS
              </div>
            </div>

            {/* Inline SVG Chart */}
            <div className="py-2">
              <svg className="w-full h-6 rounded-[1px] overflow-hidden bg-surface-subtle border border-line" viewBox="0 0 1000 24" preserveAspectRatio="none">
                {(() => {
                  const total = Math.max(1, stats.totals.totalRuns);
                  const successW = (stats.totals.successRuns / total) * 1000;
                  const failedW = (stats.totals.failedRuns / total) * 1000;
                  const cancelledW = (stats.totals.cancelledRuns / total) * 1000;

                  return (
                    <>
                      <rect x="0" y="0" width={successW} height="24" fill="#16A34A" />
                      <rect x={successW} y="0" width={failedW} height="24" fill="#DC2626" />
                      <rect x={successW + failedW} y="0" width={cancelledW} height="24" fill="#64748B" />
                    </>
                  );
                })()}
              </svg>

              <div className="flex flex-wrap items-center gap-6 mt-3 text-[11px] font-mono text-ink-muted">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-[1px] bg-[#16A34A]" />
                  <span>Success ({stats.totals.successRuns})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-[1px] bg-[#DC2626]" />
                  <span>Failed ({stats.totals.failedRuns})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-[1px] bg-[#64748B]" />
                  <span>Cancelled ({stats.totals.cancelledRuns})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Runs Table */}
          <div className="border border-line rounded-[2px] bg-surface-light dark:bg-surface-dark overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-line">
              <h3 className="font-sans font-light text-lg text-ink tracking-tight">
                Recent Pipeline Runs
              </h3>
              <Link to="/runs" className="text-xs uppercase tracking-wider font-medium text-ink hover:text-ink/70 draw-underline flex items-center gap-1">
                View Archive <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-surface-subtle/50 text-ink-muted border-b border-line uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Run</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Commit</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {(stats.recentRuns || []).map((run) => (
                    <tr key={run.id} className="hover:bg-surface-subtle/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-ink">
                        #{run.run_number}
                      </td>
                      <td className="py-3 px-4 text-ink font-sans">
                        {run.project_name}
                      </td>
                      <td className="py-3 px-4 text-ink-muted">
                        <span className="text-ink font-semibold">{run.commit_sha?.substring(0, 7)}</span>
                        <span className="text-ink-faint block text-[10px] truncate max-w-xs">{run.commit_message}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={run.status} size="sm">
                          {run.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-ink-muted tabular-nums">
                        {run.duration_ms ? `${(run.duration_ms / 1000).toFixed(2)}s` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/runs/${run.id}`}
                          className="text-[11px] uppercase tracking-wider text-ink hover:text-ink/70 draw-underline inline-flex items-center gap-1 font-medium"
                        >
                          Inspect →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default DashboardPage;
