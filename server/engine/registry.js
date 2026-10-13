/**
 * @file server/engine/registry.js
 * @description Extensible stage executor registry.
 * Decouples the pipeline engine loop from stage implementations.
 * Real or simulated executors can be registered without modifying the engine.
 */

class StageRegistry {
  constructor() {
    this.executors = new Map();
    this.orderedNames = [];
  }

  /**
   * Registers a new stage executor.
   * @param {object} executor Must implement name, displayName, and run(context)
   */
  register(executor) {
    if (!executor.name || typeof executor.run !== 'function') {
      throw new Error(`Invalid StageExecutor: must provide name and run(context) method.`);
    }

    if (!this.executors.has(executor.name)) {
      this.orderedNames.push(executor.name);
    }
    this.executors.set(executor.name, executor);
  }

  /**
   * Retrieves executor by stage name.
   */
  get(name) {
    return this.executors.get(name);
  }

  /**
   * Checks if an executor exists for a given stage name.
   */
  has(name) {
    return this.executors.has(name);
  }

  /**
   * Returns all registered executors in sequential pipeline order.
   */
  getAllOrdered() {
    return this.orderedNames.map(name => this.executors.get(name));
  }

  /**
   * Returns list of stage metadata in order (for creating initial stage rows).
   */
  getStageDefinitions() {
    return this.orderedNames.map((name, index) => {
      const executor = this.executors.get(name);
      return {
        name,
        displayName: executor.displayName || name,
        orderIndex: index + 1
      };
    });
  }
}

export const registry = new StageRegistry();
export default registry;
