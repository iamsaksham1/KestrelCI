/**
 * @file client/src/components/banners/ScrollProgress.jsx
 * @description Pinned viewport top progress indicator showing page scroll progression.
 */

import React from 'react';
import useScrollProgress from '../../hooks/useScrollProgress.js';

export function ScrollProgress() {
  const { scrollProgress } = useScrollProgress();

  if (scrollProgress <= 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2.5px] z-50 bg-line/20 pointer-events-none"
      role="progressbar"
      aria-valuenow={Math.round(scrollProgress)}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="Page scroll progression"
    >
      <div
        className="h-full bg-ink dark:bg-white transition-[width] duration-75 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}

export default ScrollProgress;
