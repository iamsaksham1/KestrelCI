/**
 * @file client/src/components/banners/CookieBanner.jsx
 * @description Non-blocking functional storage notice.
 * Square corners, hairline borders, no orange accents, link to /privacy.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import { ShieldCheck } from 'lucide-react';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('kestrel-cookie-consent');
      if (!consent) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(false);
    }
  }, []);

  const handleChoice = (accepted) => {
    try {
      localStorage.setItem('kestrel-cookie-consent', accepted ? 'accepted' : 'declined');
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie & Functional Storage Notice"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 p-5 bg-surface-light dark:bg-surface-dark border border-line rounded-[2px] shadow-2xl animate-slide-up select-none"
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-white/10 text-ink border border-line rounded-[2px] shrink-0">
          <ShieldCheck className="w-4 h-4" aria-hidden="true" />
        </div>
        <div className="text-xs font-sans font-light text-ink-muted leading-relaxed">
          <p className="font-medium text-ink uppercase tracking-wider text-[11px] mb-1">
            Zero Third-Party Tracking
          </p>
          <p>
            KestrelCI only uses local browser storage for functional settings (your theme and this preference). We load zero analytics, marketing, or behavioral tracking scripts regardless of your choice.
          </p>
          <div className="mt-2">
            <Link
              to="/privacy"
              className="text-ink font-medium uppercase tracking-wider text-[10px] draw-underline inline-block"
            >
              Privacy Policy →
            </Link>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-line">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleChoice(false)}
        >
          Decline
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleChoice(true)}
        >
          Acknowledge
        </Button>
      </div>
    </aside>
  );
}

export default CookieBanner;
