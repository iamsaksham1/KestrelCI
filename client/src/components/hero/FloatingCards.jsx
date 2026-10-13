/**
 * @file client/src/components/hero/FloatingCards.jsx
 * @description 3D floating tilted peripheral cards for the KestrelCI hero.
 * Features:
 * - 6 peripheral cards with individual rotateX/Y/Z, translateZ, and slow floating drift
 * - Every large card has an overlapping micro-chip pinned over its edge
 * - Mouse parallax response with depth layers
 * - Original CI/CD pipeline content (no stock imagery or AI photos)
 * - Accessible aria-hidden="true" decorative role
 * - Depth-of-field blur on background cards
 */

import React, { useEffect, useState, useRef } from 'react';

export function FloatingCards({ isPaused = false, scrollProgress = 0 }) {
  const containerRef = useRef(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const handleMouseMove = (e) => {
      if (isPaused) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1
      setMouseOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPaused]);

  // Scroll outward drift & vertical rising lift on scroll
  const scrollFade = Math.max(0, 1 - Math.pow(scrollProgress, 1.8) * 0.9);
  const scrollDrift = scrollProgress * 120;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden perspective-stage preserve-3d"
      style={{ zIndex: 2 }}
      aria-hidden="true"
    >
      {/* ╔══════════════════════════════════════════════════════════╗
          ║ CARD 1 (Top-Left): Dark Pipeline Screen + "RUNNING" Chip ║
          ╚══════════════════════════════════════════════════════════╝ */}
      <div
        className="absolute transition-all duration-700 ease-out hidden lg:block"
        style={{
          top: '16%',
          left: '7%',
          opacity: isMounted ? scrollFade : 0,
          transform: `translate3d(${mouseOffset.x * -12 - scrollDrift * 0.4}px, ${mouseOffset.y * -8 - scrollProgress * 360}px, ${40 + scrollProgress * 30}px) 
                      rotateX(${14 + mouseOffset.y * 3 - scrollProgress * 10}deg) 
                      rotateY(${18 + mouseOffset.x * 3}deg) 
                      rotateZ(${-5 - scrollProgress * 3}deg)`,
          transition: isMounted ? 'transform 0.1s ease-out, opacity 0.25s ease-out' : 'all 1.4s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div className="relative group animate-[floatGentle1_8s_ease-in-out_infinite]">
          {/* Overlapping Pinned Chip */}
          <div className="absolute -top-3.5 -right-3 z-20 px-2 py-0.5 bg-amber-400 text-black text-[9px] font-mono uppercase tracking-[0.12em] font-semibold shadow-md border border-black/40">
            RUNNING
          </div>

          {/* Main Card Surface */}
          <div className="w-[280px] p-4 bg-[#0E1015]/95 backdrop-blur-md border border-white/12 shadow-[0_20px_40px_rgba(0,0,0,0.8)] text-white">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
              <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">Pipe #882</span>
              <span className="font-mono text-[10px] text-amber-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                STG 03/07
              </span>
            </div>

            {/* 7 Small Stage Ticks */}
            <div className="grid grid-cols-7 gap-1.5 mb-3">
              <div className="h-1 bg-emerald-500" title="Checkout: Success" />
              <div className="h-1 bg-emerald-500" title="Build: Success" />
              <div className="h-1 bg-amber-400 animate-pulse" title="Unit Tests: Running" />
              <div className="h-1 bg-white/15" title="Lint: Pending" />
              <div className="h-1 bg-white/15" title="Security: Pending" />
              <div className="h-1 bg-white/15" title="Docker: Pending" />
              <div className="h-1 bg-white/15" title="Deploy: Pending" />
            </div>

            <div className="font-mono text-[10px] text-white/60 leading-relaxed truncate">
              unit_tests: executing 42 specs...
            </div>
          </div>
        </div>
      </div>

      {/* ╔══════════════════════════════════════════════════════════╗
          ║ CARD 2 (Top-Right): Cream Paper Log Card + "STDOUT" Chip ║
          ╚══════════════════════════════════════════════════════════╝ */}
      <div
        className="absolute transition-all duration-700 ease-out hidden lg:block"
        style={{
          top: '15%',
          right: '8%',
          opacity: isMounted ? scrollFade : 0,
          transform: `translate3d(${mouseOffset.x * 14 + scrollDrift * 0.4}px, ${mouseOffset.y * -10 - scrollProgress * 440}px, ${-10 + scrollProgress * 35}px) 
                      rotateX(${12 + mouseOffset.y * 3 - scrollProgress * 10}deg) 
                      rotateY(${-16 + mouseOffset.x * 3}deg) 
                      rotateZ(${4 + scrollProgress * 2}deg)`,
          transition: isMounted ? 'transform 0.1s ease-out, opacity 0.25s ease-out' : 'all 1.6s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div className="relative animate-[floatGentle2_9.5s_ease-in-out_infinite]">
          {/* Overlapping Pinned Chip */}
          <div className="absolute -top-3 -left-3 z-20 px-2 py-0.5 bg-black text-white text-[9px] font-mono uppercase tracking-[0.12em] font-medium border border-white/30 shadow-md">
            STDOUT
          </div>

          {/* Light Cream Paper Card */}
          <div className="w-[300px] p-4 bg-[#F5F4EE] text-[#111215] border border-black/10 shadow-[0_24px_48px_rgba(0,0,0,0.65)] font-mono text-[11px]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/10">
              <span className="text-[10px] uppercase tracking-wider text-black/50">Execution Telemetry</span>
              <span className="text-[12px] font-semibold text-black">1,420 ms</span>
            </div>
            <div className="space-y-1 text-[10px] leading-tight text-black/80 font-mono">
              <div className="text-black/50">17:04:12 [git] clone c8f1e09</div>
              <div className="text-emerald-700">17:04:14 [pass] 42/42 specs passed</div>
              <div className="text-black/70">17:04:15 [bund] sealed 289 kB</div>
            </div>
          </div>
        </div>
      </div>

      {/* ╔══════════════════════════════════════════════════════════╗
          ║ CARD 3 (Mid-Right): Translucent Slab + "EXIT 1" Chip     ║
          ╚══════════════════════════════════════════════════════════╝ */}
      <div
        className="absolute transition-all duration-700 ease-out hidden xl:block"
        style={{
          top: '52%',
          right: '5%',
          opacity: isMounted ? scrollFade : 0,
          transform: `translate3d(${mouseOffset.x * 16 + scrollDrift * 0.5}px, ${mouseOffset.y * 12 - scrollProgress * 520}px, ${60 + scrollProgress * 40}px) 
                      rotateX(${-10 + mouseOffset.y * 3 - scrollProgress * 8}deg) 
                      rotateY(${-22 + mouseOffset.x * 3}deg) 
                      rotateZ(${3 + scrollProgress * 2}deg)`,
          transition: isMounted ? 'transform 0.1s ease-out, opacity 0.25s ease-out' : 'all 1.8s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div className="relative animate-[floatGentle1_10s_ease-in-out_infinite]">
          {/* Overlapping Pinned Chip */}
          <div className="absolute -top-3.5 -right-3 z-20 px-2 py-0.5 bg-red-600 text-white text-[9px] font-mono uppercase tracking-[0.12em] font-semibold shadow-md">
            EXIT 1
          </div>

          {/* Translucent Dark Slab */}
          <div className="w-[310px] p-5 bg-[#0E1015]/90 backdrop-blur-lg border border-white/15 shadow-[0_30px_60px_rgba(0,0,0,0.85)] text-white">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-serif italic text-2xl tracking-normal text-white/95">Run #412</h4>
              {/* Progress Ring with Fault Break */}
              <svg className="w-6 h-6 text-red-500" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-red-500"
                  strokeDasharray="65, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
            <p className="font-sans text-[12px] text-white/70 mb-2">
              Failed at stage 05 — 3 stages skipped
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between font-mono text-[10px] text-white/50">
              <span>SECURITY_SCAN</span>
              <span className="text-red-400">CVE-2026-8812</span>
            </div>
          </div>
        </div>
      </div>

      {/* ╔══════════════════════════════════════════════════════════╗
          ║ CARD 4 (Bottom-Left): Deploy Card + "PROV_OK" Chip       ║
          ╚══════════════════════════════════════════════════════════╝ */}
      <div
        className="absolute transition-all duration-700 ease-out hidden lg:block"
        style={{
          bottom: '12%',
          left: '6%',
          opacity: isMounted ? scrollFade : 0,
          transform: `translate3d(${mouseOffset.x * -14 - scrollDrift * 0.4}px, ${mouseOffset.y * 14 - scrollProgress * 390}px, ${-20 + scrollProgress * 35}px) 
                      rotateX(${-12 + mouseOffset.y * 3 - scrollProgress * 8}deg) 
                      rotateY(${16 + mouseOffset.x * 3}deg) 
                      rotateZ(${-4 - scrollProgress * 2}deg)`,
          filter: 'blur(0.5px)',
          transition: isMounted ? 'transform 0.1s ease-out, opacity 0.25s ease-out' : 'all 2.0s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div className="relative animate-[floatGentle2_11s_ease-in-out_infinite]">
          {/* Overlapping Pinned Chip */}
          <div className="absolute -top-3 -right-2 z-20 px-2 py-0.5 bg-emerald-500 text-black text-[9px] font-mono uppercase tracking-[0.12em] font-semibold shadow-md">
            PROV_OK
          </div>

          {/* Procedural Grain Surface */}
          <div className="w-[290px] p-4 bg-[#12141C]/95 border border-white/12 shadow-[0_24px_50px_rgba(0,0,0,0.8)] text-white relative overflow-hidden">
            {/* SVG Procedural Noise Texture */}
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <filter id="cardGrain">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#cardGrain)" />
            </svg>

            <div className="relative z-10">
              <div className="font-mono text-[10px] uppercase tracking-wider text-white/50 mb-2">
                Environment Matrix
              </div>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between p-1.5 bg-white/5 border border-white/5">
                  <span className="text-white/90">DEV</span>
                  <span className="text-emerald-400 text-[10px]">HEALTH_PASS</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-transparent border border-white/5 text-white/50">
                  <span>STAGING</span>
                  <span className="text-[10px]">STANDBY</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-transparent border border-white/5 text-white/30">
                  <span>PROD</span>
                  <span className="text-[10px]">LOCKED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ╔══════════════════════════════════════════════════════════╗
          ║ CARD 5 (Bottom-Right): Status Capsule Trio               ║
          ╚══════════════════════════════════════════════════════════╝ */}
      <div
        className="absolute transition-all duration-700 ease-out hidden xl:block"
        style={{
          bottom: '14%',
          right: '10%',
          opacity: isMounted ? scrollFade : 0,
          transform: `translate3d(${mouseOffset.x * 12 + scrollDrift * 0.5}px, ${mouseOffset.y * 12 - scrollProgress * 460}px, ${70 + scrollProgress * 30}px) 
                      rotateX(${-8 + mouseOffset.y * 3 - scrollProgress * 6}deg) 
                      rotateY(${-12 + mouseOffset.x * 3}deg) 
                      rotateZ(${6 + scrollProgress * 2}deg)`,
          transition: isMounted ? 'transform 0.1s ease-out, opacity 0.25s ease-out' : 'all 2.2s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div className="flex flex-col gap-2 animate-[floatGentle3_8.5s_ease-in-out_infinite]">
          {/* Frosted Capsule 1 */}
          <div className="px-3.5 py-1.5 bg-[#0E1015]/85 backdrop-blur-md border border-white/15 rounded-full shadow-lg flex items-center gap-2 self-start">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/90">SUCCESS</span>
          </div>

          {/* Frosted Capsule 2 */}
          <div className="px-4 py-1.5 bg-[#0E1015]/85 backdrop-blur-md border border-white/15 rounded-full shadow-lg flex items-center gap-2 self-center translate-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/70">SKIPPED</span>
          </div>

          {/* Frosted Capsule 3 */}
          <div className="px-3 py-1.5 bg-[#0E1015]/85 backdrop-blur-md border border-white/15 rounded-full shadow-lg flex items-center gap-2 self-end">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/90">FAILED</span>
          </div>
        </div>
      </div>

      {/* ╔══════════════════════════════════════════════════════════╗
          ║ CARD 6 (Bottom Center-Left): Commit Identity Badge       ║
          ╚══════════════════════════════════════════════════════════╝ */}
      <div
        className="absolute transition-all duration-700 ease-out hidden 2xl:block"
        style={{
          bottom: '8%',
          left: '28%',
          opacity: isMounted ? scrollFade : 0,
          transform: `translate3d(${mouseOffset.x * -8}px, ${mouseOffset.y * 8 - scrollProgress * 340}px, ${30 + scrollProgress * 25}px) 
                      rotateX(${-14 + mouseOffset.y * 2 - scrollProgress * 6}deg) 
                      rotateY(${8 + mouseOffset.x * 2}deg) 
                      rotateZ(-2deg)`,
          filter: 'blur(0.8px)',
          transition: isMounted ? 'transform 0.1s ease-out, opacity 0.25s ease-out' : 'all 1.6s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div className="relative animate-[floatGentle1_9s_ease-in-out_infinite]">
          <div className="absolute -top-2.5 -right-2 px-1.5 py-0.5 bg-white text-black text-[8px] font-mono uppercase tracking-[0.12em] font-medium border border-black/40">
            SIMULATED
          </div>
          <div className="px-3.5 py-2.5 bg-[#0E1015]/90 border border-white/10 shadow-xl font-mono text-[10px] text-white/70 flex items-center gap-3">
            <span className="text-white/40">SHA</span>
            <span className="text-white font-semibold">c8f1e09</span>
            <span className="text-white/30">•</span>
            <span>main</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FloatingCards;
