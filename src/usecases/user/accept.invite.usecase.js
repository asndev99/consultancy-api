import bcrypt from "bcryptjs";
import UserRepository from "../../Infra/db/repositories/user/index.js";
import { UserStatus } from "../../shared/application.constants.js";
import {
  BadRequestException,
  UnauthorizedException,
} from "../../shared/error.js";
import { verifyToken } from "../../shared/utils.js";

export const AcceptInviteUseCase = async (token, password) => {
  if (!token) {
    throw new BadRequestException("Invite token is required");
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    throw new UnauthorizedException(err.message);
  }

  if (payload.purpose !== "invite") {
    throw new UnauthorizedException("Invalid invite token");
  }

  const user = await UserRepository.findUserById(payload.userId);

  if (
    !user ||
    user.isDeleted ||
    user.businessId !== payload.businessId ||
    user.branchId !== payload.branchId
  ) {
    throw new BadRequestException("Invalid invite token");
  }

  // Invite tokens stay valid until they expire, so without this an old link
  // could be replayed to reset the password of an already-active user.
  if (user.status !== UserStatus["Invitation Pending"]) {
    throw new BadRequestException("This invite has already been used");
  }

  // Resending an invite moves inviteSentAt forward, so only the latest link
  // works. JWT iat is in whole seconds, hence the floor.
  if (
    user.inviteSentAt &&
    payload.iat < Math.floor(user.inviteSentAt.getTime() / 1000)
  ) {
    throw new BadRequestException(
      "This invite link has been replaced by a newer one",
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const updatedUser = await UserRepository.updateUserById(user.id, {
    password: hashedPassword,
    isActive: true,
    status: UserStatus.Active,
    inviteAcceptedAt: new Date(),
    // The invite link was delivered to this address, so it's verified.
    isEmailVerified: true,
  });

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    isActive: updatedUser.isActive,
    status: updatedUser.status,
  };
};
