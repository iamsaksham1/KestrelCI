/**
 * @file client/src/components/ui/FaqAccordion.jsx
 * @description Accessible disclosure accordion for frequently asked questions.
 * Implements Squarespace Design Intelligence styling:
 * - Large light-weight typography (font-light 20px–24px)
 * - 1px hairline dividers at 10-12% opacity
 * - Minimalist rotating `+` glyph that transitions to `×` on open
 * - Accessible button + aria-expanded and keyboard operability
 */

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import FAQ_ITEMS from '../../content/faqData.js';

export function FaqAccordion({ items = FAQ_ITEMS }) {
  const [openItems, setOpenItems] = useState(new Set([items[0]?.id || '']));

  const toggleItem = (id) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="divide-y divide-line border-y border-line w-full select-none">
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        const contentId = `faq-content-${item.id}`;
        const buttonId = `faq-btn-${item.id}`;

        return (
          <div key={item.id} className="py-6 sm:py-8 group">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-start justify-between text-left gap-6 font-sans font-light text-xl sm:text-2xl text-ink transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
              >
                <span className="leading-snug">{item.question}</span>
                <span
                  className={`shrink-0 mt-1 transition-transform duration-300 ${
                    isOpen ? 'rotate-45 text-ink' : 'text-ink-muted'
                  }`}
                  aria-hidden="true"
                >
                  <Plus className="w-5 h-5 stroke-[1.5]" />
                </span>
              </button>
            </h3>

            <div
              id={contentId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid transition-all duration-300 ease-editorial ${
                isOpen ? 'grid-rows-[1fr] opacity-100 pt-4 pb-2' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <p className="font-sans font-light text-sm sm:text-base text-ink-muted leading-relaxed max-w-3xl">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FaqAccordion;
