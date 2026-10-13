/**
 * @file client/src/components/forms/CreateProjectModal.jsx
 * @description Accessible dialog modal for registering a new project and repository.
 * Square corners, hairline borders, no orange accents.
 * Supports public GitHub repository inspection via GitHub REST API.
 */

import React, { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import SourceTag from '../banners/SourceTag.jsx';
import api from '../../services/api.js';
import {
  GitBranch,
  Link as LinkIcon,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Cpu,
  Star,
  GitCommit
} from 'lucide-react';

export function CreateProjectModal({ isOpen, onClose, onCreateProject, loading = false }) {
  const [name, setName] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [description, setDescription] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('main');
  const [error, setError] = useState(null);

  // GitHub inspection state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  const resetForm = () => {
    setName('');
    setRepositoryUrl('');
    setDescription('');
    setDefaultBranch('main');
    setError(null);
    setAnalysisData(null);
    setAnalysisError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCheckRepository = async () => {
    if (!repositoryUrl.trim()) {
      setAnalysisError('Please enter a repository URL first.');
      return;
    }

    try {
      new URL(repositoryUrl.trim());
    } catch {
      setAnalysisError('Please provide a valid URL format.');
      return;
    }

    setAnalyzing(true);
    setAnalysisError(null);
    setAnalysisData(null);

    try {
      const data = await api.analyzeUrl(repositoryUrl.trim());
      setAnalysisData(data);
      if (data.branch) {
        setDefaultBranch(data.branch);
      }
      if (!name.trim() && data.repo) {
        setName(data.repo.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
      }
    } catch (err) {
      setAnalysisError(
        err.message || 'Could not inspect repository. Ensure it is a valid public GitHub repository.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !repositoryUrl.trim()) {
      setError('Project name and repository URL are required.');
      return;
    }

    try {
      new URL(repositoryUrl.trim());
    } catch {
      setError('Please provide a valid URL format (e.g., https://github.com/org/repo).');
      return;
    }

    onCreateProject({
      name: name.trim(),
      repository_url: repositoryUrl.trim(),
      description: description.trim() || undefined,
      default_branch: defaultBranch.trim() || 'main'
    });
  };

  const stack = analysisData?.detected_stack_json || {};
  const manifests = analysisData?.manifests_json?.files || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Project"
      description="Register a repository and establish an automated CI/CD pipeline."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 bg-red-500/10 border border-red-500/25 rounded-[2px] text-xs text-red-500 font-mono">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
            Repository URL *
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-ink-faint" />
              <input
                type="url"
                required
                value={repositoryUrl}
                onChange={(e) => {
                  setRepositoryUrl(e.target.value);
                  setAnalysisData(null);
                  setAnalysisError(null);
                }}
                placeholder="https://github.com/owner/repository"
                className="w-full text-xs pl-8 pr-3 py-2 bg-surface-subtle border border-line rounded-[2px] text-ink placeholder-ink-faint focus:outline-none focus:ring-1 focus:ring-white font-mono"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCheckRepository}
              loading={analyzing}
              disabled={!repositoryUrl.trim()}
              className="shrink-0 font-mono text-[11px]"
            >
              <Search className="w-3 h-3" /> Check Repository
            </Button>
          </div>
          <p className="text-[10px] font-mono text-ink-muted mt-1">
            Public GitHub repositories will use real metadata for Source Checkout & Build.
          </p>
        </div>

        {/* GitHub Analysis Result Box */}
        {analysisData && (
          <div className="border border-white/20 bg-white/[0.03] rounded-[2px] p-3.5 space-y-2.5 animate-fade-in text-xs font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white">
                  {analysisData.owner}/{analysisData.repo}
                </span>
                {analysisData.stars !== undefined && (
                  <span className="text-[10px] text-white/60 flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5" /> {analysisData.stars}
                  </span>
                )}
              </div>
              <SourceTag source="real" showDetails size="xs" />
            </div>

            {/* Commit Details */}
            {analysisData.commit_sha && (
              <div className="space-y-1 text-[11px] text-white/80">
                <div className="flex items-center gap-1.5 text-white/60">
                  <GitCommit className="w-3 h-3" />
                  <span className="font-semibold text-white">{analysisData.commit_sha.substring(0, 7)}</span>
                  <span>({analysisData.branch})</span>
                  <span>by {analysisData.commit_author}</span>
                </div>
                <p className="line-clamp-1 italic text-white/70">
                  "{analysisData.commit_message}"
                </p>
              </div>
            )}

            {/* Detected Stack & Manifests */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {stack.ecosystem && (
                <span className="px-1.5 py-0.5 bg-white/10 rounded-[2px] text-[10px] text-white flex items-center gap-1">
                  <Cpu className="w-2.5 h-2.5" /> {stack.ecosystem}
                </span>
              )}
              {stack.framework && (
                <span className="px-1.5 py-0.5 bg-white/10 rounded-[2px] text-[10px] text-white">
                  {stack.framework}
                </span>
              )}
              {manifests.map((m) => (
                <span
                  key={m}
                  className="px-1.5 py-0.5 border border-white/15 rounded-[2px] text-[10px] text-white/70 flex items-center gap-1"
                >
                  <FileCode className="w-2.5 h-2.5 text-white/50" /> {m}
                </span>
              ))}
            </div>

            <p className="text-[10px] text-white/40 pt-1 border-t border-white/10">
              Honesty notice: Only public metadata is fetched. Code is never cloned, built, or executed.
            </p>
          </div>
        )}

        {/* GitHub Analysis Error / Warning Box */}
        {analysisError && (
          <div className="border border-white/15 bg-white/[0.02] rounded-[2px] p-3 text-xs font-mono space-y-1 animate-fade-in">
            <div className="flex items-center gap-2 text-white/80 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-white/60 shrink-0" />
              <span>Inspection Notice</span>
            </div>
            <p className="text-[11px] text-white/60">
              {analysisError}
            </p>
            <p className="text-[10px] text-white/40 pt-1">
              You can still register this project. Pipeline execution will run with fully simulated stages.
            </p>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
            Project Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Telemetry Ingress Service"
            className="w-full text-xs px-3 py-2 bg-surface-subtle border border-line rounded-[2px] text-ink placeholder-ink-faint focus:outline-none focus:ring-1 focus:ring-white"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
            Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of this service's domain"
            className="w-full text-xs px-3 py-2 bg-surface-subtle border border-line rounded-[2px] text-ink placeholder-ink-faint focus:outline-none focus:ring-1 focus:ring-white"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
            Default Branch
          </label>
          <div className="relative">
            <GitBranch className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-ink-faint" />
            <input
              type="text"
              value={defaultBranch}
              onChange={(e) => setDefaultBranch(e.target.value)}
              placeholder="main"
              className="w-full text-xs pl-8 pr-3 py-2 bg-surface-subtle border border-line rounded-[2px] text-ink placeholder-ink-faint focus:outline-none focus:ring-1 focus:ring-white font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-line">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={loading} withArrow>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateProjectModal;
