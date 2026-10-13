/**
 * @file server/services/statsService.js
 * @description Computes dashboard summary metrics, rates, and recent activity.
 */

import runsRepo from '../database/repositories/runsRepo.js';
import projectsRepo from '../database/repositories/projectsRepo.js';
import pipelinesRepo from '../database/repositories/pipelinesRepo.js';

export const statsService = {
  getDashboardStats() {
    const metrics = runsRepo.getStats();
    const recentRuns = runsRepo.findRecent(6);
    const totalProjects = projectsRepo.count();
    const totalPipelines = pipelinesRepo.count();

    return {
      totals: {
        ...metrics,
        totalProjects,
        totalPipelines
      },
      recentRuns
    };
  }
};

export default statsService;
