/**
 * @file client/src/pages/PrivacyPage.jsx
 * @description Plain-language privacy policy covering storage, local cookies,
 * zero third-party tracking, retention, and contact rights.
 */

import React from 'react';
import PRIVACY_POLICY from '../content/privacyData.js';
import { LAST_UPDATED } from '../content/constants.js';
import { ShieldCheck, Info } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
      {/* Header */}
      <div className="border-b border-line pb-6 space-y-2">
        <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-ink-muted">DATA PROTECTION & TRANSPARENCY</span>
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-ink">
          Privacy Policy
        </h1>
        <p className="text-xs font-mono text-ink-muted">
          LAST REVISED: {LAST_UPDATED}
        </p>
      </div>

      {/* Summary Highlight */}
      <div className="p-5 border border-line rounded-[2px] bg-surface-subtle flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-ink-muted shrink-0 mt-0.5 stroke-[1.5]" />
        <div className="text-xs text-ink leading-relaxed font-normal">
          {PRIVACY_POLICY.summary}
        </div>
      </div>

      {/* Policy Sections */}
      <div className="space-y-8 divide-y divide-line">
        {PRIVACY_POLICY.sections.map((section, idx) => (
          <div key={section.title} className={idx > 0 ? "pt-8 space-y-3" : "space-y-3"}>
            <h2 className="text-base font-medium text-ink tracking-tight">
              {section.title}
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-ink-muted leading-relaxed">
              {section.content.map((p, pIdx) => (
                <p key={pIdx}>{p}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legal Review Disclaimer */}
      <div className="p-4 bg-surface-subtle border border-line rounded-[2px] flex items-start gap-3 text-xs text-ink-muted">
        <Info className="w-4 h-4 text-ink-muted shrink-0 mt-0.5 stroke-[1.5]" />
        <p className="leading-relaxed">
          {PRIVACY_POLICY.legalDisclaimer}
        </p>
      </div>
    </div>
  );
}

export default PrivacyPage;
