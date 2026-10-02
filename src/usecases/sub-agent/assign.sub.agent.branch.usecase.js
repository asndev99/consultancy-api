import SubAgentRepository from "../../Infra/db/repositories/sub-agent/index.js";
import UserRepository from "../../Infra/db/repositories/user/index.js";
import BranchRepository from "../../Infra/db/repositories/branch/index.js";
import { UserRoles } from "../../shared/application.constants.js";
import { BadRequestException, NotFoundException } from "../../shared/error.js";

export const AssignSubAgentBranchUseCase = async (req, payload) => {
  const { userId, branchId, companyName, commissionRate, targetCountries } =
    payload;
  const actorBusinessId = req.user.businessId || null;

  const user = await UserRepository.findUserById(Number(userId));
  if (
    !user ||
    user.isDeleted ||
    user.role !== UserRoles["Sub Agent"] ||
    // Super Admins have no businessId, so they aren't scoped to one business.
    (actorBusinessId != null && user.businessId !== actorBusinessId)
  ) {
    throw new NotFoundException("Sub agent not found");
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
    throw new BadRequestException("This user already exists on this branch");
  }

  const { userBranch, subAgentProfile } =
    await SubAgentRepository.AssignSubAgentToBranch({
      userId: user.id,
      branchId: branch.id,
      businessId: user.businessId,
      existingUserBranchId: existing?.id ?? null,
      profile: {
        ...(companyName !== undefined ? { companyName } : {}),
        ...(commissionRate !== undefined ? { commissionRate } : {}),
        ...(targetCountries !== undefined ? { targetCountries } : {}),
      },
      actorId: req.user.id,
    });

  return {
    userBranchId: userBranch.id,
    userId: user.id,
    branchId: branch.id,
    branchName: branch.name,
    subAgentProfile: {
      id: subAgentProfile.id,
      companyName: subAgentProfile.companyName,
      commissionRate: subAgentProfile.commissionRate,
      targetCountries: subAgentProfile.targetCountries,
      referredStudents: subAgentProfile.referredStudents,
    },
  };
};
