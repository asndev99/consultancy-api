import BusinessRepository from "../../Infra/db/repositories/business/index.js";
import { BadRequestException } from "../../shared/error.js";
import { generateBusinessCode } from "../../shared/utils.js";

export const RegisterBusinessUseCase = async (req, payload) => {
  const business = await BusinessRepository.findBusinessByName(
    payload.businessName,
  );

  if (business) {
    throw new BadRequestException("Business with this name already exists");
  }

  return BusinessRepository.RegisterBusiness({
    ...payload,
    createdBy: req.user.id,
    businessCode: generateBusinessCode(payload.businessName),
  });
};
