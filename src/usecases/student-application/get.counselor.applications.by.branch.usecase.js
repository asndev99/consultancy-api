import {
  listBranchApplications,
  parseOptionalStatus,
  parseRequiredBranchId,
} from "./branch.applications.query.js";

// Counselor view: only applications where the caller is the counselor.
export const GetCounselorApplicationsByBranchUseCase = async (
  req,
  branchId,
  pagination,
  { status } = {},
) => {
  const parsedStatus = parseOptionalStatus(status);

  const where = {
    branchId: parseRequiredBranchId(branchId),
    counselorId: req.user.id,
    ...(parsedStatus != null ? { applicationStatus: parsedStatus } : {}),
  };

  return listBranchApplications(req, where, pagination);
};
