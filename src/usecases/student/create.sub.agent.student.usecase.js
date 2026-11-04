import { ForBiddenException } from "../../shared/error.js";
import { CreateStudentUseCase } from "./create.student.usecase.js";

// Sub Agent self-service create: the caller is always the student's sub agent
// (createdBy is set to the caller by CreateStudentUseCase).
export const CreateSubAgentStudentUseCase = async (req, payload) => {
  if (payload.businessId !== req.user.businessId) {
    throw new ForBiddenException(
      "You can only create students in your own business",
    );
  }

  const hasBranchAccess = (req.user.assignedBranches ?? []).some(
    (branch) => branch?.id === payload.branchId,
  );
  if (!hasBranchAccess) {
    throw new ForBiddenException("You don't have access to this branch");
  }

  return CreateStudentUseCase(req, { ...payload, subAgentId: req.user.id });
};
