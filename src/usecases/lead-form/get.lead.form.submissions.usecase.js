import LeadFormRepository from "../../Infra/db/repositories/lead-form/index.js";
import { NotFoundException } from "../../shared/error.js";

export const GetLeadFormSubmissionsUseCase = async (req, leadFormId) => {
  const businessId = req.user.businessId || null;

  const leadForm = await LeadFormRepository.FindLeadFormById(
    Number(leadFormId),
    businessId,
  );
  if (!leadForm) {
    throw new NotFoundException("Lead form not found");
  }

  const submissions =
    await LeadFormRepository.FindLeadFormSubmissionsByFormId(leadForm.id);

  // Every column (syncStatus, failedReason, etc.) is fetched from the DB,
  // but only these are safe to send to the frontend.
  return submissions.map((submission) => ({
    name: submission.fullName,
    email: submission.email,
    phone: submission.phoneNo,
    createdAt: submission.createdAt,
  }));
};
