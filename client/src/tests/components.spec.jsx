/**
 * @file client/src/tests/components.spec.jsx
 * @description Frontend component unit tests verifying accessible disclosures,
 * modal dialogs, and copy feedback.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FaqAccordion from '../components/ui/FaqAccordion.jsx';
import Modal from '../components/ui/Modal.jsx';
import Badge from '../components/ui/Badge.jsx';
import CopyButton from '../components/ui/CopyButton.jsx';

describe('Frontend UI Components', () => {
  // 1. FAQ Accordion Accessible Disclosure
  describe('FaqAccordion', () => {
    it('toggles disclosure using button and aria-expanded', () => {
      const mockItems = [
        { id: 'test-1', question: 'What is simulated?', answer: 'All stages are simulated.' }
      ];

      render(<FaqAccordion items={mockItems} />);

      const button = screen.getByRole('button', { name: /What is simulated/i });
      expect(button).toBeInTheDocument();

      // First item open by default
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('All stages are simulated.')).toBeInTheDocument();

      // Click to toggle close
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');

      // Click to toggle open
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  // 2. Modal Accessible Focus Trap & Escape Key
  describe('Modal', () => {
    it('renders with role="dialog" and dismisses on Escape key', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal Dialog">
          <div>Modal Body Content</div>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText('Test Modal Dialog')).toBeInTheDocument();

      // Press Escape key
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(handleClose).toHaveBeenCalled();
    });
  });

  // 3. Status Badge
  describe('Badge', () => {
    it('renders semantic status badge', () => {
      render(<Badge variant="success">Completed</Badge>);
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  // 4. CopyButton Feedback
  describe('CopyButton', () => {
    it('renders copy button and triggers clipboard copy on click', async () => {
      render(<CopyButton text="kestrel-copy-test" />);
      const btn = screen.getByRole('button', { name: /copy to clipboard/i });
      expect(btn).toBeInTheDocument();

      fireEvent.click(btn);
      // Feedback change
      expect(await screen.findByText(/copied!/i)).toBeInTheDocument();
    });
  });
});
