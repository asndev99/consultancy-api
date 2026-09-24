import LeadFormRepository from "../../Infra/db/repositories/lead-form/index.js";
import { NotFoundException } from "../../shared/error.js";

export const UpdateLeadFormStatusUseCase = async (
  req,
  leadFormId,
  isActive,
) => {
  const businessId = req.user.businessId || null;

  const leadForm = await LeadFormRepository.FindLeadFormById(
    Number(leadFormId),
    businessId,
  );
  if (!leadForm) {
    throw new NotFoundException("Lead form not found");
  }

  return LeadFormRepository.UpdateLeadForm(
    leadForm.id,
    {
      isActive,
      updatedBy: req.user.id,
    },
    businessId,
  );
};
