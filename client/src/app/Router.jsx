/**
 * @file client/src/app/Router.jsx
 * @description Application route map configuring React Router v6.
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './Layout.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ProjectsPage from '../pages/ProjectsPage.jsx';
import ProjectDetailPage from '../pages/ProjectDetailPage.jsx';
import RunDetailPage from '../pages/RunDetailPage.jsx';
import HistoryPage from '../pages/HistoryPage.jsx';
import DocsPage from '../pages/DocsPage.jsx';
import FaqPage from '../pages/FaqPage.jsx';
import PrivacyPage from '../pages/PrivacyPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="runs" element={<HistoryPage />} />
        <Route path="runs/:id" element={<RunDetailPage />} />
        <Route path="docs" element={<DocsPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;
