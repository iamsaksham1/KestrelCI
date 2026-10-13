/**
 * @file client/src/components/ui/Skeleton.jsx
 * @description Accessible loading placeholder skeleton element.
 */

import React from 'react';

export function Skeleton({ className = '', height, width }) {
  return (
    <div
      className={`bg-line/60 dark:bg-line/40 animate-pulse rounded-[2px] ${className}`}
      style={{
        height: height,
        width: width
      }}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="border border-line rounded-[2px] p-5 bg-surface-light dark:bg-surface-dark space-y-3">
      <Skeleton height="1.25rem" width="40%" />
      <Skeleton height="0.875rem" width="70%" />
      <div className="pt-2 flex justify-between">
        <Skeleton height="1rem" width="25%" />
        <Skeleton height="1rem" width="20%" />
      </div>
    </div>
  );
}

export default Skeleton;
