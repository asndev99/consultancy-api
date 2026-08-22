import BusinessRepository from "../../Infra/db/repositories/business/index.js";

export const GetUsersByBusinessUseCase = async (businessId) => {
  const users =
    await BusinessRepository.getUsersByBusinessId(Number(businessId));

  return users.map(({ userBranches, ...user }) => ({
    ...user,
    branches: userBranches.map((userBranch) => userBranch.Branch),
  }));
};
