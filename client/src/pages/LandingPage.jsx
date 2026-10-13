/**
 * @file client/src/pages/LandingPage.jsx
 * @description Squarespace Design Intelligence-inspired landing page:
 * 1. Cinematic 100vh pure-black hero stage with Three.js particle sphere and 6 3D tilted floating cards
 * 2. Large light-weight statement section with text link CTA
 * 3. Five asymmetric feature blocks pairing live, working interactive components in tilted frames with editorial copy
 * 4. "Everything In One Place" decoupled architecture schematic strip
 * 5. Large-type expandable FAQ disclosure
 * 6. Permanent pure-black Closing CTA band
 * 7. Anchored contact section for "Skip to contact"
 */

import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import CinematicHero from '../components/hero/CinematicHero.jsx';
import {
  LiveMiniPipeline,
  LiveLogStream,
  LiveTelemetryMetrics,
  LiveExecutionArchive,
  LiveFaultInjection,
} from '../components/landing/LiveFeatureComponents.jsx';
import ArchitectureStrip from '../components/landing/ArchitectureStrip.jsx';
import ClosingCtaBand from '../components/landing/ClosingCtaBand.jsx';
import FaqAccordion from '../components/ui/FaqAccordion.jsx';
import ContactForm from '../components/forms/ContactForm.jsx';

export function LandingPage() {
  const { isMotionPaused } = useOutletContext() || {};

  return (
    <div className="w-full flex flex-col">
      {/* ╔══════════════════════════════════════════════════════════╗
          ║ SECTION 1: 100vh Full-Bleed Cinematic Hero Stage         ║
          ╚══════════════════════════════════════════════════════════╝ */}
      <CinematicHero isMotionPaused={isMotionPaused} />

      {/* ╔══════════════════════════════════════════════════════════╗
          ║ SECTION 2: Statement Section ("Resilience by Design")    ║
          ╚══════════════════════════════════════════════════════════╝ */}
      <section
        aria-label="Core Philosophy"
        className="w-full py-28 sm:py-36 px-6 sm:px-12 max-w-6xl mx-auto border-b border-line"
      >
        <div className="space-y-6 max-w-4xl">
          <span className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted block">
            01 / RESILIENCE BY DESIGN
          </span>

          <h2 className="font-sans font-light text-3xl sm:text-4xl lg:text-[46px] leading-[1.12] tracking-tight text-ink">
            Software delivery fails at the edges. True confidence comes from knowing exactly how your deployment pipeline behaves when stage five collapses.
          </h2>

          <div className="pt-4">
            <Link
              to="/docs"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] font-medium text-ink hover:text-ink/70 draw-underline py-1"
            >
              <span>EXPLORE RUN ARCHITECTURE</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════════════╗
          ║ SECTION 3: Five Asymmetric Live Feature Blocks           ║
          ╚══════════════════════════════════════════════════════════╝ */}
      <section
        aria-label="Platform Capabilities"
        className="w-full py-24 sm:py-32 px-6 sm:px-12 max-w-7xl mx-auto space-y-28 lg:space-y-36"
      >
        {/* Header Label */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-line pb-6 gap-2">
          <span className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
            02 / TELEMETRY & CONTROL
          </span>
          <span className="font-mono text-[10px] text-ink-muted">
            LIVE INTERACTIVE SPECIMENS
          </span>
        </div>

        {/* Feature 1: The 7-Stage Conduit (Alternating Left) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
              CONDUIT 01 / STAGES
            </span>
            <h3 className="font-sans font-light text-2xl sm:text-3xl text-ink tracking-tight">
              Seven Sequential Delivery Stages.
            </h3>
            <p className="font-sans font-light text-sm sm:text-base text-ink-muted leading-relaxed">
              From source checkout to dev deployment, every stage generates realistic timing variance, pass criteria, and simulated diagnostic logs.
            </p>
            <div className="pt-2">
              <Link to="/projects" className="text-xs uppercase tracking-wider font-medium text-ink draw-underline">
                TRIGGER SIMULATION →
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7 transform hover:rotate-0 transition-transform duration-500">
            <LiveMiniPipeline />
          </div>
        </div>

        {/* Feature 2: Diagnostic Telemetry Logs (Alternating Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <LiveLogStream />
          </div>
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
              TELEMETRY 02 / STREAM
            </span>
            <h3 className="font-sans font-light text-2xl sm:text-3xl text-ink tracking-tight">
              Structured Diagnostic Output.
            </h3>
            <p className="font-sans font-light text-sm sm:text-base text-ink-muted leading-relaxed">
              Every log line is timestamped to the millisecond with severity flags, test counts, lint grades, and CVE security findings. One-click copy for fast audits.
            </p>
            <div className="pt-2">
              <Link to="/runs" className="text-xs uppercase tracking-wider font-medium text-ink draw-underline">
                BROWSE ARCHIVED LOGS →
              </Link>
            </div>
          </div>
        </div>

        {/* Feature 3: Velocity & Observability Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
              METRICS 03 / VELOCITY
            </span>
            <h3 className="font-sans font-light text-2xl sm:text-3xl text-ink tracking-tight">
              Observability Across Monotonic Runs.
            </h3>
            <p className="font-sans font-light text-sm sm:text-base text-ink-muted leading-relaxed">
              Track pass/fail distribution, duration histograms, and stage flakiness. All stats are aggregated directly from the repository layer with sub-millisecond queries.
            </p>
            <div className="pt-2">
              <Link to="/dashboard" className="text-xs uppercase tracking-wider font-medium text-ink draw-underline">
                OPEN TELEMETRY DASHBOARD →
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7">
            <LiveTelemetryMetrics />
          </div>
        </div>

        {/* Feature 4: Immutable Run Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <LiveExecutionArchive />
          </div>
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
              ARCHIVE 04 / PERSISTENCE
            </span>
            <h3 className="font-sans font-light text-2xl sm:text-3xl text-ink tracking-tight">
              Immutable Execution History.
            </h3>
            <p className="font-sans font-light text-sm sm:text-base text-ink-muted leading-relaxed">
              Every pipeline dispatch creates seven pending database records immediately. Refreshing the browser loses nothing. Filter by branch, status, or date range.
            </p>
            <div className="pt-2">
              <Link to="/runs" className="text-xs uppercase tracking-wider font-medium text-ink draw-underline">
                VIEW PERSISTED RUNS →
              </Link>
            </div>
          </div>
        </div>

        {/* Feature 5: Controlled Fault Injection & Smart Resumption */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
              FAULT INJECTION 05 / RECOVERY
            </span>
            <h3 className="font-sans font-light text-2xl sm:text-3xl text-ink tracking-tight">
              Deterministic Faults. Smart Resumption.
            </h3>
            <p className="font-sans font-light text-sm sm:text-base text-ink-muted leading-relaxed">
              Inject failure at any stage with <code>failAt</code>. Witness instant downstream skipping. Retrying preserves successful stages and resumes execution from the failure point.
            </p>
            <div className="pt-2">
              <Link to="/docs#retry" className="text-xs uppercase tracking-wider font-medium text-ink draw-underline">
                READ RESUMPTION LOGIC →
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7">
            <LiveFaultInjection />
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════════════╗
          ║ SECTION 4: "Everything In One Place" Architecture Strip  ║
          ╚══════════════════════════════════════════════════════════╝ */}
      <section
        aria-label="Architecture Schematic"
        className="w-full py-16 px-6 sm:px-12 max-w-7xl mx-auto"
      >
        <ArchitectureStrip />
      </section>

      {/* ╔══════════════════════════════════════════════════════════╗
          ║ SECTION 5: Editorial FAQ Accordion                       ║
          ╚══════════════════════════════════════════════════════════╝ */}
      <section
        aria-label="Frequently Asked Questions"
        className="w-full py-28 sm:py-36 px-6 sm:px-12 max-w-4xl mx-auto space-y-12"
      >
        <div className="space-y-3">
          <span className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted block">
            03 / CLARITY & SPECIFICATIONS
          </span>
          <h2 className="font-sans font-light text-3xl sm:text-4xl text-ink tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="font-sans font-light text-sm sm:text-base text-ink-muted">
            Detailed answers regarding simulation boundaries, background dispatch, and stage extensions.
          </p>
        </div>

        <FaqAccordion />
      </section>

      {/* ╔══════════════════════════════════════════════════════════╗
          ║ SECTION 6: Permanent Pure-Black Closing CTA Band         ║
          ╚══════════════════════════════════════════════════════════╝ */}
      <ClosingCtaBand />

      {/* ╔══════════════════════════════════════════════════════════╗
          ║ SECTION 7: Direct Contact Form (Target for Skip Link)    ║
          ╚══════════════════════════════════════════════════════════╝ */}
      <section id="contact" className="w-full py-24 sm:py-32 px-6 sm:px-12 max-w-3xl mx-auto">
        <ContactForm />
      </section>
    </div>
  );
}

export default LandingPage;
