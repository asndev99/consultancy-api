import DashboardRepository from "../../Infra/db/repositories/dashboard/index.js";
import { ApplicationStatus } from "../../shared/application.constants.js";
import { resolveDashboardBranchId } from "./dashboard.branch.access.js";

const PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

// Active students a counselor can comfortably handle; drives the load bar.
const COMFORTABLE_COUNSELOR_LOAD = 80;

// Closed applications don't count as work in progress.
const CLOSED_APPLICATION_STATUSES = [
  ApplicationStatus.Enrolled,
  ApplicationStatus.Rejected,
];

// null when there is nothing to divide by.
const toPercentage = (part, whole) =>
  whole === 0 ? null : Math.round((part / whole) * 10000) / 100;

const emptyStudentWorkload = {
  activeStudents: 0,
  totalStudents: 0,
  enrolledStudents: 0,
  enrolledInPeriod: 0,
};

export const GetBranchCounselorWorkloadUseCase = async (req, branchId) => {
  const parsedBranchId = await resolveDashboardBranchId(req, branchId);
  const businessId = req.user.businessId;

  const now = new Date();
  const period = { from: new Date(now.getTime() - PERIOD_MS), to: now };

  const [studentRows, applicationRows, branchCounselors] = await Promise.all([
    DashboardRepository.GroupStudentWorkloadByCounselor(
      businessId,
      parsedBranchId,
      period,
    ),
    DashboardRepository.GroupOpenApplicationsByCounselor(
      businessId,
      parsedBranchId,
      CLOSED_APPLICATION_STATUSES,
    ),
    DashboardRepository.FindBranchCounselors(businessId, parsedBranchId),
  ]);

  // Keyed by counselorId; the null key holds unassigned work.
  const studentsByCounselor = new Map(
    studentRows.map((row) => [row.counselorId, row]),
  );
  const applicationsByCounselor = new Map(
    applicationRows.map((row) => [row.counselorId, row.count]),
  );

  // Counselors who left the branch (or were deactivated) but still hold work
  // there are listed too, so none of the branch's students go missing.
  const currentCounselorIds = new Set(branchCounselors.map(({ id }) => id));
  const formerCounselorIds = [
    ...new Set([...studentsByCounselor.keys(), ...applicationsByCounselor.keys()]),
  ].filter((id) => id != null && !currentCounselorIds.has(id));

  const formerCounselors =
    formerCounselorIds.length > 0
      ? await DashboardRepository.FindUsersByIds(formerCounselorIds)
      : [];

  const counselors = [...branchCounselors, ...formerCounselors]
    .map(({ id, name }) => {
      const students = studentsByCounselor.get(id) ?? emptyStudentWorkload;
      return {
        counselorId: id,
        name,
        isCurrentCounselor: currentCounselorIds.has(id),
        activeStudents: students.activeStudents,
        loadPercentage: toPercentage(
          students.activeStudents,
          COMFORTABLE_COUNSELOR_LOAD,
        ),
        applicationsInProgress: applicationsByCounselor.get(id) ?? 0,
        enrolledLast30Days: students.enrolledInPeriod,
        leadToEnrolledPercentage: toPercentage(
          students.enrolledStudents,
          students.totalStudents,
        ),
      };
    })
    .sort(
      (a, b) =>
        b.activeStudents - a.activeStudents || a.name.localeCompare(b.name),
    );

  const unassignedStudents =
    studentsByCounselor.get(null) ?? emptyStudentWorkload;

  return {
    branchId: parsedBranchId,
    comfortableLoad: COMFORTABLE_COUNSELOR_LOAD,
    period: { from: period.from, to: period.to },
    counselors,
    unassigned: {
      activeStudents: unassignedStudents.activeStudents,
      applicationsInProgress: applicationsByCounselor.get(null) ?? 0,
      enrolledLast30Days: unassignedStudents.enrolledInPeriod,
    },
  };
};
