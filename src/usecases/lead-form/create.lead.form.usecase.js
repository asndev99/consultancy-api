import LeadFormRepository from "../../Infra/db/repositories/lead-form/index.js";
import BusinessRepository from "../../Infra/db/repositories/business/index.js";
import BranchRepository from "../../Infra/db/repositories/branch/index.js";
import { NotFoundException, BadRequestException } from "../../shared/error.js";
import { LeadFormType } from "../../shared/application.constants.js";

export const CreateLeadFormUseCase = async (req, payload) => {
  const businessId = req.user.businessId;
  const {
    branchId,
    type,
    name,
    utmSource,
    targetDegreeLevel,
    targetCountries,
  } = payload;

  const business = await BusinessRepository.FindBusinessById(businessId);
  if (!business) {
    throw new NotFoundException("Business not found");
  }

  if (type === LeadFormType.BRANCH_LEVEL) {
    if (!branchId) {
      throw new BadRequestException(
        "branchId is required when leadFormType is BRANCH_LEVEL",
      );
    }

    const branch = await BranchRepository.FindBranchById(
      branchId,
      businessId,
    );
    if (!branch) {
      throw new NotFoundException("Branch not found");
    }
  }

  return LeadFormRepository.CreateLeadForm({
    name,
    utmSource,
    type,
    businessId,
    branchId: type === LeadFormType.BRANCH_LEVEL ? branchId : null,
    targetDegreeLevel,
    targetCountries: targetCountries ?? [],
    createdBy: req.user.id,
  });
};
