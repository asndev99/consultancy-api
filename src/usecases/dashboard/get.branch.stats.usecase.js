import DashboardRepository from "../../Infra/db/repositories/dashboard/index.js";
import { resolveDashboardScope } from "./dashboard.scope.js";
import { buildBranchStats } from "./dashboard.aggregate.js";

export const GetBranchStatsUseCase = async (req) => {
  const { businessId } = await resolveDashboardScope(req, undefined);

  const [branches, studentRows, subAgentRows, applicationRows] = await Promise.all([
    DashboardRepository.ListBranches(businessId),
    DashboardRepository.GroupStudentsByBranch(businessId),
    DashboardRepository.GroupSubAgentsByBranch(businessId),
    DashboardRepository.GroupApplicationsByBranchAndStatus(businessId),
  ]);

  return buildBranchStats(branches, studentRows, subAgentRows, applicationRows);
};
