import BusinessRepository from "../../Infra/db/repositories/business/index.js";
import { UserRoles } from "../../shared/application.constants.js";

export const GetUsersByBusinessUseCase = async (
  role,
  businessId,
  managerBranches = [],
) => {
  const users = await BusinessRepository.getUsersByBusinessId(
    Number(businessId),
  );

  if (role == UserRoles["Super Admin"] || role == UserRoles["Business Admin"]) {
    return users.map(({ userBranches, ...user }) => ({
      ...user,
      branches: userBranches.map((userBranch) => userBranch.Branch),
    }));
  }

  if (role == UserRoles["Manager"]) {
    if (managerBranches.length === 0) {
      return [];
    }

    const managerBranchIds = new Set(managerBranches.map((b) => b.id));

    return users
      .map(({ userBranches, ...user }) => {
        const branches = userBranches
          .map((ub) => ub.Branch)
          .filter((branch) => managerBranchIds.has(branch.id));

        return { ...user, branches };
      })
      .filter((user) => user.branches.length > 0);
  }

  return [];
};
