import {
  listBranchApplications,
  parseOptionalId,
  parseRequiredBranchId,
} from "./branch.applications.query.js";

// Business Admin view: every application in the branch.
export const GetStudentApplicationsByBranchUseCase = async (
  req,
  branchId,
  pagination,
  { managerId, admissionOfficerId } = {},
) => {
  const parsedManagerId = parseOptionalId(managerId, "managerId");
  const parsedAdmissionOfficerId = parseOptionalId(
    admissionOfficerId,
    "admissionOfficerId",
  );

  const where = {
    branchId: parseRequiredBranchId(branchId),
    ...(parsedManagerId != null ? { managerId: parsedManagerId } : {}),
    ...(parsedAdmissionOfficerId != null
      ? { admissionOfficerId: parsedAdmissionOfficerId }
      : {}),
  };

  return listBranchApplications(req, where, pagination);
};
