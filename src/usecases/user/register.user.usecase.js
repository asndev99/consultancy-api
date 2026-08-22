import UserRepository from "../../Infra/db/repositories/user/index.js";
import { UserStatus } from "../../shared/application.constants.js";
import bcrypt from "bcryptjs";
import { BadRequestException } from "../../shared/error.js";
import { generateEmployeeCode } from "../../shared/utils.js";
import BusinessRepository from "../../Infra/db/repositories/business/index.js";

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

    return UserRepository.addUserToBranch({
      userId: existingUser.id,
      branchId: payload.branchId,
      businessId: payload.businessId,
      createdBy: userId,
    });
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

  const user = UserRepository.createUser({
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
  return user;
};
