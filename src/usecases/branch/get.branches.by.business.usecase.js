import BranchRepository from "../../Infra/db/repositories/branch/index.js";
import { UserRoles } from "../../shared/application.constants.js";

export const GetBranchesByBusinessUseCase = async (businessId) => {
  const data = await BranchRepository.GetBranchesByBusinessIdIncludingUsers(
    Number(businessId),
  );

  if (!data) {
    return [];
  }

  return data.map((item) => {
    const { branchUsers, ...rest } = item;

    const members = (branchUsers ?? []).map((bu) => bu.User);

    const managers = members.filter(
      (user) => user.role === UserRoles["Manager"],
    );

    return {
      ...rest,
      totalMembers: members.length,
      managers,
    };
  });
};
