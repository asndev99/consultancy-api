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
import { invalidateUserAuthContext } from "../session/auth.session.js";

// Reverses DeactivateUserUseCase. Deactivation revoked every session, so the
// user simply logs in again afterwards.
export const ActivateUserUseCase = async (req, userId) => {
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

  if (
    user.role === UserRoles["Business Admin"] &&
    req.user.role !== UserRoles["Super Admin"]
  ) {
    throw new ForBiddenException(
      "Only a Super Admin can activate a Business Admin",
    );
  }

  if (user.status === UserStatus["Invitation Pending"]) {
    throw new BadRequestException(
      "This user hasn't accepted their invite yet; they become active when they do",
    );
  }

  if (user.status !== UserStatus.InActive) {
    throw new BadRequestException("User is not deactivated");
  }

  const updatedUser = await UserRepository.updateUserById(user.id, {
    status: UserStatus.Active,
    isActive: true,
    updatedBy: req.user.id,
  });

  await invalidateUserAuthContext(user.id);

  return {
    id: updatedUser.id,
    status: updatedUser.status,
    isActive: updatedUser.isActive,
  };
};
