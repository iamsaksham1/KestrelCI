/**
 * @file client/src/components/navigation/Footer.jsx
 * @description Squarespace Design Intelligence-style multi-column footer:
 * - Always pure black (#000000) stage across both light and dark site themes
 * - Crisp 1px hairline dividers at 12% opacity
 * - Multi-column layout: Platform, Architecture, Documentation, Legal, Contact
 * - System status beacon (ENGINE ONLINE :4000)
 * - Single source-of-truth LAST_UPDATED date and copyright range
 * - Target anchor for "Skip to contact"
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME, LAST_UPDATED, BUILD_VERSION } from '../../content/constants.js';

export function Footer() {
  return (
    <footer
      aria-label="Site Footer"
      className="w-full bg-black text-white border-t border-white/10 select-none transition-colors"
      style={{ backgroundColor: '#000000' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 lg:gap-16">
          {/* Column 1: Brand Wordmark & System Telemetry */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white text-black font-mono font-bold text-xs flex items-center justify-center">
                K
              </div>
              <span className="font-sans font-medium text-xs tracking-[0.14em] uppercase text-white">
                {APP_NAME}
              </span>
            </div>

            <p className="font-sans font-light text-[13px] text-white/60 leading-relaxed max-w-sm">
              An editorial CI/CD orchestration and pipeline simulation platform. Seven sequential delivery stages, deterministic failure injection, and zero remote tracking.
            </p>

            <div className="pt-2 flex flex-col gap-1.5 font-mono text-[10px] text-white/40">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-white/60">SIMULATION ENGINE ONLINE (PORT 4000)</span>
              </div>
              <div>BUILD {BUILD_VERSION} • REVISED {LAST_UPDATED}</div>
            </div>
          </div>

          {/* Column 2: Platform Navigation */}
          <div className="space-y-4">
            <h3 className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-white/40">
              Platform
            </h3>
            <ul className="space-y-2.5 text-xs font-sans tracking-wide">
              <li>
                <Link to="/dashboard" className="text-white/70 hover:text-white transition-colors">
                  Telemetry Dashboard
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-white/70 hover:text-white transition-colors">
                  Project Repositories
                </Link>
              </li>
              <li>
                <Link to="/runs" className="text-white/70 hover:text-white transition-colors">
                  Execution Archive
                </Link>
              </li>
              <li>
                <a href="#contact" className="text-white/70 hover:text-white transition-colors">
                  Direct Inquiries
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Architecture & Engineering */}
          <div className="space-y-4">
            <h3 className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-white/40">
              Architecture
            </h3>
            <ul className="space-y-2.5 text-xs font-sans tracking-wide">
              <li>
                <Link to="/docs#stages" className="text-white/70 hover:text-white transition-colors">
                  7-Stage Sequential Conduit
                </Link>
              </li>
              <li>
                <Link to="/docs#failure" className="text-white/70 hover:text-white transition-colors">
                  Failure Propagation
                </Link>
              </li>
              <li>
                <Link to="/docs#retry" className="text-white/70 hover:text-white transition-colors">
                  Resumption Logic
                </Link>
              </li>
              <li>
                <Link to="/docs#database" className="text-white/70 hover:text-white transition-colors">
                  PostgreSQL Migration
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Documentation & Compliance */}
          <div className="space-y-4">
            <h3 className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-white/40">
              Documentation
            </h3>
            <ul className="space-y-2.5 text-xs font-sans tracking-wide">
              <li>
                <Link to="/docs" className="text-white/70 hover:text-white transition-colors">
                  Full System Docs
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-white/70 hover:text-white transition-colors">
                  Questions & Answers
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-white/70 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a
                  href="/api/v1/health"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/70 hover:text-white transition-colors font-mono text-[11px]"
                >
                  GET /api/v1/health
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright Range & Legal Hairline */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-sans text-white/40">
          <div>
            &copy; 2026 {APP_NAME}. Every stage simulated. Engineered with absolute transparency.
          </div>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Notice
            </Link>
            <span className="text-white/20">•</span>
            <Link to="/docs" className="hover:text-white transition-colors">
              Architecture Spec
            </Link>
            <span className="text-white/20">•</span>
            <Link to="/faq" className="hover:text-white transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
