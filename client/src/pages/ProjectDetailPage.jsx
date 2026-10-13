/**
 * @file client/src/pages/ProjectDetailPage.jsx
 * @description Project detail view showing repository metadata, associated pipelines,
 * real-time repository analysis fetched via GitHub REST API, and execution triggers.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import SourceTag from '../components/banners/SourceTag.jsx';
import CopyButton from '../components/ui/CopyButton.jsx';
import RunControlsModal from '../components/pipeline/RunControlsModal.jsx';
import { CardSkeleton } from '../components/ui/Skeleton.jsx';
import {
  FolderGit2,
  GitBranch,
  Play,
  ExternalLink,
  ArrowLeft,
  Activity,
  RotateCw,
  GitCommit,
  Star,
  Cpu,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Terminal
} from 'lucide-react';

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [pipelines, setPipelines] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPipelineForRun, setSelectedPipelineForRun] = useState(null);
  const [triggerLoading, setTriggerLoading] = useState(false);

  const fetchProjectData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projData, pipesData] = await Promise.all([
        api.getProject(id),
        api.getProjectPipelines(id)
      ]);
      setProject(projData);
      setPipelines(pipesData);

      // Attempt to load latest cached repository analysis
      try {
        const analysisData = await api.getProjectAnalysis(id);
        setAnalysis(analysisData);
      } catch {
        // Non-blocking if analysis is not yet present
      }
    } catch (err) {
      setError(err.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleRefreshAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      const refreshed = await api.analyzeProject(id, { force: true });
      setAnalysis(refreshed);
    } catch (err) {
      alert(`Repository Analysis Error: ${err.message}`);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleTriggerRun = async (options) => {
    if (!selectedPipelineForRun) return;
    setTriggerLoading(true);
    try {
      const result = await api.triggerRun(selectedPipelineForRun.id, options);
      setSelectedPipelineForRun(null);
      // Navigate to the newly dispatched run details page immediately
      navigate(`/runs/${result.runId}`);
    } catch (err) {
      alert(`Trigger error: ${err.message}`);
    } finally {
      setTriggerLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 border border-status-failed/30 bg-status-failed/5 rounded-[2px] text-center space-y-4">
        <p className="text-xs font-mono text-status-failed">{error || 'Project not found.'}</p>
        <Link to="/projects">
          <Button variant="outline" size="sm">
            ← Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const stack = analysis?.detected_stack_json || {};
  const manifests = analysis?.manifests_json?.files || [];
  const languages = analysis?.languages_json || {};
  const totalLangBytes = Object.values(languages).reduce((a, b) => a + b, 0);

  const isGitHub = project.repository_url?.includes('github.com');
  const commitUrl = analysis?.commit_sha && analysis?.owner && analysis?.repo
    ? `https://github.com/${analysis.owner}/${analysis.repo}/commit/${analysis.commit_sha}`
    : null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back Link */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-[11px] font-mono tracking-wider uppercase text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Repositories
        </Link>
      </div>

      {/* Project Overview Card */}
      <div className="relative border border-line rounded-[2px] p-6 sm:p-8 bg-surface-light dark:bg-surface-dark space-y-5">
        <div className="absolute -top-2.5 right-6 px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-surface-light dark:bg-surface-dark text-ink-muted border border-line rounded-[2px]">
          BRANCH: {project.default_branch}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-[2px] border border-line bg-surface-subtle flex items-center justify-center text-ink shrink-0">
              <FolderGit2 className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-ink">
                  {project.name}
                </h1>
                <SourceTag source={analysis ? 'real' : 'simulated'} showDetails={Boolean(analysis)} />
              </div>
              <p className="text-[11px] font-mono text-ink-muted">
                slug: <span className="text-ink">{project.slug}</span> • id: <span className="text-ink">{project.id}</span>
              </p>
            </div>
          </div>

          <a
            href={project.repository_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono tracking-wide uppercase border border-line rounded-[2px] hover:bg-surface-subtle text-ink-muted hover:text-ink transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Repository
          </a>
        </div>

        {project.description && (
          <p className="text-xs sm:text-sm text-ink-muted max-w-3xl leading-relaxed pt-1">
            {project.description}
          </p>
        )}
      </div>

      {/* Repository Analysis Intelligence Card */}
      {isGitHub && (
        <div className="border border-line rounded-[2px] p-6 bg-surface-light dark:bg-surface-dark space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-ink-muted">METADATA INSPECTION</span>
                <SourceTag source={analysis ? 'real' : 'simulated'} showDetails />
              </div>
              <h2 className="text-base font-normal text-ink tracking-tight">
                Repository Intelligence (GitHub REST API)
              </h2>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAnalysis}
              loading={analysisLoading}
              className="shrink-0 font-mono text-[11px]"
            >
              <RotateCw className="w-3 h-3" /> Refresh Analysis
            </Button>
          </div>

          {analysis ? (
            <div className="space-y-4 text-xs font-mono">
              {/* Top metadata grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border border-line rounded-[2px] divide-y sm:divide-y-0 sm:divide-x divide-line bg-surface-subtle/40">
                <div className="p-3.5 space-y-1">
                  <span className="text-[10px] uppercase text-ink-muted block">Latest Commit</span>
                  <div className="flex items-center gap-1.5">
                    <GitCommit className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                    {commitUrl ? (
                      <a
                        href={commitUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-ink hover:underline inline-flex items-center gap-1"
                      >
                        {analysis.commit_sha?.substring(0, 7)}
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    ) : (
                      <span className="font-semibold text-ink">{analysis.commit_sha?.substring(0, 7)}</span>
                    )}
                    <CopyButton text={analysis.commit_sha} size="sm" />
                  </div>
                </div>

                <div className="p-3.5 space-y-1">
                  <span className="text-[10px] uppercase text-ink-muted block">Branch / Author</span>
                  <div className="text-ink truncate">
                    <span className="font-semibold">{analysis.branch}</span>
                    <span className="text-ink-muted text-[11px]"> • {analysis.commit_author}</span>
                  </div>
                </div>

                <div className="p-3.5 space-y-1">
                  <span className="text-[10px] uppercase text-ink-muted block">Stars & License</span>
                  <div className="text-ink flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-ink-muted" /> {analysis.stars ?? 0}
                    </span>
                    <span className="text-line">•</span>
                    <span className="truncate">{analysis.license || 'No license'}</span>
                  </div>
                </div>

                <div className="p-3.5 space-y-1">
                  <span className="text-[10px] uppercase text-ink-muted block">Last Inspection</span>
                  <div className="text-ink truncate">
                    {analysis.fetched_at ? new Date(analysis.fetched_at).toLocaleTimeString() : 'Recent'}
                    {analysis.rate_limit_remaining !== undefined && (
                      <span className="text-ink-muted text-[10px] block">
                        Rate limit: {analysis.rate_limit_remaining} left
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Commit message quote */}
              {analysis.commit_message && (
                <div className="p-3 bg-surface-subtle border border-line rounded-[2px] text-ink/90 text-[11px] leading-relaxed italic">
                  "{analysis.commit_message}"
                </div>
              )}

              {/* Languages bar */}
              {totalLangBytes > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] text-ink-muted uppercase">
                    <span>Detected Languages</span>
                    <span>{Object.keys(languages).length} languages</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-subtle border border-line rounded-[1px] overflow-hidden flex">
                    {Object.entries(languages).map(([lang, bytes], idx) => {
                      const pct = ((bytes / totalLangBytes) * 100).toFixed(1);
                      const opacities = ['opacity-90', 'opacity-70', 'opacity-50', 'opacity-30'];
                      return (
                        <div
                          key={lang}
                          title={`${lang}: ${pct}%`}
                          style={{ width: `${pct}%` }}
                          className={`h-full bg-white ${opacities[idx % opacities.length]}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] text-ink-muted pt-1">
                    {Object.entries(languages).slice(0, 5).map(([lang, bytes]) => {
                      const pct = ((bytes / totalLangBytes) * 100).toFixed(1);
                      return (
                        <span key={lang} className="inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-white/70 rounded-full" />
                          <span className="text-ink">{lang}</span>
                          <span>{pct}%</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stack & Manifests Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-line">
                <span className="text-[10px] uppercase text-ink-muted mr-1">Stack:</span>
                {stack.ecosystem && (
                  <span className="px-2 py-0.5 bg-surface-subtle border border-line rounded-[2px] text-ink flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-ink-muted" /> {stack.ecosystem}
                  </span>
                )}
                {stack.framework && (
                  <span className="px-2 py-0.5 bg-surface-subtle border border-line rounded-[2px] text-ink">
                    {stack.framework}
                  </span>
                )}
                {stack.package_manager && (
                  <span className="px-2 py-0.5 bg-surface-subtle border border-line rounded-[2px] text-ink-muted">
                    pkg: {stack.package_manager}
                  </span>
                )}
                {manifests.map((m) => (
                  <span
                    key={m}
                    className="px-2 py-0.5 bg-surface-subtle border border-line rounded-[2px] text-ink-muted flex items-center gap-1"
                  >
                    <FileCode className="w-3 h-3 text-ink-faint" /> {m}
                  </span>
                ))}
              </div>

              {/* Honesty note */}
              <div className="p-2.5 bg-surface-subtle border border-line rounded-[2px] text-[10px] text-ink-muted flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-ink-muted shrink-0 mt-0.5" />
                <span>
                  <strong>Honesty Guarantee:</strong> Source Checkout and Build stages inspect only verified public metadata and small manifests (≤100 KB) via the GitHub REST API. Repository code is never cloned, containerized, or executed.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-6 border border-line rounded-[2px] text-center bg-surface-subtle/30 space-y-3 font-mono text-xs">
              <p className="text-ink-muted">No repository analysis has been captured yet for this repository.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAnalysis}
                loading={analysisLoading}
              >
                Inspect Repository Now
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Pipelines Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-ink-muted">CONFIGURED WORKFLOWS</span>
            <h2 className="text-lg font-light text-ink tracking-tight">
              Delivery Pipelines
            </h2>
          </div>
          <span className="text-xs font-mono text-ink-muted">
            {pipelines.length} {pipelines.length === 1 ? 'pipeline' : 'pipelines'}
          </span>
        </div>

        <div className="space-y-3">
          {pipelines.map((pipe) => (
            <div
              key={pipe.id}
              className="border border-line rounded-[2px] p-5 bg-surface-light dark:bg-surface-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-ink/20 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-ink-muted stroke-[1.5]" />
                  <h3 className="text-base font-normal text-ink tracking-tight">
                    {pipe.name}
                  </h3>
                  {pipe.latest_run_status && (
                    <Badge variant={pipe.latest_run_status} size="sm">
                      {pipe.latest_run_status}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-ink-muted">
                  <span>ID: {pipe.id}</span>
                  <span className="text-line">•</span>
                  <span>{pipe.total_runs || 0} total dispatches</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {pipe.latest_run_id && (
                  <Link to={`/runs/${pipe.latest_run_id}`}>
                    <Button variant="outline" size="sm">
                      Inspect Run #{pipe.latest_run_id.split('_').pop() || pipe.latest_run_id}
                    </Button>
                  </Link>
                )}
                <Button
                  size="sm"
                  onClick={() => setSelectedPipelineForRun(pipe)}
                  withArrow
                >
                  <Play className="w-3 h-3 fill-current" /> Trigger Run
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatch Controls Modal */}
      <RunControlsModal
        isOpen={!!selectedPipelineForRun}
        onClose={() => setSelectedPipelineForRun(null)}
        onTriggerRun={handleTriggerRun}
        pipelineName={selectedPipelineForRun?.name}
        loading={triggerLoading}
      />
    </div>
  );
}

export default ProjectDetailPage;
