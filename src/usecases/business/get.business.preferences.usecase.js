import BusinessRepository from "../../Infra/db/repositories/business/index.js";
import { BadRequestException, NotFoundException } from "../../shared/error.js";

const toPreferences = (business) => ({
  id: business.id,
  name: business.name,
  businessLogo: business.businessLogo,
  website: business.website,
  phoneNumber: business.phoneNumber,
  email: business.email,
  address: business.address,
});

export const GetBusinessPreferencesUseCase = async (req) => {
  const businessId = req.user.businessId;

  if (businessId == null) {
    throw new BadRequestException("User is not associated with a business");
  }

  const business = await BusinessRepository.FindBusinessById(businessId);

  if (!business || business.isDeleted) {
    throw new NotFoundException("Business not found");
  }

  return toPreferences(business);
};
