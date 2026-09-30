import bcrypt from "bcryptjs";
import UserRepository from "../../Infra/db/repositories/user/index.js";
import { BadRequestException, NotFoundException } from "../../shared/error.js";

export const ChangePasswordUseCase = async (
  req,
  currentPassword,
  newPassword,
) => {
  const user = await UserRepository.findUserById(Number(req.user.id));

  if (!user || user.isDeleted) {
    throw new NotFoundException("User not found");
  }

  // Invited users have no password until they accept the invite.
  if (!user.password) {
    throw new BadRequestException("Password has not been set for this account");
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password,
  );

  if (!isCurrentPasswordValid) {
    throw new BadRequestException("Current password is incorrect");
  }

  if (currentPassword === newPassword) {
    throw new BadRequestException(
      "New password must be different from the current password",
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await UserRepository.updateUserById(user.id, {
    password: hashedPassword,
    passwordChangedAt: new Date(),
    updatedBy: req.user.id,
  });

  return { id: user.id };
};
