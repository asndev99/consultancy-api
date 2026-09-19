import LeadFormRepository from "../../Infra/db/repositories/lead-form/index.js";
import { NotFoundException } from "../../shared/error.js";

export const GetPublicLeadFormUseCase = async (publicId) => {
  const leadForm =
    await LeadFormRepository.FindPublicLeadFormByPublicId(publicId);

  if (!leadForm) {
    throw new NotFoundException("Lead form not found");
  }

  return leadForm;
};
