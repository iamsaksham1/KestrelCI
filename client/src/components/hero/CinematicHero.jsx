/**
 * @file client/src/components/hero/CinematicHero.jsx
 * @description Immersive pure-black hero stage modeled on Squarespace Design Intelligence:
 * - 100vh pinned stage with layered composition
 * - WebGL Particle Sphere (Three.js GPU-driven noise breathing)
 * - 6 peripheral floating tilted 3D cards with cursor parallax and overlapping chips
 * - Modest light-weight central statement paragraph (not a giant bold shouting headline)
 * - Uppercase "START A RUN →" text link with underline hover transition
 * - Monospace simulation caption (honesty rule stated once clearly)
 * - Scroll-linked dissolution and depth drift
 * - Accessible Pause Motion control (WCAG 2.2.2) and reduced motion support
 */

import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import ParticleSphere from './ParticleSphere.jsx';
import FloatingCards from './FloatingCards.jsx';

export function CinematicHero({ isMotionPaused = false }) {
  const heroRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [introReady, setIntroReady] = useState(false);

  useEffect(() => {
    // Trigger intro sequence on mount
    const timer = setTimeout(() => setIntroReady(true), 120);

    const handleScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const heroHeight = heroRef.current.offsetHeight || window.innerHeight;
      // Calculate how far hero is scrolled (0 at top, 1 when scrolled 1 heroHeight)
      const progress = Math.max(0, Math.min(1, -rect.top / heroHeight));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero-stage"
      aria-label="KestrelCI Introduction"
      className="relative w-full h-[100vh] min-h-[700px] max-h-[1050px] bg-black text-white overflow-hidden select-none flex items-center justify-center"
      style={{
        backgroundColor: '#000000',
      }}
    >
      {/* ╔══════════════════════════════════════════════════════════╗
          ║ LAYER 1: WebGL Particle Sphere (Three.js Core)           ║
          ╚══════════════════════════════════════════════════════════╝ */}
      <ParticleSphere
        isPaused={isMotionPaused}
        scrollProgress={scrollProgress}
      />

      {/* ╔══════════════════════════════════════════════════════════╗
          ║ LAYER 2: 3D Floating Tilted UI Cards                     ║
          ╚══════════════════════════════════════════════════════════╝ */}
      <FloatingCards
        isPaused={isMotionPaused}
        scrollProgress={scrollProgress}
      />

      {/* ╔══════════════════════════════════════════════════════════╗
          ║ LAYER 3: Central Text Layer (High-Contrast, Pure Clarity)║
          ╚══════════════════════════════════════════════════════════╝ */}
      <div
        className="relative z-30 max-w-2xl mx-auto px-6 text-center pointer-events-auto transition-all duration-700 ease-out"
        style={{
          opacity: Math.max(0, 1 - scrollProgress * 1.8),
          transform: `translateY(${scrollProgress * 60}px)`,
        }}
      >
        {/* Soft radial contrast backdrop behind central text to ensure absolute legibility */}
        <div
          className="absolute inset-0 -m-8 sm:-m-16 rounded-full pointer-events-none -z-10"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0) 80%)',
          }}
          aria-hidden="true"
        />

        {/* Eyebrow: Light Serif Italic / Micro Tracked */}
        <div
          className={`transition-all duration-1000 delay-300 transform ${
            introReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="font-serif italic text-white/80 text-base sm:text-lg tracking-wide block mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Autonomous Verification
          </span>
        </div>

        {/* Modest Light-Weight Statement Paragraph (Authentic Clarkson) */}
        <div
          className={`transition-all duration-1000 delay-500 transform ${
            introReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="font-sans font-light text-[21px] sm:text-[25px] lg:text-[27px] leading-[1.22] tracking-[-0.015em] text-white max-w-xl mx-auto drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
            Every delivery pipeline is an experiment in resilience. KestrelCI orchestrates seven sequential deployment stages with deterministic failure injection and live telemetry.
          </p>
        </div>

        {/* Action Link & Simulation Disclaimer */}
        <div
          className={`mt-7 flex flex-col items-center gap-3.5 transition-all duration-1000 delay-700 transform ${
            introReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Uppercase Text Link with Underline and Arrow */}
          <Link
            to="/projects"
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] font-medium text-white hover:text-white/80 transition-colors py-1 draw-underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            <span>START A RUN</span>
            <span
              className="inline-block transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </Link>

          {/* Quiet Honesty Rule Caption */}
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
            All stages are simulated • Zero remote infrastructure
          </span>
        </div>
      </div>

      {/* Downward Scroll Prompt Indicator */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none transition-opacity duration-500 hidden sm:block"
        style={{ opacity: Math.max(0, 1 - scrollProgress * 3) }}
      >
        <div className="flex flex-col items-center gap-1.5 text-white/30 text-[9px] font-mono uppercase tracking-[0.15em]">
          <span>Scroll</span>
          <svg className="w-3.5 h-3.5 text-white/40 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}

export default CinematicHero;
