import BranchRepository from "../../Infra/db/repositories/branch/index.js";

export const UpdateBranchUseCase = async (req, branchId, payload) => {
  return BranchRepository.UpdateBranch(
    Number(branchId),
    {
      ...payload,
      updatedBy: req.user.id,
    },
    req.user.businessId || null,
  );
};
