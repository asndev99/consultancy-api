import {
  buildOwnApplicationsFilters,
  listBranchApplications,
  parseRequiredBranchId,
} from "./branch.applications.query.js";

// Sub Agent view: only applications where the caller is the sub agent.
export const GetSubAgentApplicationsByBranchUseCase = async (
  req,
  branchId,
  pagination,
  filters,
) => {
  const where = {
    branchId: parseRequiredBranchId(branchId),
    subAgentId: req.user.id,
    ...buildOwnApplicationsFilters(filters),
  };

  return listBranchApplications(req, where, pagination);
};
