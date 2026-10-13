/**
 * @file server/engine/index.js
 * @description Engine entry point. Initializes the registry with the 7 core simulated executors.
 */

import registry from './registry.js';
import sourceCheckout from './executors/sourceCheckout.js';
import build from './executors/build.js';
import unitTests from './executors/unitTests.js';
import codeQuality from './executors/codeQuality.js';
import securityScan from './executors/securityScan.js';
import dockerBuild from './executors/dockerBuild.js';
import deployDev from './executors/deployDev.js';
import pipelineEngine from './pipelineEngine.js';

// Register all 7 executors in strict pipeline order
registry.register(sourceCheckout);
registry.register(build);
registry.register(unitTests);
registry.register(codeQuality);
registry.register(securityScan);
registry.register(dockerBuild);
registry.register(deployDev);

export { registry, pipelineEngine };
export default pipelineEngine;
