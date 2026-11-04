import { ForBiddenException } from "../../shared/error.js";
import { GetStudentsByBranchUseCase } from "./get.students.by.branch.usecase.js";

// Sub Agent view: only the students whose sub agent is the caller.
export const GetSubAgentStudentsByBranchUseCase = async (req, query) => {
  const branchId = Number(query.branchId);
  const hasBranchAccess = (req.user.assignedBranches ?? []).some(
    (branch) => branch?.id === branchId,
  );
  if (!hasBranchAccess) {
    throw new ForBiddenException("You don't have access to this branch");
  }

  return GetStudentsByBranchUseCase({
    ...query,
    businessId: req.user.businessId,
    branchId,
    subAgentId: req.user.id,
  });
};
