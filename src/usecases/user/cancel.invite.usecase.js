import UserRepository from "../../Infra/db/repositories/user/index.js";
import { UserStatus } from "../../shared/application.constants.js";
import {
  BadRequestException,
  NotFoundException,
  ForBiddenException,
} from "../../shared/error.js";
import { DeleteUserByBusinessUseCase } from "./delete.user.usecase.js";

// Cancelling soft deletes the pending user; AcceptInviteUseCase rejects deleted
// users, so every invite link already sent stops working.
export const CancelInviteUseCase = async (req, userId) => {
  const user = await UserRepository.findUserById(Number(userId));

  if (!user || user.isDeleted) {
    throw new NotFoundException("User not found");
  }

  if (
    req.user.role !== "Super Admin" &&
    user.businessId !== req.user.businessId
  ) {
    throw new ForBiddenException("Forbidden!");
  }

  if (user.status !== UserStatus["Invitation Pending"]) {
    throw new BadRequestException(
      "This user has already accepted their invite",
    );
  }

  return DeleteUserByBusinessUseCase(
    req.user.id,
    user.id,
    req.user.businessId || null,
  );
};
