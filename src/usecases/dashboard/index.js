import { GetDashboardSummaryUseCase } from "./get.dashboard.summary.usecase.js";
import { GetBranchStatsUseCase } from "./get.branch.stats.usecase.js";
import { GetDistributionUseCase } from "./get.distribution.usecase.js";
import { GetSubAgentStatsUseCase } from "./get.sub.agent.stats.usecase.js";
import { GetTrendsUseCase } from "./get.trends.usecase.js";

const DashboardUseCases = {
  GetDashboardSummaryUseCase,
  GetBranchStatsUseCase,
  GetDistributionUseCase,
  GetSubAgentStatsUseCase,
  GetTrendsUseCase,
};

export default DashboardUseCases;
