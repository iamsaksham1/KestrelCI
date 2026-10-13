/**
 * @file client/src/components/navigation/Header.jsx
 * @description Squarespace Design Intelligence-style navigation header:
 * - Transparent over dark hero stage, transitioning cleanly on scroll
 * - All-caps tracked wordmark and logo mark
 * - Small uppercase, tracked navigation links with dropdown panels
 * - Solid white rectangular CTA button with black uppercase text and square corners
 * - Accessible Cmd+K search trigger, theme toggle, and mobile drawer
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Search, Menu, X, ChevronDown } from 'lucide-react';
import useTheme from '../../hooks/useTheme.js';
import useScrollProgress from '../../hooks/useScrollProgress.js';

export function Header({ onOpenSearch }) {
  const { toggleTheme, isDark } = useTheme();
  const { isScrolled, scrollProgress } = useScrollProgress(30);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  // Over the hero (first 100vh on landing page), header is transparent over black stage
  const isOverHero = isLandingPage && scrollProgress < 0.12;

  const megaMenus = {
    platform: [
      { label: 'Pipeline Dashboard', path: '/dashboard', desc: 'Real-time telemetry and monotonic run statistics' },
      { label: 'Project Repositories', path: '/projects', desc: 'Managed code projects and configured delivery pipelines' },
      { label: 'Run History', path: '/runs', desc: 'Filterable execution archive and failure logs' },
    ],
    docs: [
      { label: 'Architecture & Engine', path: '/docs#architecture', desc: '7-stage background execution loop and failure propagation' },
      { label: 'API Reference v1', path: '/docs#api', desc: 'OpenAPI 3.0 specification and REST endpoints' },
      { label: 'Extensibility Guide', path: '/docs#extending', desc: 'Registering custom stage executors and adapters' },
    ],
    architecture: [
      { label: 'Failure Propagation', path: '/docs#failure', desc: 'Downstream skipping and error capturing' },
      { label: 'Smart Resumption', path: '/docs#retry', desc: 'Retry mechanism resuming from the failed stage' },
      { label: 'Database Isolation', path: '/docs#database', desc: 'Repository pattern and PostgreSQL migration path' },
    ]
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 select-none ${
        isOverHero
          ? 'bg-black/60 backdrop-blur-md border-b border-white/10 text-white'
          : isScrolled
          ? 'bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-line shadow-sm text-ink py-2.5'
          : 'bg-transparent border-b border-line/60 text-ink py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand Mark & All-Caps Tracked Wordmark */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded-[2px]"
          >
            {/* Minimalist Geometric Monomark */}
            <div className={`w-7 h-7 flex items-center justify-center font-mono font-bold text-xs border ${
              isOverHero || isDark
                ? 'bg-white text-black border-white'
                : 'bg-black text-white border-black'
            }`}>
              K
            </div>
            <span className="font-sans font-medium text-xs tracking-[0.14em] uppercase">
              KESTREL CI
            </span>
          </Link>
        </div>

        {/* Center: Small Uppercase Tracked Navigation */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Main Navigation">
          {/* Platform Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveMenu('platform')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button
              type="button"
              className={`inline-flex items-center gap-1 text-[11px] font-sans uppercase tracking-[0.1em] font-medium transition-colors ${
                isOverHero ? 'text-white/80 hover:text-white' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <span>Platform</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {activeMenu === 'platform' && (
              <div className="absolute top-full -left-4 w-72 pt-2 animate-fade-in z-50">
                <div className="bg-[#0E1015] border border-white/15 p-2 shadow-2xl text-white">
                  {megaMenus.platform.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setActiveMenu(null)}
                      className="block p-2.5 hover:bg-white/10 transition-colors"
                    >
                      <div className="text-[11px] font-sans uppercase tracking-wider font-semibold text-white">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-white/50 leading-tight mt-0.5 font-sans">
                        {item.desc}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Docs Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveMenu('docs')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button
              type="button"
              className={`inline-flex items-center gap-1 text-[11px] font-sans uppercase tracking-[0.1em] font-medium transition-colors ${
                isOverHero ? 'text-white/80 hover:text-white' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <span>Documentation</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {activeMenu === 'docs' && (
              <div className="absolute top-full -left-4 w-80 pt-2 animate-fade-in z-50">
                <div className="bg-[#0E1015] border border-white/15 p-2 shadow-2xl text-white">
                  {megaMenus.docs.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setActiveMenu(null)}
                      className="block p-2.5 hover:bg-white/10 transition-colors"
                    >
                      <div className="text-[11px] font-sans uppercase tracking-wider font-semibold text-white">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-white/50 leading-tight mt-0.5 font-sans">
                        {item.desc}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Architecture Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveMenu('architecture')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button
              type="button"
              className={`inline-flex items-center gap-1 text-[11px] font-sans uppercase tracking-[0.1em] font-medium transition-colors ${
                isOverHero ? 'text-white/80 hover:text-white' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <span>Architecture</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {activeMenu === 'architecture' && (
              <div className="absolute top-full -left-4 w-80 pt-2 animate-fade-in z-50">
                <div className="bg-[#0E1015] border border-white/15 p-2 shadow-2xl text-white">
                  {megaMenus.architecture.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setActiveMenu(null)}
                      className="block p-2.5 hover:bg-white/10 transition-colors"
                    >
                      <div className="text-[11px] font-sans uppercase tracking-wider font-semibold text-white">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-white/50 leading-tight mt-0.5 font-sans">
                        {item.desc}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Direct FAQ Link */}
          <Link
            to="/faq"
            className={`text-[11px] font-sans uppercase tracking-[0.1em] font-medium transition-colors ${
              isOverHero ? 'text-white/80 hover:text-white' : 'text-ink-muted hover:text-ink'
            }`}
          >
            FAQ
          </Link>
        </nav>

        {/* Right: Search, Theme Toggle, White Rectangular CTA */}
        <div className="flex items-center gap-3">
          {/* Command Palette Trigger */}
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Open search dialog (Cmd+K)"
            className={`inline-flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-mono border transition-colors ${
              isOverHero
                ? 'bg-white/5 hover:bg-white/10 border-white/15 text-white/70'
                : 'bg-surface-subtle hover:bg-line border-line text-ink-muted'
            }`}
          >
            <Search className="w-3 h-3" aria-hidden="true" />
            <span className="hidden sm:inline uppercase tracking-wider text-[10px]">Search</span>
            <kbd className={`px-1 py-0.2 text-[9px] font-mono border ${
              isOverHero ? 'bg-black/60 border-white/20 text-white/60' : 'bg-surface-light border-line text-ink-faint'
            }`}>
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle (Hero always dark, site switches) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className={`p-1.5 border transition-colors ${
              isOverHero
                ? 'bg-white/5 hover:bg-white/10 border-white/15 text-white/80'
                : 'bg-surface-subtle hover:bg-line border-line text-ink-muted'
            }`}
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-800" aria-hidden="true" />
            )}
          </button>

          {/* Solid White Rectangular CTA Button (Black Text, Square Corners) */}
          <Link
            to="/projects"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-[#E5E5E2] font-sans uppercase tracking-[0.1em] text-[11px] font-semibold transition-all border border-white active:translate-y-[1px]"
          >
            <span>LAUNCH RUN</span>
            <span aria-hidden="true">→</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className={`lg:hidden p-1.5 border ${
              isOverHero
                ? 'bg-white/5 border-white/15 text-white'
                : 'bg-surface-subtle border-line text-ink'
            }`}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/15 bg-[#0E1015] px-6 py-6 space-y-4 text-white animate-fade-in">
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-1">Navigation</div>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-sm uppercase tracking-wider text-white/80 hover:text-white">
              Dashboard
            </Link>
            <Link to="/projects" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-sm uppercase tracking-wider text-white/80 hover:text-white">
              Projects
            </Link>
            <Link to="/runs" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-sm uppercase tracking-wider text-white/80 hover:text-white">
              Run History
            </Link>
            <Link to="/docs" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-sm uppercase tracking-wider text-white/80 hover:text-white">
              Documentation
            </Link>
            <Link to="/faq" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-sm uppercase tracking-wider text-white/80 hover:text-white">
              FAQ
            </Link>
          </div>
          <div className="pt-4 border-t border-white/10">
            <Link
              to="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex justify-center items-center py-3 bg-white text-black font-sans uppercase tracking-[0.1em] text-xs font-semibold"
            >
              LAUNCH RUN →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
