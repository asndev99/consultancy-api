import UserRepository from "../../Infra/db/repositories/user/index.js";
import BranchRepository from "../../Infra/db/repositories/branch/index.js";
import { BadRequestException, NotFoundException } from "../../shared/error.js";
import { UserRoles } from "../../shared/application.constants.js";

export const AssignUserBranchUseCase = async (req, userId, branchId) => {
  const actorBusinessId = req.user.businessId || null;

  const user = await UserRepository.findUserById(Number(userId));
  if (
    !user ||
    user.isDeleted ||
    // Super Admins have no businessId, so they aren't scoped to one business.
    (actorBusinessId != null && user.businessId !== actorBusinessId)
  ) {
    throw new NotFoundException("User not found");
  }

  if (user.businessId == null) {
    throw new BadRequestException("This user cannot be assigned to a branch");
  }

  // Sub agents need a SubAgentBranchProfile per branch, which this endpoint
  // doesn't create.
  if (user.role === UserRoles["Sub Agent"]) {
    throw new BadRequestException(
      "Sub agents must be assigned using /sub-agent/assign-branch",
    );
  }

  const branch = await BranchRepository.FindBranchById(
    Number(branchId),
    user.businessId,
  );
  if (!branch) {
    throw new NotFoundException("Branch not found");
  }

  const existing = await UserRepository.FindUserBranch(user.id, branch.id);

  if (existing && existing.deletedAt == null) {
    throw new BadRequestException("User is already assigned to that branch");
  }

  // A previously removed assignment is restored rather than re-created,
  // since (userId, branchId) is unique.
  if (existing) {
    return UserRepository.RestoreUserBranch(existing.id, req.user.id);
  }

  return UserRepository.addUserToBranch({
    userId: user.id,
    branchId: branch.id,
    businessId: user.businessId,
    createdBy: req.user.id,
  });
};
