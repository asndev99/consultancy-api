import DashboardRepository from "../../Infra/db/repositories/dashboard/index.js";
import { resolveDashboardScope } from "./dashboard.scope.js";
import { buildPeriods, parseTrendsParams, todayInTimeZone } from "./dashboard.params.js";
import { fillSeries } from "./dashboard.aggregate.js";

const DEFAULT_TIME_ZONE = "Asia/Karachi";

export const GetTrendsUseCase = async (req, query) => {
  const { businessId, branchId } = await resolveDashboardScope(req, query.branchId);

  const business = await DashboardRepository.FindBusinessTimeZone(businessId);
  const timeZone = business?.timeZone ?? DEFAULT_TIME_ZONE;

  const { groupBy, from, to } = parseTrendsParams(query, todayInTimeZone(timeZone));
  const params = { businessId, branchId, from, to, groupBy, timeZone };

  const [newStudents, newApplications, enrolled] = await Promise.all([
    DashboardRepository.CountNewStudentsByPeriod(params),
    DashboardRepository.CountNewApplicationsByPeriod(params),
    DashboardRepository.CountEnrolledApplicationsByPeriod(params),
  ]);

  return {
    groupBy,
    from,
    to,
    timeZone,
    series: fillSeries(buildPeriods(from, to, groupBy), {
      newStudents,
      newApplications,
      enrolled,
    }),
  };
};
