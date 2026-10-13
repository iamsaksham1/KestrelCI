/**
 * @file client/src/components/search/CommandPalette.jsx
 * @description Accessible command-palette overlay triggered via Cmd+K / Ctrl+K.
 * Features full keyboard navigation (arrows, Enter, Esc), grouped results,
 * recent query memory, square corners, hairline borders, and monochrome selection.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, FolderGit2, PlayCircle, HelpCircle, ArrowRight, Clock, X } from 'lucide-react';
import api from '../../services/api.js';
import useFocusTrap from '../../hooks/useFocusTrap.js';

const STATIC_PAGES = [
  { id: 'page-dashboard', title: 'Dashboard', subtitle: 'Pipeline metrics, rates, and recent activity', path: '/dashboard', category: 'Pages' },
  { id: 'page-projects', title: 'Projects', subtitle: 'Browse all repositories and pipeline definitions', path: '/projects', category: 'Pages' },
  { id: 'page-runs', title: 'Run History', subtitle: 'Filterable log and execution archive', path: '/runs', category: 'Pages' },
  { id: 'page-docs', title: 'Documentation', subtitle: 'Architecture, state machine, and extension guides', path: '/docs', category: 'Pages' },
  { id: 'page-faq', title: 'FAQ', subtitle: 'Answers regarding simulation, storage, and failures', path: '/faq', category: 'Pages' },
  { id: 'page-privacy', title: 'Privacy Policy', subtitle: 'Zero-tracking and data retention disclosures', path: '/privacy', category: 'Pages' }
];

export function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ projects: [], runs: [], docs: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const stored = localStorage.getItem('kestrel-recent-searches');
      return stored ? JSON.parse(stored) : ['kestrel', 'security', 'deploy'];
    } catch {
      return ['kestrel'];
    }
  });

  const navigate = useNavigate();
  const containerRef = useFocusTrap(isOpen, onClose);
  const inputRef = useRef(null);

  // Focus input automatically upon open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Query API with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults({ projects: [], runs: [], docs: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.search(query.trim());
        setResults(res.results || { projects: [], runs: [], docs: [] });
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Combine static page matches with API results
  const matchingPages = STATIC_PAGES.filter(p =>
    !query.trim() ||
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const flatList = [
    ...matchingPages.map(item => ({ ...item, icon: FileText })),
    ...(results.projects || []).map(item => ({ ...item, icon: FolderGit2 })),
    ...(results.runs || []).map(item => ({ ...item, icon: PlayCircle })),
    ...(results.docs || []).map(item => ({ ...item, icon: HelpCircle }))
  ];

  const handleSelect = (item) => {
    if (!item) return;

    if (query.trim()) {
      const updated = [query.trim(), ...recentSearches.filter(s => s !== query.trim())].slice(0, 5);
      setRecentSearches(updated);
      try {
        localStorage.setItem('kestrel-recent-searches', JSON.stringify(updated));
      } catch {}
    }

    onClose();
    navigate(item.path);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (flatList.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + flatList.length) % (flatList.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatList[selectedIndex]) {
        handleSelect(flatList[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto animate-fade-in select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Global Search and Navigation"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-[4px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-2xl bg-surface-light dark:bg-surface-dark border border-line rounded-[2px] shadow-2xl overflow-hidden z-10 animate-slide-up focus:outline-none"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
          <Search className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search projects, runs, docs, FAQ..."
            className="w-full bg-transparent text-ink placeholder-ink-faint text-sm focus:outline-none font-sans"
            aria-autocomplete="list"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-ink-muted hover:text-ink rounded-[2px]"
              aria-label="Clear search input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-surface-subtle border border-line rounded-[2px] text-ink-faint">
              ESC
            </kbd>
          )}
        </div>

        {/* Quick Recent Searches if Query is empty */}
        {!query && recentSearches.length > 0 && (
          <div className="px-5 py-2.5 bg-surface-subtle/50 border-b border-line flex items-center gap-2 overflow-x-auto text-[11px] text-ink-muted">
            <span className="flex items-center gap-1 shrink-0 font-medium text-ink-faint uppercase font-mono text-[10px]">
              <Clock className="w-3 h-3" /> Recent:
            </span>
            {recentSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="px-2 py-0.5 bg-surface-light dark:bg-surface-dark border border-line hover:border-ink rounded-[2px] text-ink font-mono text-[10px] transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-line/30">
          {flatList.length === 0 && !loading && (
            <div className="py-12 text-center text-xs text-ink-muted font-sans font-light">
              No matching projects, runs, or documentation entries found for "{query}".
            </div>
          )}

          {flatList.map((item, idx) => {
            const Icon = item.icon || FileText;
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={`${item.category}-${item.id}`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between p-3 rounded-[2px] cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-ink/5 dark:bg-white/10 text-ink font-medium'
                    : 'text-ink hover:bg-surface-subtle'
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-[2px] shrink-0 border ${
                    isSelected ? 'bg-ink text-white dark:bg-white dark:text-black border-transparent' : 'bg-surface-subtle text-ink-muted border-line'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate text-xs font-sans uppercase tracking-wider">{item.title}</span>
                      <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded-[2px] bg-surface-subtle text-ink-faint border border-line">
                        {item.category}
                      </span>
                    </div>
                    {item.subtitle && (
                      <p className="text-[11px] text-ink-muted truncate mt-0.5 font-sans font-light">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <ArrowRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected ? 'translate-x-1 text-ink' : 'text-ink-faint'}`} />
              </div>
            );
          })}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-5 py-2.5 bg-surface-subtle border-t border-line text-[10px] font-mono text-ink-faint flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div>KestrelCI Engine Search</div>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
