import LeadFormRepository from "../../Infra/db/repositories/lead-form/index.js";
import { NotFoundException } from "../../shared/error.js";

export const DeleteLeadFormUseCase = async (req, leadFormId) => {
  const businessId = req.user.businessId || null;

  const leadForm = await LeadFormRepository.FindLeadFormById(
    Number(leadFormId),
    businessId,
  );
  if (!leadForm) {
    throw new NotFoundException("Lead form not found");
  }

  return LeadFormRepository.DeleteLeadForm(
    leadForm.id,
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.user.id,
    },
    businessId,
  );
};
