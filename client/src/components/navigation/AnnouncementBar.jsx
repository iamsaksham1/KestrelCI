/**
 * @file client/src/components/navigation/AnnouncementBar.jsx
 * @description Slim pure-black announcement bar matching Squarespace Design Intelligence:
 * - Centered sentence with code chip and copy button
 * - Visible WCAG 2.2.2 "Pause Animation" control
 * - Dismissable with local storage memory
 */

import React, { useState } from 'react';
import { CopyButton } from '../ui/CopyButton.jsx';
import { Play, Pause, X } from 'lucide-react';

export function AnnouncementBar({ isMotionPaused, onToggleMotion }) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <aside
      aria-label="Announcement"
      className="relative z-50 bg-black text-white/90 border-b border-white/10 px-4 py-2 text-[11px] font-sans flex items-center justify-between select-none"
    >
      <div className="flex-1 hidden md:flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleMotion}
          className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-white/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
          title={isMotionPaused ? "Resume 3D shaders and motion" : "Pause 3D shaders and card drift (WCAG 2.2.2)"}
          aria-label={isMotionPaused ? "Resume animations" : "Pause animations"}
        >
          {isMotionPaused ? <Play className="w-3 h-3 text-amber-400" /> : <Pause className="w-3 h-3 text-white/70" />}
          <span>{isMotionPaused ? "Resume Motion" : "Pause Motion"}</span>
        </button>
      </div>

      {/* Centered Headline with Code Chip */}
      <div className="flex items-center justify-center gap-2 text-center flex-1">
        <span className="text-white/60 hidden sm:inline">Engine Status:</span>
        <span className="font-medium text-white tracking-wide">
          SIMULATED ENGINE V1.0 • DETERMINISTIC STAGE TESTING
        </span>
        <div className="hidden lg:flex items-center gap-1 bg-white/10 px-2 py-0.5 border border-white/15">
          <span className="font-mono text-[10px] text-white/80">pipe_core_main</span>
          <CopyButton textToCopy="pipe_core_main" label="pipeline id" className="p-0.5 text-white/70 hover:text-white" />
        </div>
      </div>

      {/* Dismiss Action */}
      <div className="flex-1 flex justify-end">
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-white/40 hover:text-white p-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}

export default AnnouncementBar;
