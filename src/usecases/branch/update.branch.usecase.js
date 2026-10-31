import BranchRepository from "../../Infra/db/repositories/branch/index.js";
import { invalidateBusinessAuthContexts } from "../session/auth.session.js";

export const UpdateBranchUseCase = async (req, branchId, payload) => {
  const updatedBranch = await BranchRepository.UpdateBranch(
    Number(branchId),
    {
      ...payload,
      updatedBy: req.user.id,
    },
    req.user.businessId || null,
  );

  // assignedBranches holds full branch rows (name etc.), so every cached copy
  // in the business that may include this branch is now outdated.
  await invalidateBusinessAuthContexts(updatedBranch.businessId);

  return updatedBranch;
};
