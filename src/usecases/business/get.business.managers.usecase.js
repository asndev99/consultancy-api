import BusinessRepository from "../../Infra/db/repositories/business/index.js";

export const GetBusinessManagersUseCase = async (businessId) => {
  return BusinessRepository.GetManagersByBusiness(businessId);
};
