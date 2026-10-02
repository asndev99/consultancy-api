import UserRepository from "../../Infra/db/repositories/user/index.js";
import BranchRepository from "../../Infra/db/repositories/branch/index.js";
import { NotFoundException } from "../../shared/error.js";
import { UserRoles } from "../../shared/application.constants.js";

export const WhoAmIUseCase = async (req) => {
  const user = await UserRepository.FindUserProfileById(Number(req.user.id));

  if (!user) {
    throw new NotFoundException("User not found");
  }

  const { userBranches, ...profile } = user;

  // Business Admins have access to every branch of their business, not just
  // the ones they are assigned to.
  if (user.role === UserRoles["Business Admin"] && user.businessId != null) {
    const branches = await BranchRepository.FindBranchesByBusinessId(
      user.businessId,
    );

    return {
      ...profile,
      assignedBranches: branches.map(({ id, name }) => ({ id, name })),
    };
  }

  return {
    ...profile,
    assignedBranches: userBranches
      .map((item) => item.Branch)
      .filter(Boolean),
  };
};
