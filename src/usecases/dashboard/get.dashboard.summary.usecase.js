import DashboardRepository from "../../Infra/db/repositories/dashboard/index.js";
import { resolveDashboardScope } from "./dashboard.scope.js";
import { summarizeApplications } from "./dashboard.aggregate.js";

export const GetDashboardSummaryUseCase = async (req, rawBranchId) => {
  const { businessId, branchId } = await resolveDashboardScope(req, rawBranchId);

  const [branches, students, subAgents, applicationRows] = await Promise.all([
    branchId === undefined ? DashboardRepository.CountBranches(businessId) : null,
    DashboardRepository.CountStudents(businessId, branchId),
    DashboardRepository.CountSubAgents(businessId, branchId),
    DashboardRepository.GroupApplicationsByStatus(businessId, branchId),
  ]);

  return {
    ...(branches ? { branches } : {}),
    students: { total: students },
    subAgents: { total: subAgents },
    applications: summarizeApplications(applicationRows),
  };
};
