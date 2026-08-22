import bcrypt from "bcryptjs";
import UserRepository from "../../Infra/db/repositories/user/index.js";
import {
  BadRequestException,
  UnauthorizedException,
} from "../../shared/error.js";
import { generateToken, generateRefreshToken } from "../../shared/utils.js";
import { UserRoles } from "../../shared/application.constants.js";

export const LoginUserUseCase = async (payload) => {
  
  const { email, password } = payload;

  const user = await UserRepository.findUserByEmail(email);

  if (!user) {
    throw new BadRequestException("Invalid email or password");
  }

  // if (!user.isActive) {
  //   throw new BadRequestException(
  //     "Please verify your email, or your account has been deactivated. Contact support.",
  //   );
  // }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new BadRequestException("Invalid email or password");
  }

  let assignedBranches = [];

  if (
    user.role == UserRoles.Counselor ||
    user.role == UserRoles["Manager"] ||
    user.role == UserRoles["Admission Team"]
  ) {
    const userBranches =
      await UserRepository.FindAssignedBranchesToUserByUserId(user.id);

    assignedBranches = userBranches
      .map((item) => item.Branch)
      .filter((branch) => branch && !branch.isDeleted);
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    businessId: user.businessId,
    assignedBranches,
  };

  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
      assignedBranches,
    },
    accessToken,
    refreshToken,
  };
};
