/**
 * @file client/src/components/pipeline/StageNode.jsx
 * @description Individual interactive stage node reflecting the particle sphere's visual DNA:
 * - Stage nodes on a hairline frame with crisp 1px borders (square/2px corners)
 * - Restrained animations: subtle pulse on running, restrained shake on failure, muted opacity on skipped
 * - Mono tabular numerals, uppercase status tags, no orange accents
 */

import React from 'react';
import { CheckCircle2, XCircle, Clock, MinusCircle, Loader2 } from 'lucide-react';
import SourceTag from '../banners/SourceTag.jsx';

export function StageNode({
  stage,
  isSelected = false,
  onSelect,
  isLatestActive = false
}) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle2,
          iconColor: 'text-emerald-500',
          border: 'border-emerald-500/30 bg-emerald-500/[0.03]',
          tag: 'text-emerald-500',
        };
      case 'running':
        return {
          icon: Loader2,
          iconColor: 'text-amber-500 animate-spin',
          border: 'border-amber-500/50 bg-amber-500/[0.04] shadow-[0_0_12px_rgba(245,158,11,0.12)]',
          tag: 'text-amber-500 animate-pulse',
        };
      case 'failed':
        return {
          icon: XCircle,
          iconColor: 'text-red-500',
          border: 'border-red-500/40 bg-red-500/[0.04] animate-[shake_0.4s_ease-in-out]',
          tag: 'text-red-500 font-semibold',
        };
      case 'skipped':
        return {
          icon: MinusCircle,
          iconColor: 'text-zinc-500',
          border: 'border-line bg-surface-subtle/30 opacity-50',
          tag: 'text-zinc-500',
        };
      default:
        return {
          icon: Clock,
          iconColor: 'text-ink-faint',
          border: 'border-line bg-surface-light dark:bg-surface-dark',
          tag: 'text-ink-faint',
        };
    }
  };

  const config = getStatusConfig(stage.status);
  const StatusIcon = config.icon;

  const formattedDuration = stage.duration_ms
    ? `${(stage.duration_ms / 1000).toFixed(2)}s`
    : stage.status === 'running'
    ? 'executing...'
    : '—';

  return (
    <div
      onClick={() => onSelect?.(stage)}
      className={`relative flex flex-col justify-between p-4 border rounded-[2px] transition-all duration-200 cursor-pointer text-left select-none ${
        config.border
      } ${
        isSelected
          ? 'ring-2 ring-ink dark:ring-white border-transparent shadow-md'
          : 'hover:border-ink/40'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(stage);
        }
      }}
      aria-label={`Stage ${stage.order_index}: ${stage.display_name}, status: ${stage.status}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[10px] font-mono font-medium text-ink-muted">
          0{stage.order_index}
        </span>
        <div className="flex items-center gap-1.5">
          <StatusIcon className={`w-3.5 h-3.5 ${config.iconColor}`} aria-hidden="true" />
        </div>
      </div>

      {/* Stage Name */}
      <div className="mb-3">
        <h4 className="text-xs font-sans font-medium text-ink tracking-tight uppercase truncate">
          {stage.display_name}
        </h4>
        <span className={`text-[10px] font-mono uppercase tracking-[0.1em] mt-0.5 block ${config.tag}`}>
          {stage.status}
        </span>
      </div>

      {/* Error Message if Failed */}
      {stage.error_message && (
        <div className="mb-2 p-1.5 bg-red-500/10 border border-red-500/20 text-[10px] text-red-500 line-clamp-2 font-mono">
          {stage.error_message}
        </div>
      )}

      {/* Footer Timing & Source Badge */}
      <div className="flex items-center justify-between pt-2.5 border-t border-line text-[10px] font-mono text-ink-muted">
        <span className="tabular-nums">{formattedDuration}</span>
        <SourceTag source={stage.source || 'simulated'} />
      </div>
    </div>
  );
}

export default StageNode;
