import {
  buildAssignmentFilter,
  buildSearchFilter,
  listBranchApplications,
  parseOptionalId,
  parseOptionalStatus,
  parseRequiredBranchId,
  UnassignedWhere,
} from "./branch.applications.query.js";

// Manager / Business Admin view: every application in the branch, optionally filtered.
export const GetManagerApplicationsByBranchUseCase = async (
  req,
  branchId,
  pagination,
  {
    managerId,
    counselorId,
    admissionOfficerId,
    subAgentId,
    status,
    searchTerm,
  } = {},
) => {
  const parsedSubAgentId = parseOptionalId(subAgentId, "subAgentId");
  const parsedStatus = parseOptionalStatus(status);

  const where = {
    branchId: parseRequiredBranchId(branchId),
    ...buildAssignmentFilter(managerId, "managerId", UnassignedWhere.manager),
    ...buildAssignmentFilter(
      counselorId,
      "counselorId",
      UnassignedWhere.counselor,
    ),
    ...buildAssignmentFilter(
      admissionOfficerId,
      "admissionOfficerId",
      UnassignedWhere.admissionOfficer,
    ),
    ...(parsedSubAgentId != null ? { subAgentId: parsedSubAgentId } : {}),
    ...(parsedStatus != null ? { applicationStatus: parsedStatus } : {}),
    ...buildSearchFilter(searchTerm),
  };

  return listBranchApplications(req, where, pagination);
};
