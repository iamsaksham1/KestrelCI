/**
 * @file client/src/app/Layout.jsx
 * @description Master application layout.
 * Hosts:
 * - Slim Announcement bar with WCAG 2.2.2 Pause Motion toggle
 * - Sticky Header with transparent hero mode
 * - Full-bleed stage support on Landing Page, standard layout for app pages
 * - Accessible Skip Links & Command Palette
 * - Multi-column pure black Footer
 * - Non-blocking Functional Cookie Banner
 */

import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AnnouncementBar from '../components/navigation/AnnouncementBar.jsx';
import Header from '../components/navigation/Header.jsx';
import Footer from '../components/navigation/Footer.jsx';
import SkipLinks from '../components/banners/SkipLinks.jsx';
import ScrollProgress from '../components/banners/ScrollProgress.jsx';
import CookieBanner from '../components/banners/CookieBanner.jsx';
import CommandPalette from '../components/search/CommandPalette.jsx';

export function Layout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMotionPaused, setIsMotionPaused] = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleMotion = () => {
    setIsMotionPaused(prev => !prev);
    if (!isMotionPaused) {
      document.documentElement.classList.add('motion-paused');
    } else {
      document.documentElement.classList.remove('motion-paused');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-base-light dark:bg-base-dark text-ink transition-colors duration-200 ${isMotionPaused ? 'motion-paused' : ''}`}>
      {/* Keyboard Accessibility Skip Links */}
      <SkipLinks />

      {/* Top Scroll Progression Indicator */}
      <ScrollProgress />

      {/* Slim Pure-Black Announcement Bar */}
      <AnnouncementBar
        isMotionPaused={isMotionPaused}
        onToggleMotion={toggleMotion}
      />

      {/* Sticky Header with Hero Transparency */}
      <Header onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Main Content Landmark */}
      <main
        id="main-content"
        className={`flex-1 w-full focus:outline-none ${
          isLandingPage
            ? 'p-0 m-0'
            : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'
        }`}
        tabIndex={-1}
      >
        <Outlet context={{ isMotionPaused }} />
      </main>

      {/* Multi-Column Editorial Footer (Always Pure Black) */}
      <Footer />

      {/* Non-Blocking Functional Cookie Notice */}
      <CookieBanner />

      {/* Global Command Palette Overlay */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}

export default Layout;
