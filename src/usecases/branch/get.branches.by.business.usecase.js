import BranchRepository from "../../Infra/db/repositories/branch/index.js";

export const GetBranchesByBusinessUseCase = async (businessId) => {
  const data =
    await BranchRepository.GetBranchesByBusinessIdIncludingUsers(businessId);

  if (!data) {
    return [];
  }

  return data.map((item) => {
    const { users, ...rest } = item;
    return {
      ...rest,
      totalMembers: users?.length ?? 0,
    };
  });
};
