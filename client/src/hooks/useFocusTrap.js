/**
 * @file client/src/hooks/useFocusTrap.js
 * @description Accessible focus trap hook for dialogs and command palette modals.
 * Traps Tab and Shift+Tab within the container, dismisses on Escape, and returns focus on close.
 */

import { useEffect, useRef } from 'react';

export function useFocusTrap(isOpen, onClose) {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Remember the previously active element to return focus upon modal dismiss
    previousFocusRef.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    // Find all focusable elements inside the modal
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];

    const focusableElements = container.querySelectorAll(focusableSelectors.join(','));
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      if (e.key === 'Tab') {
        const elements = container.querySelectorAll(focusableSelectors.join(','));
        if (elements.length === 0) return;

        const firstElement = elements[0];
        const lastElement = elements[elements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Return focus to trigger element
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  return containerRef;
}

export default useFocusTrap;
