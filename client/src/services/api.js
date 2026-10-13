/**
 * @file client/src/services/api.js
 * @description Centralized HTTP client communicating with KestrelCI REST API.
 * Attaches X-API-Key credentials on mutation operations.
 */

// ╔══════════════════════════════════════════════════════════════╗
// ║  API KEY  >>>  set API_KEY in server/.env  (never commit it)  ║
// ╚══════════════════════════════════════════════════════════════╝
// For this standalone client demo, the client identifies itself using the key below.
// In a public multi-tenant production environment, write operations should authenticate
// via secure HTTP-only session cookies or an authenticated server proxy.
export const DEMO_API_KEY = import.meta.env.VITE_API_KEY || 'kestrel_demo_key_7f8d9a2b1c4e6f';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Low-level HTTP fetch wrapper with standardized error handling.
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const method = (options.method || 'GET').toUpperCase();
  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

  // Attach X-API-Key for mutation requests
  if (isMutation && !headers['X-API-Key']) {
    headers['X-API-Key'] = DEMO_API_KEY;
  }

  const config = {
    ...options,
    method,
    headers
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.error?.message || `HTTP ${response.status}: Request failed`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.code = data?.error?.code || 'API_REQUEST_ERROR';
      err.details = data?.error?.details || null;
      throw err;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const netErr = new Error('Unable to connect to KestrelCI API server. Ensure backend is running.');
      netErr.code = 'NETWORK_ERROR';
      throw netErr;
    }
    throw err;
  }
}

export const api = {
  // Projects
  getProjects() {
    return request('/projects').then(res => res.data);
  },
  getProject(id) {
    return request(`/projects/${id}`).then(res => res.data);
  },
  createProject(projectData) {
    return request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    }).then(res => res.data);
  },
  deleteProject(id) {
    return request(`/projects/${id}`, {
      method: 'DELETE'
    }).then(res => res.data);
  },
  getProjectPipelines(projectId) {
    return request(`/projects/${projectId}/pipelines`).then(res => res.data);
  },
  analyzeUrl(repositoryUrl) {
    return request('/projects/analyze-url', {
      method: 'POST',
      body: JSON.stringify({ repository_url: repositoryUrl })
    }).then(res => res.data);
  },
  analyzeProject(projectId, options = {}) {
    return request(`/projects/${projectId}/analyze`, {
      method: 'POST',
      body: JSON.stringify(options)
    }).then(res => res.data);
  },
  getProjectAnalysis(projectId) {
    return request(`/projects/${projectId}/analysis`).then(res => res.data);
  },

  // Pipelines & Runs
  getPipeline(id) {
    return request(`/pipelines/${id}`).then(res => res.data);
  },
  triggerRun(pipelineId, options = {}) {
    return request(`/pipelines/${pipelineId}/run`, {
      method: 'POST',
      body: JSON.stringify(options)
    }).then(res => res.data);
  },
  getRuns(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.project) query.set('project', params.project);
    if (params.pipeline) query.set('pipeline', params.pipeline);
    if (params.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params.dateTo) query.set('dateTo', params.dateTo);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/runs${qs}`);
  },
  getRunDetails(id) {
    return request(`/runs/${id}`).then(res => res.data);
  },
  getRunAnalysis(id) {
    return request(`/runs/${id}/analysis`).then(res => res.data);
  },
  getRunLogs(id, params = {}) {
    const query = new URLSearchParams();
    if (params.stage) query.set('stage', params.stage);
    if (params.level) query.set('level', params.level);
    if (params.source) query.set('source', params.source);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/runs/${id}/logs${qs}`).then(res => res.data);
  },
  retryRun(id) {
    return request(`/runs/${id}/retry`, {
      method: 'POST'
    }).then(res => res.data);
  },
  cancelRun(id) {
    return request(`/runs/${id}/cancel`, {
      method: 'POST'
    }).then(res => res.data);
  },
  clearRunHistory() {
    return request('/runs/history', {
      method: 'DELETE'
    }).then(res => res.data);
  },

  // Dashboard & Metrics
  getDashboardStats() {
    return request('/dashboard/stats').then(res => res.data);
  },

  // Global Search
  search(query) {
    return request(`/search?q=${encodeURIComponent(query)}`).then(res => res.data);
  },

  // Public Contact
  submitContact(contactData) {
    return request('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData)
    }).then(res => res.data);
  },

  // Health Probe
  getHealth() {
    return request('/health');
  }
};

export default api;
