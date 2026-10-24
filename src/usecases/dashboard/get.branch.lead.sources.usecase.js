import DashboardRepository from "../../Infra/db/repositories/dashboard/index.js";
import { resolveDashboardBranchId } from "./dashboard.branch.access.js";

const PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

const toPercentage = (part, whole) =>
  whole === 0 ? 0 : Math.round((part / whole) * 10000) / 100;

export const GetBranchLeadSourcesUseCase = async (req, branchId) => {
  const parsedBranchId = await resolveDashboardBranchId(req, branchId);

  const now = new Date();
  const period = { from: new Date(now.getTime() - PERIOD_MS), to: now };

  const rows = await DashboardRepository.GroupLeadsBySource(
    req.user.businessId,
    parsedBranchId,
    period,
  );

  // Rows arrive sorted by leads, so the first is the biggest source.
  const sources = rows.map(({ source, leads, enrolled }) => ({
    source,
    leads,
    enrolled,
    enrolledPercentage: toPercentage(enrolled, leads),
  }));

  // Highest enrolment rate; ties go to the source with more leads.
  const bestConverting = sources.reduce(
    (best, row) =>
      best == null || row.enrolledPercentage > best.enrolledPercentage
        ? row
        : best,
    null,
  );

  return {
    branchId: parsedBranchId,
    period: { from: period.from, to: period.to },
    totalLeads: sources.reduce((sum, row) => sum + row.leads, 0),
    sources,
    topSource: sources[0] ?? null,
    bestConverting,
  };
};
