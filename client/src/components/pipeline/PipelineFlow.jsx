/**
 * @file client/src/components/pipeline/PipelineFlow.jsx
 * @description Connected seven-stage pipeline flow visualization.
 * Incorporates:
 * - Dynamic hairline connector line drawing across the top as stages complete
 * - Clean 1px hairline container, square corners, dense legible spacing
 * - Click-to-filter interaction linking directly to the log stream
 */

import React from 'react';
import StageNode from './StageNode.jsx';

export function PipelineFlow({
  stages = [],
  selectedStageId,
  onSelectStage
}) {
  if (!stages || stages.length === 0) return null;

  const completedStages = stages.filter(s => s.status === 'success').length;
  const runningIndex = stages.findIndex(s => s.status === 'running');
  const hasFailure = stages.some(s => s.status === 'failed');
  const totalStages = stages.length;

  // Percentage for drawing connector line
  const connectorFillPercent = runningIndex !== -1
    ? ((runningIndex + 0.5) / totalStages) * 100
    : (completedStages / totalStages) * 100;

  return (
    <div className="w-full bg-surface-light dark:bg-surface-dark border border-line rounded-[2px] p-6 select-none">
      {/* Flow Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-4 mb-6 border-b border-line gap-2">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted block mb-1">
            CONDUIT TOPOLOGY
          </span>
          <h3 className="font-sans font-light text-xl text-ink tracking-tight">
            Sequential Pipeline Stages
          </h3>
        </div>
        <div className="font-mono text-[11px] text-ink-muted tabular-nums">
          STATUS: {completedStages}/{totalStages} STAGES SEALED
        </div>
      </div>

      {/* Progressive Hairline Connector Line */}
      <div className="relative w-full h-[1px] bg-line mb-6 hidden lg:block overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${
            hasFailure ? 'bg-red-500' : 'bg-ink dark:bg-white'
          }`}
          style={{ width: `${connectorFillPercent}%` }}
        />
      </div>

      {/* Grid Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {stages.map((stage) => (
          <StageNode
            key={stage.id}
            stage={stage}
            isSelected={selectedStageId === stage.id || selectedStageId === stage.stage_name}
            onSelect={onSelectStage}
          />
        ))}
      </div>
    </div>
  );
}

export default PipelineFlow;
