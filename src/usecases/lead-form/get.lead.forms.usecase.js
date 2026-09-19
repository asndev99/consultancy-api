import LeadFormRepository from "../../Infra/db/repositories/lead-form/index.js";

// branchId is optional - when provided, results are filtered to that
// branch; otherwise every lead form in the business is returned.
export const GetLeadFormsUseCase = async (req, branchId) => {
  return LeadFormRepository.FindLeadForms(
    req.user.businessId || null,
    branchId != null ? Number(branchId) : undefined,
  );
};
