/**
 * @file client/src/pages/HistoryPage.jsx
 * @description Filterable and paginated pipeline run history archive.
 * Includes status filter, project filter, date range filter, pagination controls,
 * and an accessible clear history confirmation modal.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import SimulatedBadge from '../components/banners/SimulatedBadge.jsx';
import { CardSkeleton } from '../components/ui/Skeleton.jsx';
import { Filter, Trash2, ChevronLeft, ChevronRight, RotateCw, GitCommit, ExternalLink } from 'lucide-react';

export function HistoryPage() {
  const [runs, setRuns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ status: '', project: '', dateFrom: '', dateTo: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  // Load projects for project dropdown
  useEffect(() => {
    api.getProjects().then(setProjects).catch(() => {});
  }, []);

  const fetchRuns = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getRuns({
        ...filters,
        page,
        limit: pagination.limit
      });
      setRuns(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load execution history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns(1);
  }, [filters]);

  const handleClearHistory = async () => {
    setClearLoading(true);
    try {
      await api.clearRunHistory();
      setIsClearModalOpen(false);
      await fetchRuns(1);
    } catch (err) {
      alert(`Clear history error: ${err.message}`);
    } finally {
      setClearLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-ink-muted">ARCHIVAL RECORDS</span>
            <SimulatedBadge />
          </div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-ink mt-1">
            Execution Archive
          </h1>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">
            Persisted history of all execution dispatches, stage timings, and telemetry records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchRuns(pagination.page)}
            loading={loading}
          >
            <RotateCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsClearModalOpen(true)}
            disabled={runs.length === 0}
          >
            <Trash2 className="w-3.5 h-3.5" /> Wipe Archive
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-5 bg-surface-light dark:bg-surface-dark border border-line rounded-[2px] space-y-3.5">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-ink-muted">
          <Filter className="w-3 h-3 stroke-[1.5]" />
          <span>QUERY PARAMETERS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Status Filter */}
          <div>
            <label className="block text-[10px] uppercase font-mono tracking-wider text-ink-muted mb-1.5">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full text-xs font-mono px-3 py-2 bg-surface-subtle border border-line rounded-[2px] text-ink focus:outline-none focus:border-ink/50 transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="running">Running</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <label className="block text-[10px] uppercase font-mono tracking-wider text-ink-muted mb-1.5">
              Project
            </label>
            <select
              value={filters.project}
              onChange={(e) => setFilters({ ...filters, project: e.target.value })}
              className="w-full text-xs font-mono px-3 py-2 bg-surface-subtle border border-line rounded-[2px] text-ink focus:outline-none focus:border-ink/50 transition-colors"
            >
              <option value="">All Repositories</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-[10px] uppercase font-mono tracking-wider text-ink-muted mb-1.5">
              From Date
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full text-xs font-mono px-3 py-2 bg-surface-subtle border border-line rounded-[2px] text-ink focus:outline-none focus:border-ink/50 transition-colors"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-[10px] uppercase font-mono tracking-wider text-ink-muted mb-1.5">
              To Date
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full text-xs font-mono px-3 py-2 bg-surface-subtle border border-line rounded-[2px] text-ink focus:outline-none focus:border-ink/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Runs Table */}
      {error ? (
        <div className="p-8 border border-status-failed/30 bg-status-failed/5 rounded-[2px] text-center space-y-4">
          <p className="text-xs font-mono text-status-failed">{error}</p>
          <Button size="sm" variant="outline" onClick={() => fetchRuns(pagination.page)}>
            Retry Query
          </Button>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : runs.length === 0 ? (
        <div className="border border-line rounded-[2px] p-12 text-center bg-surface-light dark:bg-surface-dark space-y-4">
          <p className="text-xs font-mono text-ink-muted">No runs found matching query filters.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFilters({ status: '', project: '', dateFrom: '', dateTo: '' })}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="border border-line rounded-[2px] bg-surface-light dark:bg-surface-dark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle text-ink-muted uppercase font-mono text-[10px] tracking-wider border-b border-line">
                <tr>
                  <th className="py-3 px-4">Run</th>
                  <th className="py-3 px-4">Pipeline / Repo</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Commit Dispatch</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Started At</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {runs.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-ink">
                      <Link to={`/runs/${r.id}`} className="hover:underline">
                        #{r.run_number}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-ink line-clamp-1">{r.pipeline_name}</div>
                      <div className="text-[11px] font-mono text-ink-muted">{r.project_name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={r.status} size="sm">
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-ink-muted">
                      <div className="flex items-center gap-1.5">
                        <GitCommit className="w-3.5 h-3.5 text-ink-muted stroke-[1.5]" />
                        {r.repo_owner && r.repo_name && r.commit_sha ? (
                          <a
                            href={`https://github.com/${r.repo_owner}/${r.repo_name}/commit/${r.commit_sha}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-ink hover:underline inline-flex items-center gap-1"
                            title="View commit on GitHub"
                          >
                            {r.commit_sha?.substring(0, 7)}
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        ) : (
                          <span className="font-semibold text-ink">{r.commit_sha?.substring(0, 7) || '—'}</span>
                        )}
                      </div>
                      <div className="text-[11px] text-ink-muted truncate max-w-[180px]">
                        {r.commit_message}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-ink-muted">
                      {r.duration_ms ? `${(r.duration_ms / 1000).toFixed(2)}s` : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-ink-muted">
                      {r.started_at ? new Date(r.started_at).toLocaleString() : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to={`/runs/${r.id}`}>
                        <Button size="sm" variant="outline">
                          Inspect →
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-ink-muted bg-surface-subtle/30">
            <div>
              PAGE {pagination.page} OF {pagination.totalPages} ({pagination.total} TOTAL RUNS)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchRuns(pagination.page - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchRuns(pagination.page + 1)}
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Accessible Clear History Modal */}
      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearHistory}
        title="Wipe Execution Archive"
        message="Are you sure you want to delete all historical pipeline runs and their associated stage diagnostic logs? This action cannot be reversed."
        confirmLabel="Clear All Runs"
        isDestructive
        loading={clearLoading}
      />
    </div>
  );
}

export default HistoryPage;
