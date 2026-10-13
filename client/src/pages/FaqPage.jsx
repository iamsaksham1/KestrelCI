/**
 * @file client/src/pages/FaqPage.jsx
 * @description Dedicated FAQ view embedding the accessible disclosure accordion.
 */

import React from 'react';
import FaqAccordion from '../components/ui/FaqAccordion.jsx';
import SimulatedBadge from '../components/banners/SimulatedBadge.jsx';
import { LAST_UPDATED } from '../content/constants.js';

export function FaqPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="border-b border-line pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-ink-muted">FREQUENTLY ASKED QUESTIONS</span>
          <SimulatedBadge />
        </div>
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-ink">
          Questions & Technical Answers
        </h1>
        <p className="text-xs font-mono text-ink-muted">
          LAST REVISED: {LAST_UPDATED}
        </p>
      </div>

      <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
        Everything you need to know about KestrelCI's simulated stage executors, failure injection, data privacy, and architecture.
      </p>

      <FaqAccordion />
    </div>
  );
}

export default FaqPage;
