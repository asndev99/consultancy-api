import UserRepository from "../../Infra/db/repositories/user/index.js";
import { BadRequestException, NotFoundException } from "../../shared/error.js";

export const UpdateUserUseCase = async (
  userId,
  targetUserId,
  businessId,
  payload,
) => {
  const existingUser = await UserRepository.findUserById(targetUserId);

  if (!existingUser) {
    throw new NotFoundException("User not found");
  }

  // Super Admins have no businessId, so they aren't scoped to one business.
  if (businessId != null && existingUser.businessId !== businessId) {
    throw new NotFoundException("User not found");
  }

  const updateData = {
    name: payload.name,
    phoneNumber: payload.phoneNumber,
    role: payload.role,
    updatedBy: userId,
    updatedAt: new Date(),
  };

  const isEmailChanged = payload.email && payload.email !== existingUser.email;

  if (isEmailChanged) {
    const emailTaken =
      await UserRepository.findUserByEmailAndBusinessIncludingBranches(
        payload.email,
        existingUser.businessId,
      );

    if (emailTaken) {
      throw new BadRequestException(
        "A user with this email already exists in this business",
      );
    }

    updateData.email = payload.email;
    updateData.previousEmailAddress = existingUser.email;
  }

  return UserRepository.updateUserById(targetUserId, updateData);
};
