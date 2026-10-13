/**
 * @file client/src/components/ui/Modal.jsx
 * @description Accessible dialog modal component with backdrop, focus trapping,
 * and Escape key listener.
 * Square/2px corners, crisp 1px hairline border, restrained typography.
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import useFocusTrap from '../../hooks/useFocusTrap.js';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  showCloseButton = true
}) {
  const containerRef = useFocusTrap(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-[4px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={containerRef}
        className={`relative w-full ${maxWidth} bg-surface-light dark:bg-surface-dark border border-line rounded-[2px] shadow-2xl p-6 sm:p-8 z-10 animate-slide-up focus:outline-none`}
      >
        <div className="flex items-start justify-between gap-4 pb-4 mb-5 border-b border-line">
          <div>
            <h2 id="modal-title" className="font-sans font-light text-xl text-ink tracking-tight uppercase">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="font-sans font-light text-xs text-ink-muted mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="text-ink-muted hover:text-ink p-1 rounded-[2px] hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
