/**
 * @file client/src/hooks/useScrollProgress.js
 * @description Tracks window scroll progression percentage (0-100) and threshold state.
 */

import { useState, useEffect } from 'react';

export function useScrollProgress(threshold = 20) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const currentScroll = window.scrollY;

          if (totalHeight > 0) {
            const progress = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
            setScrollProgress(progress);
          } else {
            setScrollProgress(0);
          }

          setIsScrolled(currentScroll > threshold);
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return { scrollProgress, isScrolled };
}

export default useScrollProgress;
