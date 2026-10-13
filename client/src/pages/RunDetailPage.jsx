/**
 * @file client/src/pages/RunDetailPage.jsx
 * @description Master pipeline execution view.
 * Polls GET /api/v1/runs/:id every 1s while active, renders the 7-stage connected flow,
 * displays real-time durations and error banners, embeds the diagnostic LogViewer,
 * and provides Retry and Cancel actions with accessible confirmation modals.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import usePolling from '../hooks/usePolling.js';
import PipelineFlow from '../components/pipeline/PipelineFlow.jsx';
import LogViewer from '../components/logs/LogViewer.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import CopyButton from '../components/ui/CopyButton.jsx';
import SourceTag from '../components/banners/SourceTag.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import { CardSkeleton } from '../components/ui/Skeleton.jsx';
import {
  ArrowLeft,
  RotateCcw,
  StopCircle,
  GitCommit,
  GitBranch,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FolderGit2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export function RunDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [run, setRun] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selectedStageName, setSelectedStageName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRetryModalOpen, setIsRetryModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isTerminalState = run && ['success', 'failed', 'cancelled'].includes(run.status);

  // Fetch run status and ordered stages
  const fetchRunDetails = useCallback(async () => {
    try {
      const data = await api.getRunDetails(id);
      setRun(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load pipeline run.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch diagnostic logs
  const fetchLogs = useCallback(async () => {
    try {
      const logData = await api.getRunLogs(id, {
        stage: selectedStageName || undefined
      });
      setLogs(logData);
    } catch {
      // Ignored non-critical log polling errors
    }
  }, [id, selectedStageName]);

  // Live polling while run is pending or running (~1s interval)
  usePolling(
    async () => {
      await fetchRunDetails();
      await fetchLogs();
    },
    1000,
    !isTerminalState
  );

  // Initial fetch on mount or stage filter change
  useEffect(() => {
    fetchRunDetails();
    fetchLogs();
  }, [id, selectedStageName, fetchRunDetails, fetchLogs]);

  // Cancel Handler
  const handleCancelRun = async () => {
    setActionLoading(true);
    try {
      await api.cancelRun(id);
      setIsCancelModalOpen(false);
      await fetchRunDetails();
      await fetchLogs();
    } catch (err) {
      alert(`Cancellation error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Retry Handler
  const handleRetryRun = async () => {
    setActionLoading(true);
    try {
      const retryResult = await api.retryRun(id);
      setIsRetryModalOpen(false);
      // Navigate to the newly dispatched retry run
      navigate(`/runs/${retryResult.runId}`);
    } catch (err) {
      alert(`Retry error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !run) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error && !run) {
    return (
      <div className="p-8 border border-status-failed/30 bg-status-failed/5 rounded-[2px] text-center space-y-4">
        <p className="text-xs font-mono text-status-failed">{error}</p>
        <Link to="/runs">
          <Button variant="outline" size="sm">
            ← Back to Execution Archive
          </Button>
        </Link>
      </div>
    );
  }

  const durationSec = run?.duration_ms
    ? (run.duration_ms / 1000).toFixed(2)
    : run?.started_at
    ? ((Date.now() - new Date(run.started_at).getTime()) / 1000).toFixed(1)
    : '—';

  const hasRealStage = run?.stages?.some(s => s.source === 'real');
  const commitUrl = run?.repo_owner && run?.repo_name && run?.commit_sha
    ? `https://github.com/${run.repo_owner}/${run.repo_name}/commit/${run.commit_sha}`
    : null;
  const branchUrl = run?.repo_owner && run?.repo_name && run?.branch
    ? `https://github.com/${run.repo_owner}/${run.repo_name}/tree/${run.branch}`
    : null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Link
              to="/runs"
              className="inline-flex items-center gap-1.5 text-[11px] font-mono tracking-wider uppercase text-ink-muted hover:text-ink transition-colors mr-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Archive
            </Link>
            <span className="text-line">/</span>
            <span className="text-xs font-mono text-ink-muted">RUN #{run.run_number}</span>
            <SourceTag source={hasRealStage ? 'real' : 'simulated'} showDetails={hasRealStage} />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-ink">
              {run.pipeline_name}
            </h1>
            <Badge variant={run.status} size="md">
              {run.status}
            </Badge>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {run.status === 'running' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsCancelModalOpen(true)}
            >
              <StopCircle className="w-3.5 h-3.5" /> Cancel Run
            </Button>
          )}

          {(run.status === 'failed' || run.status === 'cancelled') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsRetryModalOpen(true)}
              withArrow
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry Execution
            </Button>
          )}

          <Link to={`/projects/${run.project_id}`}>
            <Button variant="outline" size="sm">
              <FolderGit2 className="w-3.5 h-3.5" /> Repository
            </Button>
          </Link>
        </div>
      </div>

      {/* Run Metadata Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border border-line rounded-[2px] bg-surface-light dark:bg-surface-dark divide-y sm:divide-y-0 sm:divide-x divide-line text-xs font-mono">
        <div className="p-4 space-y-1">
          <span className="text-[10px] tracking-wider uppercase text-ink-muted block">Commit Dispatch</span>
          <div className="flex items-center gap-1.5">
            <GitCommit className="w-3.5 h-3.5 text-ink-muted stroke-[1.5]" />
            {commitUrl ? (
              <a
                href={commitUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-ink hover:underline inline-flex items-center gap-1"
                title="View commit on GitHub"
              >
                {run.commit_sha?.substring(0, 7)}
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            ) : (
              <span className="font-semibold text-ink">{run.commit_sha?.substring(0, 7) || '—'}</span>
            )}
            {run.commit_sha && <CopyButton text={run.commit_sha} size="sm" />}
          </div>
          {run.commit_message && (
            <p className="text-[10px] text-ink-muted truncate max-w-[200px] italic">
              "{run.commit_message}"
            </p>
          )}
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[10px] tracking-wider uppercase text-ink-muted block">Target Branch</span>
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-ink-muted stroke-[1.5]" />
            {branchUrl ? (
              <a
                href={branchUrl}
                target="_blank"
                rel="noreferrer"
                className="text-ink font-semibold hover:underline inline-flex items-center gap-1"
              >
                {run.branch}
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            ) : (
              <span className="text-ink font-semibold">{run.branch}</span>
            )}
          </div>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[10px] tracking-wider uppercase text-ink-muted block">Cycle Duration</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-ink-muted stroke-[1.5]" />
            <span className="text-ink font-semibold">{durationSec}s</span>
          </div>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[10px] tracking-wider uppercase text-ink-muted block">Dispatch Trigger</span>
          <div className="text-ink capitalize font-semibold">
            {run.trigger_type}
            {run.retry_of && <span className="text-ink-muted text-[10px] font-normal ml-1">(retry)</span>}
          </div>
        </div>
      </div>

      {/* Honesty Provenance Notice */}
      {hasRealStage && (
        <div className="flex items-center gap-2.5 p-3 bg-surface-subtle border border-line rounded-[2px] text-[11px] font-mono text-ink-muted animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-ink-muted shrink-0" />
          <span>
            <strong>Hybrid Execution:</strong> Source Checkout and Build stages executed with real metadata fetched from the GitHub REST API. Code was never downloaded or executed.
          </span>
        </div>
      )}

      {/* Failure Banner if Run Failed */}
      {run.status === 'failed' && (
        <div className="p-5 rounded-[2px] border border-status-failed/30 bg-status-failed/5 text-status-failed space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 font-medium text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0 stroke-[1.5]" />
            <span>Pipeline execution halted at stage: <strong className="font-mono text-ink">'{run.failing_stage}'</strong></span>
          </div>
          <div className="pl-6 border-l border-status-failed/30 font-mono text-[11px] leading-relaxed text-ink/90">
            {run.error_message || 'Stage execution failed.'}
          </div>
          <div className="pl-6 pt-0.5 text-[11px] font-mono text-ink-muted">
            Downstream stages were marked skipped automatically to preserve pipeline resources.
          </div>
        </div>
      )}

      {/* 7-Stage Connected Visualizer */}
      <PipelineFlow
        stages={run.stages}
        selectedStageId={selectedStageName}
        onSelectStage={(st) => {
          setSelectedStageName(prev => (prev === st.stage_name ? null : st.stage_name));
        }}
      />

      {/* Filter Info Banner */}
      {selectedStageName && (
        <div className="flex items-center justify-between p-3 bg-surface-subtle border border-line rounded-[2px] text-xs font-mono">
          <span className="text-ink-muted">
            Filtering diagnostics for stage: <strong className="text-ink">{selectedStageName}</strong>
          </span>
          <button
            type="button"
            onClick={() => setSelectedStageName(null)}
            className="text-[11px] uppercase tracking-wider text-ink underline hover:opacity-75 transition-opacity"
          >
            Show All Stage Logs
          </button>
        </div>
      )}

      {/* Embedded Live Log Viewer */}
      <LogViewer
        logs={logs}
        stages={run.stages}
        selectedStage={selectedStageName}
        onSelectStage={setSelectedStageName}
      />

      {/* Accessible Confirmation Modal: Cancel */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelRun}
        title="Cancel Active Run"
        message="Are you sure you want to abort this in-flight pipeline run? Current execution will halt immediately and remaining stages will be skipped."
        confirmLabel="Abort Run"
        isDestructive
        loading={actionLoading}
      />

      {/* Accessible Confirmation Modal: Retry */}
      <ConfirmModal
        isOpen={isRetryModalOpen}
        onClose={() => setIsRetryModalOpen(false)}
        onConfirm={handleRetryRun}
        title="Retry Pipeline Run"
        message={`Do you want to retry this run? KestrelCI will retain the successful results of earlier stages and restart execution directly from the failed stage (${run.failing_stage}).`}
        confirmLabel="Dispatch Retry"
        loading={actionLoading}
      />
    </div>
  );
}

export default RunDetailPage;
