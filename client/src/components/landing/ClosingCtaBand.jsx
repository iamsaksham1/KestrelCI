/**
 * @file client/src/components/landing/ClosingCtaBand.jsx
 * @description Closing CTA Band matching Squarespace Design Intelligence:
 * - Permanently pure black (#000000) stage across both light and dark site themes
 * - Minimalist particle aura in background
 * - Modest light-weight typography and solid white rectangular CTA
 */

import React from 'react';
import { Link } from 'react-router-dom';

export function ClosingCtaBand() {
  return (
    <section
      aria-label="Get Started with KestrelCI"
      className="relative w-full bg-black text-white py-24 sm:py-32 px-6 overflow-hidden select-none border-t border-white/10"
      style={{ backgroundColor: '#000000' }}
    >
      {/* Background Starry/Particle Aura */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <svg viewBox="0 0 600 600" className="w-[500px] h-[500px] text-white" fill="none">
          <circle cx="300" cy="300" r="220" stroke="currentColor" strokeWidth="1" strokeDasharray="2 8" />
          <circle cx="300" cy="300" r="160" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" />
          <circle cx="300" cy="300" r="90" stroke="currentColor" strokeWidth="1" strokeDasharray="1 4" />
        </svg>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
        <span className="font-serif italic text-white/60 text-base sm:text-lg tracking-wide block">
          Deterministic Deployment
        </span>

        <h2 className="font-sans font-light text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-[1.1]">
          Deploy your first simulated pipeline.
        </h2>

        <p className="font-sans font-light text-sm sm:text-base text-white/60 leading-relaxed max-w-lg mx-auto">
          Seven sequential stages. Deterministic failure injection. Real-time background execution without touching remote infrastructure.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-black hover:bg-[#E5E5E2] font-sans uppercase tracking-[0.1em] text-xs font-semibold border border-white transition-all active:translate-y-[1px]"
          >
            <span>LAUNCH RUN</span>
            <span aria-hidden="true">→</span>
          </Link>

          <Link
            to="/docs"
            className="inline-flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white font-sans uppercase tracking-[0.1em] text-xs draw-underline"
          >
            <span>READ ARCHITECTURE</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ClosingCtaBand;
