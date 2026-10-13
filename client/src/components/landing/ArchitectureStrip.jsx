/**
 * @file client/src/components/landing/ArchitectureStrip.jsx
 * @description "Everything In One Place" architectural schematic.
 * Crisp hairline diagram visualizing separation of concerns:
 * Client SPA -> Express API v1 -> Simulation Engine -> Isolated SQLite Repositories.
 */

import React from 'react';

export function ArchitectureStrip() {
  const nodes = [
    {
      step: '01',
      title: 'React Client SPA',
      desc: 'Never decides truth. Polls GET /runs/:id every 1s and renders API telemetry.',
      tech: 'Vite • React 18 • CSS Tokens',
    },
    {
      step: '02',
      title: 'Express REST API',
      desc: 'Versioned under /api/v1. Returns 202 Accepted immediately. X-API-Key auth.',
      tech: 'Express • Zod • Helmet',
    },
    {
      step: '03',
      title: 'Simulation Engine',
      desc: '7 decoupled StageExecutors. Failure propagation, cancellation, and smart retry.',
      tech: 'Background Event Loop',
    },
    {
      step: '04',
      title: 'Isolated SQLite Layer',
      desc: 'Strict repository pattern. Zero SQL outside database/. Ready for PostgreSQL.',
      tech: 'better-sqlite3 • Migrations',
    },
  ];

  return (
    <div className="w-full bg-[#0E1015] border border-white/12 p-8 sm:p-12 text-white select-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-white/10 gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 block mb-1">
            System Topology
          </span>
          <h3 className="font-sans font-light text-2xl tracking-tight text-white">
            Everything In One Place, Strictly Decoupled.
          </h3>
        </div>
        <div className="font-mono text-[11px] text-white/50 bg-white/5 px-3 py-1 border border-white/10">
          NON-BLOCKING ASYNC ARCHITECTURE
        </div>
      </div>

      {/* 4 Nodes with Hairline Connectors */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
        {nodes.map((node, i) => (
          <div key={node.step} className="relative p-5 bg-white/[0.02] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-white/40">{node.step}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
              </div>
              <h4 className="font-sans font-medium text-sm tracking-wide text-white uppercase mb-2">
                {node.title}
              </h4>
              <p className="font-sans font-light text-xs text-white/60 leading-relaxed">
                {node.desc}
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 font-mono text-[10px] text-white/40">
              {node.tech}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ArchitectureStrip;
