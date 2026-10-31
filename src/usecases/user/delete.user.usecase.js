import UserRepository from "../../Infra/db/repositories/user/index.js";
import { revokeUserSessions } from "../session/auth.session.js";

export const DeleteUserByBusinessUseCase = async (
  updatedBy,
  userId,
  businessId,
) => {
  const deletedUser = await UserRepository.DeleteUserByBusiness(
    updatedBy,
    userId,
    businessId,
  );

  await revokeUserSessions(deletedUser.id);

  return deletedUser;
};
