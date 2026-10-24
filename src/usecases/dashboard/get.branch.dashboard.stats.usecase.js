import DashboardRepository from "../../Infra/db/repositories/dashboard/index.js";
import { ApplicationStatus } from "../../shared/application.constants.js";
import { resolveDashboardBranchId } from "./dashboard.branch.access.js";

const PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

// null when there is no previous value to compare against.
function percentageChange(current, previous) {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return Math.round(((current - previous) / previous) * 10000) / 100;
}

const withChange = (count, previousCount) => ({
  count,
  previousCount,
  percentageChange: percentageChange(count, previousCount),
});

export const GetBranchDashboardStatsUseCase = async (req, branchId) => {
  const parsedBranchId = await resolveDashboardBranchId(req, branchId);
  const businessId = req.user.businessId;

  const now = new Date();
  const current = { from: new Date(now.getTime() - PERIOD_MS), to: now };
  const previous = {
    from: new Date(now.getTime() - 2 * PERIOD_MS),
    to: current.from,
  };

  const [
    newLeads,
    previousNewLeads,
    submitted,
    previousSubmitted,
    inVisaProcessing,
    enrolled,
    previousEnrolled,
  ] = await Promise.all([
    DashboardRepository.CountNewLeads(businessId, parsedBranchId, current),
    DashboardRepository.CountNewLeads(businessId, parsedBranchId, previous),
    DashboardRepository.CountSubmittedApplications(businessId, parsedBranchId, current),
    DashboardRepository.CountSubmittedApplications(businessId, parsedBranchId, previous),
    DashboardRepository.CountApplicationsByStatus(
      businessId,
      parsedBranchId,
      ApplicationStatus["Visa Processing"],
    ),
    DashboardRepository.CountEnrolledStudents(businessId, parsedBranchId, current),
    DashboardRepository.CountEnrolledStudents(businessId, parsedBranchId, previous),
  ]);

  return {
    branchId: parsedBranchId,
    period: {
      currentFrom: current.from,
      currentTo: current.to,
      previousFrom: previous.from,
      previousTo: previous.to,
    },
    newLeads: withChange(newLeads, previousNewLeads),
    applicationsSubmitted: withChange(submitted, previousSubmitted),
    applicationsInVisaProcessing: { count: inVisaProcessing },
    enrolled: withChange(enrolled, previousEnrolled),
  };
};
