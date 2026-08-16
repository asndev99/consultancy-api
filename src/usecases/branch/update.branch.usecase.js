import BranchRepository from "../../Infra/db/repositories/branch/index.js";

export const UpdateBranchUseCase = async (req, branchId, payload) => {
  return BranchRepository.UpdateBranch(branchId, {
    ...payload,
    updatedBy: req.user.id,
  });
};
