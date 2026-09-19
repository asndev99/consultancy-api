import LeadFormRepository from "../../Infra/db/repositories/lead-form/index.js";
import { NotFoundException } from "../../shared/error.js";

export const EditLeadFormUseCase = async (req, leadFormId, payload) => {
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
      ...payload,
      updatedBy: req.user.id,
    },
    businessId,
  );
};
