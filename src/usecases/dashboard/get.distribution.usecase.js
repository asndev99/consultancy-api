import DashboardRepository from "../../Infra/db/repositories/dashboard/index.js";
import { ApplicationStatus, LeadStage } from "../../shared/application.constants.js";
import { resolveDashboardScope } from "./dashboard.scope.js";
import { orderedDistribution, topWithOther } from "./dashboard.aggregate.js";

export const GetDistributionUseCase = async (req, rawBranchId) => {
  const { businessId, branchId } = await resolveDashboardScope(req, rawBranchId);

  const [leadStageRows, statusRows, countryRows, leadSourceRows] = await Promise.all([
    DashboardRepository.GroupStudentsByLeadStage(businessId, branchId),
    DashboardRepository.GroupApplicationsByStatus(businessId, branchId),
    DashboardRepository.GroupApplicationsByTargetCountry(businessId, branchId),
    DashboardRepository.GroupStudentsByLeadSource(businessId, branchId),
  ]);

  return {
    studentsByLeadStage: orderedDistribution(leadStageRows, Object.values(LeadStage)),
    applicationsByStatus: orderedDistribution(statusRows, Object.values(ApplicationStatus)),
    applicationsByTargetCountry: topWithOther(countryRows),
    studentsByLeadSource: topWithOther(leadSourceRows),
  };
};
