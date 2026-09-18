import BusinessRepository from "../../Infra/db/repositories/business/index.js";

export const GetAdmissionTeamByBusinessUseCase = async (businessId) => {
  return BusinessRepository.GetAdmissionTeamByBusiness(businessId);
};
