import {
  buildOwnApplicationsFilters,
  listBranchApplications,
  parseRequiredBranchId,
} from "../student-application/branch.applications.query.js";
import { NotFoundException } from "../../shared/error.js";
import { findSubAgentProfile } from "./find.sub.agent.profile.js";

// Applications a sub agent brought in on one branch. subAgentId is the
// SubAgentBranchProfile id (as in the rest of this module), which is mapped to
// the sub agent's user id that StudentApplication.subAgentId stores.
export const GetSubAgentApplicationsUseCase = async (
  req,
  subAgentId,
  branchId,
  pagination,
  filters,
) => {
  const parsedBranchId = parseRequiredBranchId(branchId);
  const profile = await findSubAgentProfile(req, subAgentId);

  if (profile.branch.Branch.id !== parsedBranchId) {
    throw new NotFoundException("Sub agent not found in this branch");
  }

  const where = {
    branchId: parsedBranchId,
    subAgentId: profile.branch.User.id,
    ...buildOwnApplicationsFilters(filters),
  };

  return listBranchApplications(req, where, pagination);
};
