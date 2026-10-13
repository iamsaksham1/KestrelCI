/**
 * @file server/engine/executors/baseExecutor.js
 * @description Base class and timing utility for simulated stage executors.
 * In test mode, simulates durations rapidly (15-35ms) so unit test suites finish in milliseconds.
 */

import config from '../../config/index.js';

export class BaseExecutor {
  constructor(name, displayName, minMs = 600, maxMs = 1100) {
    this.name = name;
    this.displayName = displayName;
    this.minMs = minMs;
    this.maxMs = maxMs;
  }

  /**
   * Generates execution duration. Accelerates in test environment.
   */
  getRandomDuration() {
    if (config.NODE_ENV === 'test' || process.env.NODE_ENV === 'test') {
      return Math.floor(Math.random() * 20) + 15;
    }
    return Math.floor(Math.random() * (this.maxMs - this.minMs + 1)) + this.minMs;
  }

  /**
   * Simulated delay respecting cancellation checks.
   */
  async sleep(ms, checkCancelled) {
    const step = 20;
    let elapsed = 0;
    while (elapsed < ms) {
      if (checkCancelled && checkCancelled()) {
        throw new Error('STAGE_CANCELLED');
      }
      await new Promise(resolve => setTimeout(resolve, Math.min(step, ms - elapsed)));
      elapsed += step;
    }
  }
}

export default BaseExecutor;
