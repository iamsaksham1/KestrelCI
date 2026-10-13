/**
 * @file client/src/components/ui/ConfirmModal.jsx
 * @description Accessible confirmation modal for destructive or critical actions.
 * Prevents unintended cancellations, deletions, or history clearing.
 * Square corners, hairline borders, no browser confirm().
 */

import React from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import { AlertTriangle } from 'lucide-react';

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  loading = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex gap-4 items-start mb-6">
        {isDestructive && (
          <div className="p-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-[2px] shrink-0">
            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          </div>
        )}
        <div className="font-sans font-light text-xs sm:text-sm text-ink-muted leading-relaxed">
          {message}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-line">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={isDestructive ? 'destructive' : 'primary'}
          size="sm"
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmModal;
