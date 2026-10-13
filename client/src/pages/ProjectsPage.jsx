/**
 * @file client/src/pages/ProjectsPage.jsx
 * @description Project list view with repository cards, pipeline counts,
 * creation modal, and accessible delete confirmation dialog.
 * Restyled to square corners, hairline borders, and restrained typography.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import CreateProjectModal from '../components/forms/CreateProjectModal.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import { CardSkeleton } from '../components/ui/Skeleton.jsx';
import { FolderGit2, Plus, Trash2, GitBranch } from 'lucide-react';

export function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (formData) => {
    setActionLoading(true);
    try {
      await api.createProject(formData);
      setIsCreateModalOpen(false);
      await fetchProjects();
    } catch (err) {
      alert(`Creation error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setActionLoading(true);
    try {
      await api.deleteProject(projectToDelete.id);
      setProjectToDelete(null);
      await fetchProjects();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-line pb-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted block mb-1">
            CODE REPOSITORIES
          </span>
          <h1 className="font-sans font-light text-2xl sm:text-3xl tracking-tight text-ink">
            Active Projects
          </h1>
          <p className="font-sans font-light text-xs sm:text-sm text-ink-muted mt-1">
            Registered code repositories with attached delivery pipelines and execution history.
          </p>
        </div>
        <div>
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)} withArrow>
            <Plus className="w-3.5 h-3.5 mr-1" /> New Project
          </Button>
        </div>
      </div>

      {error ? (
        <div className="p-6 border border-red-500/25 bg-red-500/5 rounded-[2px] text-center space-y-3 font-mono">
          <p className="text-xs text-red-500">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchProjects}>
            Retry Fetch
          </Button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : projects.length === 0 ? (
        <div className="border border-line rounded-[2px] p-12 text-center bg-surface-light dark:bg-surface-dark space-y-4">
          <FolderGit2 className="w-10 h-10 text-ink-muted mx-auto opacity-40" />
          <h2 className="font-sans font-light text-base text-ink uppercase tracking-wide">No projects defined yet</h2>
          <p className="text-xs font-sans font-light text-ink-muted max-w-sm mx-auto">
            Get started by registering a demo project repository and establishing your first continuous delivery pipeline.
          </p>
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
            Create First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <div
              key={p.id}
              className="border border-line rounded-[2px] p-6 bg-surface-light dark:bg-surface-dark flex flex-col justify-between hover:border-ink/40 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-ink-faint shrink-0" />
                    <h2 className="font-sans font-medium text-sm text-ink tracking-tight uppercase truncate">
                      {p.name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProjectToDelete(p)}
                    aria-label={`Delete project ${p.name}`}
                    className="p-1 text-ink-muted hover:text-red-500 rounded-[2px] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="font-sans font-light text-xs text-ink-muted line-clamp-2 leading-relaxed">
                  {p.description || 'No description provided.'}
                </p>

                <div className="flex items-center gap-2 text-[11px] font-mono text-ink-faint truncate pt-1">
                  <GitBranch className="w-3 h-3 shrink-0" />
                  <span className="truncate">{p.default_branch}</span>
                  <span>•</span>
                  <span>{p.pipeline_count || 1} pipeline</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-xs">
                {p.latest_run_status ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase text-ink-muted">Latest:</span>
                    <Badge variant={p.latest_run_status}>
                      {p.latest_run_status}
                    </Badge>
                  </div>
                ) : (
                  <span className="text-ink-faint font-mono text-[10px] uppercase">No runs yet</span>
                )}

                <Link to={`/projects/${p.id}`}>
                  <Button variant="outline" size="sm" withArrow>
                    Pipelines
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateProject={handleCreateProject}
        loading={actionLoading}
      />

      {/* Accessible Confirmation Modal for Deletion */}
      <ConfirmModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteProject}
        title="Delete Project Repository"
        message={`Are you sure you want to permanently delete '${projectToDelete?.name}'? This action will cascade to all associated pipelines, historical runs, and log records.`}
        confirmLabel="Permanently Delete"
        isDestructive
        loading={actionLoading}
      />
    </div>
  );
}

export default ProjectsPage;
