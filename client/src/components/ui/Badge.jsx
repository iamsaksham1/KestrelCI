/**
 * @file client/src/components/ui/Badge.jsx
 * @description Accessible status and metadata badge.
 * Restrained, crisp 1px borders, uppercase micro-typography, square/2px corners.
 */

import React from 'react';

export function Badge({ children, variant = 'pending', size = 'sm', className = '' }) {
  const variants = {
    success: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/30',
    running: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse',
    failed: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    skipped: 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20 opacity-70',
    cancelled: 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20',
    pending: 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20',
    simulated: 'bg-transparent text-ink-muted border-line uppercase tracking-[0.1em] font-mono text-[10px]',
    neutral: 'bg-surface-subtle text-ink-muted border-line uppercase tracking-[0.08em]',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-[2px]',
    md: 'text-xs px-2.5 py-1 rounded-[2px]',
  };

  return (
    <span
      className={`inline-flex items-center font-sans tracking-[0.06em] uppercase font-medium border select-none ${variants[variant] || variants.pending} ${sizes[size] || sizes.sm} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
