import BranchRepository from "../../Infra/db/repositories/branch/index.js";
import { invalidateBusinessAuthContexts } from "../session/auth.session.js";

export const DeleteBranchUseCase = async (req, branchId) => {
  const deletedBranch = await BranchRepository.DeleteBranch(
    Number(branchId),
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.user.id,
    },
    req.user.businessId || null,
  );

  // Deleted branches drop out of everyone's assignedBranches.
  await invalidateBusinessAuthContexts(deletedBranch.businessId);

  return deletedBranch;
};
