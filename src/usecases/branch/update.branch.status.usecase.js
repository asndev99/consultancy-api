import BranchRepository from "../../Infra/db/repositories/branch/index.js";

export const UpdateBranchStatusUseCase = async (req, branchId, isActive) => {
  return BranchRepository.UpdateBranch(
    Number(branchId),
    {
      isActive,
      updatedBy: req.user.id,
    },
    req.user.businessId || null,
  );
};
