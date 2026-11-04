import { GetBranchDashboardStatsUseCase } from "./get.branch.dashboard.stats.usecase.js";
import { GetBranchTargetCountriesUseCase } from "./get.branch.target.countries.usecase.js";
import { GetBranchPipelineUseCase } from "./get.branch.pipeline.usecase.js";
import { GetBranchUpcomingIntakesUseCase } from "./get.branch.upcoming.intakes.usecase.js";
import { GetBranchLeadSourcesUseCase } from "./get.branch.lead.sources.usecase.js";
import { GetBranchCounselorWorkloadUseCase } from "./get.branch.counselor.workload.usecase.js";
import { GetBranchAdmissionTeamWorkloadUseCase } from "./get.branch.admission.team.workload.usecase.js";

const DashboardUseCases = {
  GetBranchDashboardStatsUseCase,
  GetBranchTargetCountriesUseCase,
  GetBranchPipelineUseCase,
  GetBranchUpcomingIntakesUseCase,
  GetBranchLeadSourcesUseCase,
  GetBranchCounselorWorkloadUseCase,
  GetBranchAdmissionTeamWorkloadUseCase,
};

export default DashboardUseCases;
