import UserRepository from "../../Infra/db/repositories/user/index.js";
import { UserStatus } from "../../shared/application.constants.js";
import bcrypt from "bcryptjs";

export const RegisterUserUseCase = async (req, payload) => {
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  return UserRepository.createUser({
    ...payload,
    password: hashedPassword,
    businessId: payload.businessId,
    createdBy: req.user.id,
    status: UserStatus["Invitation Pending"],
    inviteSentAt: new Date(),
  });
};
