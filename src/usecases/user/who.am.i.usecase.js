import UserRepository from "../../Infra/db/repositories/user/index.js";
import { NotFoundException } from "../../shared/error.js";

export const WhoAmIUseCase = async (req) => {
  const user = await UserRepository.FindUserProfileById(Number(req.user.id));

  if (!user) {
    throw new NotFoundException("User not found");
  }

  const { userBranches, ...profile } = user;

  return {
    ...profile,
    assignedBranches: userBranches
      .map((item) => item.Branch)
      .filter(Boolean),
  };
};
