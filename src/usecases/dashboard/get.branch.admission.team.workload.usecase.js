import DashboardRepository from "../../Infra/db/repositories/dashboard/index.js";
import { UserRoles } from "../../shared/application.constants.js";
import { resolveDashboardBranchId } from "./dashboard.branch.access.js";

const PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

// Open applications an admission officer can comfortably handle; drives the
// load bar.
const COMFORTABLE_ADMISSION_LOAD = 40;

// null when there is nothing to divide by.
const toPercentage = (part, whole) =>
  whole === 0 ? null : Math.round((part / whole) * 10000) / 100;

const emptyApplicationWorkload = {
  openApplications: 0,
  underReview: 0,
  pendingDocuments: 0,
  submittedInPeriod: 0,
  successfulApplications: 0,
  rejectedApplications: 0,
};

export const GetBranchAdmissionTeamWorkloadUseCase = async (req, branchId) => {
  const parsedBranchId = await resolveDashboardBranchId(req, branchId);
  const businessId = req.user.businessId;

  const now = new Date();
  const period = { from: new Date(now.getTime() - PERIOD_MS), to: now };

  const [applicationRows, branchOfficers] = await Promise.all([
    DashboardRepository.GroupApplicationWorkloadByAdmissionOfficer(
      businessId,
      parsedBranchId,
      period,
    ),
    DashboardRepository.FindActiveBranchUsersByRole(
      businessId,
      parsedBranchId,
      UserRoles["Admission Team"],
    ),
  ]);

  // Keyed by admissionOfficerId; the null key holds unassigned applications.
  const applicationsByOfficer = new Map(
    applicationRows.map((row) => [row.admissionOfficerId, row]),
  );

  // Officers who left the branch (or were deactivated) but still hold
  // applications there are listed too, so none of the branch's work goes missing.
  const currentOfficerIds = new Set(branchOfficers.map(({ id }) => id));
  const formerOfficerIds = [...applicationsByOfficer.keys()].filter(
    (id) => id != null && !currentOfficerIds.has(id),
  );

  const formerOfficers =
    formerOfficerIds.length > 0
      ? await DashboardRepository.FindUsersByIds(formerOfficerIds)
      : [];

  const admissionTeam = [...branchOfficers, ...formerOfficers]
    .map(({ id, name }) => {
      const applications =
        applicationsByOfficer.get(id) ?? emptyApplicationWorkload;
      return {
        admissionOfficerId: id,
        name,
        isCurrentMember: currentOfficerIds.has(id),
        openApplications: applications.openApplications,
        loadPercentage: toPercentage(
          applications.openApplications,
          COMFORTABLE_ADMISSION_LOAD,
        ),
        underReview: applications.underReview,
        pendingDocuments: applications.pendingDocuments,
        submittedLast30Days: applications.submittedInPeriod,
        successRatePercentage: toPercentage(
          applications.successfulApplications,
          applications.successfulApplications +
            applications.rejectedApplications,
        ),
      };
    })
    .sort(
      (a, b) =>
        b.openApplications - a.openApplications || a.name.localeCompare(b.name),
    );

  const unassigned =
    applicationsByOfficer.get(null) ?? emptyApplicationWorkload;

  return {
    branchId: parsedBranchId,
    comfortableLoad: COMFORTABLE_ADMISSION_LOAD,
    period: { from: period.from, to: period.to },
    admissionTeam,
    unassigned: {
      openApplications: unassigned.openApplications,
      underReview: unassigned.underReview,
      pendingDocuments: unassigned.pendingDocuments,
      submittedLast30Days: unassigned.submittedInPeriod,
    },
  };
};
