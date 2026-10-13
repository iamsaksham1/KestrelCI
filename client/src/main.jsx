/**
 * @file client/src/main.jsx
 * @description Frontend application entry point.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './app/Router.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
