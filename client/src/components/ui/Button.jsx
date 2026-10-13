/**
 * @file client/src/components/ui/Button.jsx
 * @description Accessible button component adhering to Squarespace Design Intelligence rules:
 * - Square or 2px corners (no pill or rounded-md buttons)
 * - Uppercase, tracked typography
 * - Primary = solid white on dark / solid ink on light (no orange or accent fills)
 * - Secondary = text link with animated underline and arrow
 * - Outline = crisp 1px hairline border
 * - Accessible focus rings (WCAG 2.4.7)
 */

import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  withArrow = false,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles = 'group relative inline-flex items-center justify-center font-sans uppercase tracking-[0.08em] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white dark:focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-40 disabled:cursor-not-allowed select-none rounded-[2px]';

  const variants = {
    // Primary: Solid white in dark mode, solid near-black in light mode
    primary: 'bg-btn-primary text-btn-primary-text hover:bg-btn-primary-hover border border-transparent active:translate-y-[1px]',
    // Secondary: Text link style with animated hairline underline and arrow
    secondary: 'bg-transparent text-ink hover:text-ink/80 draw-underline p-0 border-none',
    // Outline: 1px hairline border
    outline: 'bg-transparent text-ink border border-line hover:border-ink/50 active:translate-y-[1px]',
    // Stage Dark: Always solid white button (for hero and dark closing band)
    stage: 'bg-white text-black hover:bg-[#E5E5E2] border border-white active:translate-y-[1px]',
    // Destructive: Muted red for confirm deletions
    destructive: 'bg-status-failed text-white hover:bg-red-700 active:translate-y-[1px]',
    // Ghost: Transparent with subtle hover
    ghost: 'bg-transparent text-ink-muted hover:text-ink hover:bg-surface-subtle',
  };

  const sizes = {
    sm: 'text-[11px] px-3 py-1.5 gap-1.5',
    md: 'text-[12px] px-4 py-2.5 gap-2',
    lg: 'text-[13px] px-6 py-3.5 gap-2.5',
  };

  // If secondary text link, sizing does not apply box padding
  const sizeClass = variant === 'secondary' ? 'text-[12px] py-1 gap-1.5' : (sizes[size] || sizes.md);

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" aria-hidden="true" />
      ) : null}
      <span className="inline-flex items-center transition-transform duration-200 group-hover:-translate-x-0.5">
        {children}
      </span>
      {withArrow && !loading && (
        <span
          className="inline-block transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        >
          →
        </span>
      )}
    </button>
  );
}

export default Button;
