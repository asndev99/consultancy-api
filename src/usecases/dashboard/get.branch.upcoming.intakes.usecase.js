import DashboardRepository from "../../Infra/db/repositories/dashboard/index.js";
import { ApplicationStatus } from "../../shared/application.constants.js";
import { resolveDashboardBranchId } from "./dashboard.branch.access.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// Applications already closed out don't count towards an upcoming intake.
const EXCLUDED_STATUSES = [ApplicationStatus.Rejected, ApplicationStatus.Enrolled];

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// applicationIntake holds an ISO date (YYYY-MM-DD...); returns its UTC-midnight
// ms, or null when the value isn't a real calendar date.
function parseIntakeDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? "");
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const ms = Date.UTC(year, month - 1, day);
  const date = new Date(ms);
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? ms : null;
}

// Today's date in the business's time zone, as UTC-midnight ms.
function todayInTimeZone(timeZone) {
  let isoDate;
  try {
    isoDate = new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
  } catch {
    isoDate = new Date().toISOString().slice(0, 10);
  }
  return parseIntakeDate(isoDate);
}

export const GetBranchUpcomingIntakesUseCase = async (req, branchId) => {
  const parsedBranchId = await resolveDashboardBranchId(req, branchId);
  const businessId = req.user.businessId;

  const [rows, business] = await Promise.all([
    DashboardRepository.GroupApplicationsByIntake(
      businessId,
      parsedBranchId,
      EXCLUDED_STATUSES,
    ),
    DashboardRepository.FindBusinessTimeZone(businessId),
  ]);

  const today = todayInTimeZone(business?.timeZone);
  const intakesByMonth = new Map();

  for (const { applicationIntake, isAdmissionTeamAssigned, count } of rows) {
    const intakeMs = parseIntakeDate(applicationIntake);
    if (intakeMs == null || intakeMs < today) continue;

    const intakeDate = new Date(intakeMs);
    const key = intakeDate.toISOString().slice(0, 7);
    const intake = intakesByMonth.get(key) ?? {
      intake: key,
      label: `${MONTH_LABELS[intakeDate.getUTCMonth()]} ${intakeDate.getUTCFullYear()}`,
      nextIntakeMs: intakeMs,
      applications: 0,
      withoutAdmissionOfficer: 0,
    };

    intake.nextIntakeMs = Math.min(intake.nextIntakeMs, intakeMs);
    intake.applications += count;
    if (!isAdmissionTeamAssigned) {
      intake.withoutAdmissionOfficer += count;
    }
    intakesByMonth.set(key, intake);
  }

  const intakes = [...intakesByMonth.values()]
    .sort((a, b) => a.nextIntakeMs - b.nextIntakeMs)
    .map(({ nextIntakeMs, ...intake }) => ({
      ...intake,
      nextIntakeDate: new Date(nextIntakeMs).toISOString().slice(0, 10),
      daysAway: Math.round((nextIntakeMs - today) / DAY_MS),
    }));

  return { branchId: parsedBranchId, intakes };
};
