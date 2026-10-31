import bcrypt from "bcryptjs";
import UserRepository from "../../Infra/db/repositories/user/index.js";
import {
  BadRequestException,
  UnauthorizedException,
} from "../../shared/error.js";
import {
  cacheUserAuthContext,
  createSession,
  resolveAssignedBranches,
} from "../session/auth.session.js";

export const LoginUserUseCase = async (payload, clientInfo = {}) => {
  const { email, password } = payload;

  const user = await UserRepository.findUserByEmail(email);

  if (!user) {
    throw new BadRequestException("Invalid email or password");
  }

  if (!user.isActive) {
    throw new BadRequestException(
      "Please verify your email, or your account has been deactivated. Contact support.",
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new BadRequestException("Invalid email or password");
  }

  const assignedBranches = await resolveAssignedBranches(user);

  // Warm the cache so the first authenticated request needs no DB lookup.
  await cacheUserAuthContext(user, assignedBranches);

  const { accessToken, refreshToken } = await createSession(
    user.id,
    clientInfo,
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
      assignedBranches,
      name:user.name
    },
    businessName: user.Business?.name ?? null,
    businessLogo: user.Business?.businessLogo ?? null,
    accessToken,
    refreshToken,
  };
};
