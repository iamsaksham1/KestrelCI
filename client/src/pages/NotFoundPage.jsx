/**
 * @file client/src/pages/NotFoundPage.jsx
 * @description 404 Route Not Found view with return to home affordance.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import { Compass } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="py-20 text-center max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="w-14 h-14 mx-auto bg-surface-subtle border border-line rounded-[2px] flex items-center justify-center text-ink">
        <Compass className="w-6 h-6 stroke-[1.5]" />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-ink-muted">ERROR 404 • UNRESOLVED ROUTE</span>
        <h1 className="text-3xl font-light tracking-tight text-ink">
          Page Not Located
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
          The requested pipeline route or view does not exist on this KestrelCI deployment.
        </p>
      </div>

      <div className="pt-2">
        <Link to="/">
          <Button size="md" withArrow>
            Return to Overview
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
