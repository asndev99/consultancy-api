import UserRepository from "../../Infra/db/repositories/user/index.js";
import BusinessRepository from "../../Infra/db/repositories/business/index.js";
import { UserStatus } from "../../shared/application.constants.js";
import {
  BadRequestException,
  NotFoundException,
  ForBiddenException,
} from "../../shared/error.js";
import { generateInviteToken } from "../../shared/utils.js";
import { sendInviteEmail } from "../../lib/emails/index.js";

export const ResendInviteUseCase = async (req, userId) => {
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

  const business = await BusinessRepository.FindBusinessById(
    user.businessId,
  );

  const inviteToken = generateInviteToken({
    purpose: "invite",
    userId: user.id,
    businessId: user.businessId,
    branchId: user.branchId,
  });
  const inviteLink = `${process.env.FRONTEND_DOMAIN}/verify-invite?query=${inviteToken}`;

  await sendInviteEmail({
    to: user.email,
    businessName: business.name,
    businessLogo: business.businessLogo,
    inviteLink,
  });

  return UserRepository.updateUserById(user.id, { inviteSentAt: new Date() });
};
