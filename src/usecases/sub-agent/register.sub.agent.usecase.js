import bcrypt from "bcryptjs";
import SubAgentRepository from "../../Infra/db/repositories/sub-agent/index.js";
import UserRepository from "../../Infra/db/repositories/user/index.js";
import BusinessRepository from "../../Infra/db/repositories/business/index.js";
import BranchRepository from "../../Infra/db/repositories/branch/index.js";
import { UserStatus } from "../../shared/application.constants.js";
import { BadRequestException, NotFoundException } from "../../shared/error.js";
import {
  generateEmployeeCode,
  generateInviteToken,
} from "../../shared/utils.js";
import { sendInviteEmail } from "../../lib/emails/index.js";

export const RegisterSubAgentUseCase = async (req, payload) => {
  const {
    name,
    email,
    phoneNumber,
    role,
    companyName,
    businessId,
    branchId,
    commissionRate,
    targetCountries,
  } = payload;

  // Super Admins have no businessId, so they aren't scoped to one business.
  const actorBusinessId = req.user.businessId || null;
  if (actorBusinessId != null && actorBusinessId !== businessId) {
    throw new NotFoundException("Business not found");
  }

  const existingUser =
    await UserRepository.findUserByEmailAndBusinessIncludingBranches(
      email,
      businessId,
    );
  if (existingUser) {
    throw new BadRequestException("User with this email already exists");
  }

  const business = await BusinessRepository.FindBusinessById(businessId);
  if (!business) {
    throw new NotFoundException("Business not found");
  }

  const branch = await BranchRepository.FindBranchById(branchId, businessId);
  if (!branch) {
    throw new NotFoundException("Branch not found");
  }

  const businessUserCount =
    await UserRepository.countUsersByBusiness(businessId);

  let additionalDetails = {};

  if (process.env.NODE_ENV !== "production") {
    const hashedPassword = await bcrypt.hash("12345678", 10);
    additionalDetails = {
      password: hashedPassword,
      status: UserStatus["Active"],
    };
  }

  const { user, subAgentProfile } = await SubAgentRepository.CreateSubAgent({
    user: {
      name,
      email,
      phoneNumber,
      role,
      businessId,
      branchId,
      userNo: generateEmployeeCode(business.name, businessUserCount + 1),
      createdBy: req.user.id,
      status: UserStatus["Invitation Pending"],
      inviteSentAt: new Date(),
      ...additionalDetails,
    },
    branchId,
    profile: {
      companyName,
      commissionRate,
      targetCountries: targetCountries ?? [],
    },
    createdBy: req.user.id,
  });

  const inviteToken = generateInviteToken({
    purpose: "invite",
    userId: user.id,
    businessId: user.businessId,
    branchId,
  });
  const inviteLink = `${process.env.FRONTEND_DOMAIN}/verify-invite?query=${inviteToken}`;

  try {
    await sendInviteEmail({
      to: user.email,
      businessName: business.name,
      businessLogo: business.businessLogo,
      inviteLink,
    });
  } catch (err) {
    console.error("Failed to send invite email:", err.message);
  }

  return {
    id: user.id,
    userNo: user.userNo,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    status: user.status,
    businessId: user.businessId,
    branchId: user.branchId,
    inviteSentAt: user.inviteSentAt,
    subAgentProfile: {
      id: subAgentProfile.id,
      companyName: subAgentProfile.companyName,
      commissionRate: subAgentProfile.commissionRate,
      targetCountries: subAgentProfile.targetCountries,
    },
  };
};
