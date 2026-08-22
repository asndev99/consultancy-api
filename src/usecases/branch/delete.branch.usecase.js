import BranchRepository from "../../Infra/db/repositories/branch/index.js";

export const DeleteBranchUseCase = async (req, branchId) => {
  return BranchRepository.DeleteBranch(
    Number(branchId),
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.user.id,
    },
    req.user.businessId || null,
  );
};
