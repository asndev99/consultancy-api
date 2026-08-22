import UserRepository from "../../Infra/db/repositories/user/index.js";

export const DeleteUserByBusinessUseCase = async (
  updatedBy,
  userId,
  businessId,
) => {
  return UserRepository.DeleteUserByBusiness(updatedBy, userId, businessId);
};
