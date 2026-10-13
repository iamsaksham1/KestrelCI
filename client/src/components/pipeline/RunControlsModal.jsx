/**
 * @file client/src/components/pipeline/RunControlsModal.jsx
 * @description Modal dialog offering "Run Normally" vs "Inject Failure".
 * Allows developers and evaluators to intentionally test deterministic failure paths.
 */

import React, { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { Play, AlertTriangle, GitCommit } from 'lucide-react';

const STAGE_OPTIONS = [
  { value: 'source_checkout', label: '1. Source Checkout (Remote/Branch Timeout)' },
  { value: 'build', label: '2. Build & Compile (Compilation Error)' },
  { value: 'unit_tests', label: '3. Unit Tests (Assertion Failure)' },
  { value: 'code_quality', label: '4. Code Quality (ESLint Threshold)' },
  { value: 'security_scan', label: '5. Security Scan (Critical CVE Detection)' },
  { value: 'docker_build', label: '6. Docker Build (Container Out-of-Memory)' },
  { value: 'deploy_dev', label: '7. Deploy Dev (Readiness Probe Failure)' },
];

export function RunControlsModal({
  isOpen,
  onClose,
  onTriggerRun,
  pipelineName = 'CI/CD Pipeline',
  loading = false
}) {
  const [mode, setMode] = useState('normal'); // 'normal' | 'failure'
  const [failAt, setFailAt] = useState('security_scan');
  const [commitMessage, setCommitMessage] = useState('');
  const [branch, setBranch] = useState('main');

  const handleSubmit = (e) => {
    e.preventDefault();
    onTriggerRun({
      failAt: mode === 'failure' ? failAt : null,
      failureRate: 1.0,
      commitMessage: commitMessage.trim() || undefined,
      branch: branch.trim() || 'main'
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dispatch Pipeline Run"
      description={`Trigger an asynchronous execution cycle for ${pipelineName}.`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mode Selector Tabs */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-[0.1em] text-ink-muted mb-2">
            Execution Mode
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-surface-subtle border border-line rounded-[2px]">
            <button
              type="button"
              onClick={() => setMode('normal')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs uppercase tracking-wider font-medium rounded-[2px] transition-all ${
                mode === 'normal'
                  ? 'bg-surface-light dark:bg-surface-dark text-ink border border-line shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Play className="w-3 h-3 text-emerald-500" />
              Run Normally
            </button>
            <button
              type="button"
              onClick={() => setMode('failure')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs uppercase tracking-wider font-medium rounded-[2px] transition-all ${
                mode === 'failure'
                  ? 'bg-surface-light dark:bg-surface-dark text-red-500 border border-line shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-red-500" />
              Inject Failure
            </button>
          </div>
        </div>

        {/* Failure Stage Selector (Visible if mode === 'failure') */}
        {mode === 'failure' && (
          <div className="p-3 bg-red-500/5 border border-red-500/25 rounded-[2px] space-y-2 animate-fade-in font-mono text-xs">
            <label className="block text-[11px] text-red-400 uppercase tracking-wider">
              Inject deterministic fault at stage:
            </label>
            <select
              value={failAt}
              onChange={(e) => setFailAt(e.target.value)}
              className="w-full text-xs bg-surface-light dark:bg-surface-dark border border-line rounded-[2px] px-2.5 py-1.5 text-ink focus:outline-none focus:ring-1 focus:ring-white"
            >
              {STAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-red-400/80 leading-normal">
              When this stage fails, downstream stages will automatically be skipped.
            </p>
          </div>
        )}

        {/* Optional Commit Message */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
            Commit Dispatch Note (Optional)
          </label>
          <div className="relative">
            <GitCommit className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-ink-faint" />
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="e.g. fix(security): sanitize input vectors"
              className="w-full text-xs pl-8 pr-3 py-2 bg-surface-light dark:bg-surface-dark border border-line rounded-[2px] text-ink placeholder-ink-faint focus:outline-none focus:ring-1 focus:ring-white"
            >
            </input>
          </div>
        </div>

        {/* Branch Input */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
            Target Branch
          </label>
          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-surface-light dark:bg-surface-dark border border-line rounded-[2px] text-ink focus:outline-none focus:ring-1 focus:ring-white font-mono"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-line">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={mode === 'failure' ? 'destructive' : 'primary'}
            size="sm"
            loading={loading}
            withArrow
          >
            {mode === 'failure' ? 'Dispatch Fault' : 'Start Pipeline'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default RunControlsModal;
