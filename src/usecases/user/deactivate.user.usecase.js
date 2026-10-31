import UserRepository from "../../Infra/db/repositories/user/index.js";
import {
  UserRoles,
  UserStatus,
} from "../../shared/application.constants.js";
import {
  BadRequestException,
  ForBiddenException,
  NotFoundException,
} from "../../shared/error.js";
import { revokeUserSessions } from "../session/auth.session.js";

// Deactivated users can't log in (login only accepts Active users) and are
// signed out of every device right away.
export const DeactivateUserUseCase = async (req, userId) => {
  const user = await UserRepository.findUserById(Number(userId));

  // Super Admins have no businessId, so they aren't scoped to one business.
  const businessId = req.user.businessId || null;
  if (
    !user ||
    user.isDeleted ||
    (businessId != null && user.businessId !== businessId)
  ) {
    throw new NotFoundException("User not found");
  }

  if (user.id === req.user.id) {
    throw new BadRequestException("You cannot deactivate your own account");
  }

  if (user.role === UserRoles["Super Admin"]) {
    throw new ForBiddenException("Super Admins cannot be deactivated");
  }

  if (
    user.role === UserRoles["Business Admin"] &&
    req.user.role !== UserRoles["Super Admin"]
  ) {
    throw new ForBiddenException(
      "Only a Super Admin can deactivate a Business Admin",
    );
  }

  if (user.status === UserStatus["Invitation Pending"]) {
    throw new BadRequestException(
      "This user hasn't accepted their invite yet; cancel the invite instead",
    );
  }

  if (user.status === UserStatus.InActive) {
    throw new BadRequestException("User is already deactivated");
  }

  const updatedUser = await UserRepository.updateUserById(user.id, {
    status: UserStatus.InActive,
    isActive: false,
    updatedBy: req.user.id,
  });

  await revokeUserSessions(user.id);

  return {
    id: updatedUser.id,
    status: updatedUser.status,
    isActive: updatedUser.isActive,
  };
};
