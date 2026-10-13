/**
 * @file client/src/components/ui/ErrorBoundary.jsx
 * @description Application error boundary catching uncaught runtime exceptions
 * and rendering a graceful fallback rather than a blank white screen.
 */

import React from 'react';
import { Compass, RotateCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('KestrelCI caught an unhandled error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full border border-white/20 p-8 rounded-[2px] bg-[#07070A] text-center space-y-6">
            <div className="w-12 h-12 mx-auto border border-white/20 rounded-[2px] flex items-center justify-center text-white/80">
              <Compass className="w-6 h-6 stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-white/50">
                RUNTIME EXCEPTION INTERCEPTED
              </span>
              <h1 className="text-2xl font-light tracking-tight text-white">
                Something interrupted the view
              </h1>
              <p className="text-xs font-mono text-white/60 leading-relaxed break-words">
                {this.state.error?.message || 'An unexpected client error occurred.'}
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-mono text-xs uppercase tracking-wider rounded-[2px] hover:bg-white/90 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" /> Reload Page
              </button>
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 text-white font-mono text-xs uppercase tracking-wider rounded-[2px] hover:bg-white/10 transition-colors"
              >
                Overview →
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
