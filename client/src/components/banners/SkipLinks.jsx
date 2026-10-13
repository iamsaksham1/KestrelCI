/**
 * @file client/src/components/banners/SkipLinks.jsx
 * @description Accessible skip navigation links for keyboard users.
 * First focusable items jumping directly to main content and the contact section.
 */

import React from 'react';

export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="fixed top-2 left-2 z-50 bg-[#000000] text-white px-4 py-2 border border-white/20 rounded-[2px] shadow-2xl text-xs font-mono uppercase tracking-wider focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
      >
        Skip to main content →
      </a>
      <a
        href="#contact-section"
        className="fixed top-2 left-48 z-50 bg-[#000000] text-white px-4 py-2 border border-white/20 rounded-[2px] shadow-2xl text-xs font-mono uppercase tracking-wider focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
      >
        Skip to contact →
      </a>
    </div>
  );
}

export default SkipLinks;
