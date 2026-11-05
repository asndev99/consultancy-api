import {
  buildAssignmentFilter,
  buildSearchFilter,
  listBranchApplications,
  parseOptionalStatus,
  parseRequiredBranchId,
  UnassignedWhere,
} from "./branch.applications.query.js";

// Admission Team view: only applications assigned to the caller as admission officer.
export const GetAdmissionTeamApplicationsByBranchUseCase = async (
  req,
  branchId,
  pagination,
  { status, managerId, searchTerm } = {},
) => {
  const parsedStatus = parseOptionalStatus(status);

  const where = {
    branchId: parseRequiredBranchId(branchId),
    admissionOfficerId: req.user.id,
    ...(parsedStatus != null ? { applicationStatus: parsedStatus } : {}),
    ...buildAssignmentFilter(managerId, "managerId", UnassignedWhere.manager),
    ...buildSearchFilter(searchTerm),
  };

  return listBranchApplications(req, where, pagination);
};
