import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRouter from '../app/Router.jsx';

vi.mock('../services/api.js', () => ({
  default: {
    getStats: vi.fn().mockResolvedValue({ total_projects: 3, total_runs: 10 }),
    getProjects: vi.fn().mockResolvedValue([]),
    getRuns: vi.fn().mockResolvedValue({ data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 1 } }),
    getProject: vi.fn().mockResolvedValue({ id: 'p1', name: 'Demo', slug: 'demo', default_branch: 'main' }),
    getProjectPipelines: vi.fn().mockResolvedValue([]),
    getRunDetails: vi.fn().mockResolvedValue({ id: 'r1', run_number: 1, status: 'success', stages: [] }),
    getRunLogs: vi.fn().mockResolvedValue([]),
    search: vi.fn().mockResolvedValue({ projects: [], runs: [], docs: [] }),
  }
}));

describe('App Router E2E Render', () => {
  it('renders LandingPage without throwing', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
    expect(container.innerHTML).not.toBe('');
  });

  it('renders DashboardPage without throwing', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppRouter />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
    expect(container.innerHTML).not.toBe('');
  });

  it('renders ProjectsPage without throwing', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/projects']}>
        <AppRouter />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
    expect(container.innerHTML).not.toBe('');
  });

  it('renders HistoryPage without throwing', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/runs']}>
        <AppRouter />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
    expect(container.innerHTML).not.toBe('');
  });

  it('renders DocsPage without throwing', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/docs']}>
        <AppRouter />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
    expect(container.innerHTML).not.toBe('');
  });

  it('renders FaqPage without throwing', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/faq']}>
        <AppRouter />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
    expect(container.innerHTML).not.toBe('');
  });

  it('renders PrivacyPage without throwing', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/privacy']}>
        <AppRouter />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
    expect(container.innerHTML).not.toBe('');
  });

  it('renders NotFoundPage without throwing', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/invalid-route']}>
        <AppRouter />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
    expect(container.innerHTML).not.toBe('');
  });
});
