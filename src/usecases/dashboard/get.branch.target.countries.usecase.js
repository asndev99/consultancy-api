import DashboardRepository from "../../Infra/db/repositories/dashboard/index.js";
import { resolveDashboardBranchId } from "./dashboard.branch.access.js";

// Share of all country picks, so percentages sum to ~100 even when students pick several.
export const GetBranchTargetCountriesUseCase = async (req, branchId) => {
  const parsedBranchId = await resolveDashboardBranchId(req, branchId);
  const businessId = req.user.businessId;

  const [rows, totalStudents] = await Promise.all([
    DashboardRepository.GroupStudentsByTargetCountry(businessId, parsedBranchId),
    DashboardRepository.CountStudentsWithTargetCountry(businessId, parsedBranchId),
  ]);

  const totalPicks = rows.reduce((sum, row) => sum + row.count, 0);

  return {
    branchId: parsedBranchId,
    totalStudents,
    totalPicks,
    countries: rows.map(({ country, count }) => ({
      country,
      count,
      percentage:
        totalPicks === 0 ? 0 : Math.round((count / totalPicks) * 10000) / 100,
    })),
  };
};
