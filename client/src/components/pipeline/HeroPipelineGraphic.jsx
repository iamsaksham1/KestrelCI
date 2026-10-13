/**
 * @file client/src/components/pipeline/HeroPipelineGraphic.jsx
 * @description Original, hand-crafted SVG pipeline architecture visualization.
 * Avoids cliché AI purple/blue gradients or glowing blobs. Uses crisp technical lines,
 * stage nodes, animated flow lines, and real pipeline metrics.
 */

import React, { useState, useEffect } from 'react';
import SimulatedBadge from '../banners/SimulatedBadge.jsx';

export function HeroPipelineGraphic() {
  const [activeStep, setActiveStep] = useState(2);

  // Cycle step subtly to demonstrate live stage motion
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(prev => (prev >= 6 ? 0 : prev + 1));
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const stages = [
    { label: 'CHECKOUT', code: '01', status: 'pass' },
    { label: 'COMPILE', code: '02', status: 'pass' },
    { label: 'UNIT TEST', code: '03', status: activeStep === 2 ? 'active' : activeStep > 2 ? 'pass' : 'idle' },
    { label: 'LINT / QA', code: '04', status: activeStep === 3 ? 'active' : activeStep > 3 ? 'pass' : 'idle' },
    { label: 'SECURITY', code: '05', status: activeStep === 4 ? 'active' : activeStep > 4 ? 'pass' : 'idle' },
    { label: 'DOCKER', code: '06', status: activeStep === 5 ? 'active' : activeStep > 5 ? 'pass' : 'idle' },
    { label: 'DEPLOY', code: '07', status: activeStep === 6 ? 'active' : 'idle' },
  ];

  return (
    <div className="w-full relative border border-line rounded-[2px] bg-surface-light dark:bg-surface-dark p-6 sm:p-8 shadow-sm overflow-hidden font-mono text-xs">
      {/* Top Header Information Bar */}
      <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-ink text-sm tracking-tight">KESTREL ENGINE / RUN #412</span>
          </div>
          <span className="text-ink-faint">|</span>
          <span className="text-ink-muted">commit 9f8b4c2 (main)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-ink-faint hidden sm:inline">CYCLE 1,420ms</span>
          <SimulatedBadge />
        </div>
      </div>

      {/* Pipeline SVG Graphic with Flowing Stream Line */}
      <div className="relative py-4">
        {/* Responsive Nodes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 relative z-10">
          {stages.map((st, i) => {
            const isActive = st.status === 'active';
            const isPass = st.status === 'pass';

            return (
              <div
                key={st.code}
                className={`flex flex-col justify-between p-3 rounded-lg border transition-all duration-300 ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-sm scale-102 ring-1 ring-amber-500/30'
                    : isPass
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : 'bg-surface-subtle/50 border-line/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-ink-faint">{st.code}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive
                        ? 'bg-amber-500 animate-ping'
                        : isPass
                        ? 'bg-emerald-500'
                        : 'bg-stone-300 dark:bg-stone-700'
                    }`}
                  />
                </div>
                <div className="font-semibold text-ink text-[11px] tracking-tight mb-2 truncate">
                  {st.label}
                </div>
                <div className="text-[10px] text-ink-muted uppercase">
                  {isActive ? 'RUNNING' : isPass ? 'PASSED' : 'STANDBY'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Technical Terminal Output Preview */}
        <div className="mt-6 p-3.5 bg-[#0D0E11] text-[#E0E2EC] rounded-lg border border-[#252833] space-y-1 text-[11px]">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] pb-1 border-b border-zinc-800">
            <span>LIVE STAGE DIAGNOSTIC STREAM</span>
            <span>WORKER: runner-us-east-4</span>
          </div>
          <div className="pt-1.5 flex items-center gap-2">
            <span className="text-emerald-400">[simulated]</span>
            <span className="text-zinc-400">unit_tests:</span>
            <span className="text-zinc-200">Executing test runner: 42 test suites, 189 assertions passed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">[simulated]</span>
            <span className="text-zinc-400">code_quality:</span>
            <span className="text-zinc-200">AST parser evaluated 78 modules. 0 errors, 1 maintainability notice.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroPipelineGraphic;
