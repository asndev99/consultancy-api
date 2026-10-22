import {
  listBranchApplications,
  parseOptionalStatus,
  parseRequiredBranchId,
} from "./branch.applications.query.js";

// Admission Team view: only applications assigned to the caller as admission officer.
export const GetAdmissionTeamApplicationsByBranchUseCase = async (
  req,
  branchId,
  pagination,
  { status } = {},
) => {
  const parsedStatus = parseOptionalStatus(status);

  const where = {
    branchId: parseRequiredBranchId(branchId),
    admissionOfficerId: req.user.id,
    ...(parsedStatus != null ? { applicationStatus: parsedStatus } : {}),
  };

  return listBranchApplications(req, where, pagination);
};
