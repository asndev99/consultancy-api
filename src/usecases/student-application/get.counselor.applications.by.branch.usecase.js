import {
  buildOwnApplicationsFilters,
  listBranchApplications,
  parseRequiredBranchId,
} from "./branch.applications.query.js";

// Counselor view: only applications where the caller is the counselor.
export const GetCounselorApplicationsByBranchUseCase = async (
  req,
  branchId,
  pagination,
  filters,
) => {
  const where = {
    branchId: parseRequiredBranchId(branchId),
    counselorId: req.user.id,
    ...buildOwnApplicationsFilters(filters),
  };

  return listBranchApplications(req, where, pagination);
};
