import BusinessRepository from "../../Infra/db/repositories/business";

export const GetBusinessManagersUseCase = async (businessId) => {
  return BusinessRepository.GetManagersByBusiness(businessId);
};
