import {
  listBranchApplications,
  parseOptionalId,
  parseOptionalStatus,
  parseRequiredBranchId,
} from "./branch.applications.query.js";

// Manager / Business Admin view: every application in the branch, optionally filtered.
export const GetManagerApplicationsByBranchUseCase = async (
  req,
  branchId,
  pagination,
  { counselorId, admissionOfficerId, status } = {},
) => {
  const parsedCounselorId = parseOptionalId(counselorId, "counselorId");
  const parsedAdmissionOfficerId = parseOptionalId(
    admissionOfficerId,
    "admissionOfficerId",
  );
  const parsedStatus = parseOptionalStatus(status);

  const where = {
    branchId: parseRequiredBranchId(branchId),
    ...(parsedCounselorId != null ? { counselorId: parsedCounselorId } : {}),
    ...(parsedAdmissionOfficerId != null
      ? { admissionOfficerId: parsedAdmissionOfficerId }
      : {}),
    ...(parsedStatus != null ? { applicationStatus: parsedStatus } : {}),
  };

  return listBranchApplications(req, where, pagination);
};
