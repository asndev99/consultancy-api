import BranchRepository from "../../Infra/db/repositories/branch/index.js";
import { NotFoundException } from "../../shared/error.js";
import { UserRoles } from "../../shared/application.constants.js";
import { invalidateBusinessAuthContexts } from "../session/auth.session.js";

export const UpdateBranchStatusUseCase = async (req, branchId, isActive) => {
  const businessId = req.user.businessId || null;

  const branch = await BranchRepository.FindBranchById(
    Number(branchId),
    businessId,
  );
  if (!branch) {
    throw new NotFoundException("Branch not found");
  }

  if (branch.isActive === isActive) {
    return branch;
  }

  const updatedBranch = await BranchRepository.UpdateBranch(
    branch.id,
    {
      isActive,
      updatedBy: req.user.id,
    },
    businessId,
  );

  // Inactive branches drop out of everyone's assignedBranches except Business
  // Admins', so refresh the cached copy for the rest of the business now
  // instead of waiting for the cache to expire.
  await invalidateBusinessAuthContexts(branch.businessId, {
    excludeRoles: [UserRoles["Business Admin"]],
  });

  return updatedBranch;
};
