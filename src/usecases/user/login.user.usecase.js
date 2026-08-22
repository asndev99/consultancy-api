import bcrypt from "bcryptjs";
import UserRepository from "../../Infra/db/repositories/user/index.js";
import {
  BadRequestException,
  UnauthorizedException,
} from "../../shared/error.js";
import { generateToken, generateRefreshToken } from "../../shared/utils.js";

export const LoginUserUseCase = async (payload) => {
  const { email, password } = payload;

  const user = await UserRepository.findUserByEmail(email);

  // if (!user.isActive) {
  //   throw new BadRequestException(
  //     "Please Verify Your Email, Or Your Account has been deactivated.. Contact Support",
  //   );
  // }

  if (!user) {
    throw new BadRequestException("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new BadRequestException("Invalid email or password");
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    businessId: user.businessId,
    branchId: user.branchId,
  };

  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return { accessToken, refreshToken };
};
