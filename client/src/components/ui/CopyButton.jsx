/**
 * @file client/src/components/ui/CopyButton.jsx
 * @description Accessible clipboard copy button with transient feedback toast and keyboard support.
 * Square corners, hairline border, no orange focus rings.
 */

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyButton({
  text,
  textToCopy,
  label = 'Copy to clipboard',
  copiedLabel = 'Copied!',
  className = '',
  size = 'sm'
}) {
  const [copied, setCopied] = useState(false);
  const copyTarget = text !== undefined ? text : textToCopy;

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(copyTarget || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = copyTarget || '';
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? copiedLabel : label}
      title={copied ? copiedLabel : label}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono font-medium rounded-[2px] transition-colors duration-150 border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
        copied
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          : 'bg-transparent text-white/60 hover:text-white hover:bg-white/5 border-white/15'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-emerald-400" aria-hidden="true" />
          <span className="text-emerald-400">{copiedLabel}</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 text-white/50" aria-hidden="true" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

export default CopyButton;
