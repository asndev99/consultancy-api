import UserRepository from "../../Infra/db/repositories/user/index.js";
import { NotFoundException } from "../../shared/error.js";

export const GetMyProfileUseCase = async (req) => {
  const user = await UserRepository.findUserById(Number(req.user.id));

  if (!user || user.isDeleted) {
    throw new NotFoundException("User not found");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    profileMedia: user.profileMedia,
  };
};
