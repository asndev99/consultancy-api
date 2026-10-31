import UserRepository from "../../Infra/db/repositories/user/index.js";
import { NotFoundException } from "../../shared/error.js";
import { resolveAssignedBranches } from "../session/auth.session.js";

export const WhoAmIUseCase = async (req) => {
  const user = await UserRepository.FindUserProfileById(Number(req.user.id));

  if (!user) {
    throw new NotFoundException("User not found");
  }

  const { userBranches, ...profile } = user;

  // Same rules as login and req.user, so all three always agree.
  const branches = await resolveAssignedBranches(user);

  return {
    ...profile,
    assignedBranches: branches.map(({ id, name }) => ({ id, name })),
  };
};
