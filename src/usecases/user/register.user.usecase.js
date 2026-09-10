import UserRepository from "../../Infra/db/repositories/user/index.js";
import { UserStatus } from "../../shared/application.constants.js";
import bcrypt from "bcryptjs";
import { BadRequestException } from "../../shared/error.js";
import { generateEmployeeCode, generateInviteToken } from "../../shared/utils.js";
import BusinessRepository from "../../Infra/db/repositories/business/index.js";
import { sendInviteEmail } from "../../lib/emails/index.js";

export const RegisterUserUseCase = async (userId, payload) => {
  const existingUser =
    await UserRepository.findUserByEmailAndBusinessIncludingBranches(
      payload.email,
      payload.businessId,
    );

  if (existingUser) {
    const existOnBranch = existingUser.userBranches
      .map((branch) => branch.branchId)
      .includes(payload.branchId);

    if (existOnBranch) {
      throw new BadRequestException("This User Already Exists On This Branch");
    }

    await UserRepository.addUserToBranch({
      userId: existingUser.id,
      branchId: payload.branchId,
      businessId: payload.businessId,
      createdBy: userId,
    });

    return existingUser;
  }

  //need to send inviation link.
  const businessUserCount = await UserRepository.countUsersByBusiness(
    payload.businessId,
  );
  const business = await BusinessRepository.FindBusinessById(
    payload.businessId,
  );

  let additionalDetails = {};

  if (process.env.NODE_ENV !== "production") {
    const hashedPassword = await bcrypt.hash("12345678", 10);
    additionalDetails = {
      password: hashedPassword,
      status: UserStatus["Active"],
    };
  }

  const user = await UserRepository.createUser({
    ...payload,
    userNo: generateEmployeeCode(business.name, businessUserCount + 1),
    businessId: payload.businessId,
    createdBy: userId,
    status: UserStatus["Invitation Pending"],
    inviteSentAt: new Date(),
    ...additionalDetails,
  });
  await UserRepository.addUserToBranch({
    userId: user.id,
    branchId: payload.branchId,
    businessId: payload.businessId,
    createdBy: userId,
  });

  const inviteToken = generateInviteToken({
    purpose: "invite",
    userId: user.id,
    businessId: user.businessId,
    branchId: payload.branchId,
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

  return user;
};
