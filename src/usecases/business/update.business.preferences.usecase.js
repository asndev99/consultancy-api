import BusinessRepository from "../../Infra/db/repositories/business/index.js";
import { BadRequestException, NotFoundException } from "../../shared/error.js";
import { buildFileUrl } from "../../shared/utils.js";

const LOGO_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const toPreferences = (business) => ({
  id: business.id,
  name: business.name,
  businessLogo: business.businessLogo,
  website: business.website,
  phoneNumber: business.phoneNumber,
  email: business.email,
  address: business.address,
});

export const UpdateBusinessPreferencesUseCase = async (req, payload, file) => {
  const businessId = req.user.businessId;

  if (businessId == null) {
    throw new BadRequestException("User is not associated with a business");
  }

  const business = await BusinessRepository.FindBusinessById(businessId);

  if (!business || business.isDeleted) {
    throw new NotFoundException("Business not found");
  }

  if (file) {
    if (!LOGO_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException("Logo must be JPG, PNG or WebP");
    }
    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException("Logo must be at most 2MB");
    }
  }

  const updateData = {
    updatedBy: req.user.id,
  };

  if (payload.name !== undefined) {
    if (payload.name !== business.name) {
      const existing = await BusinessRepository.findBusinessByName(payload.name);
      if (existing && existing.id !== business.id) {
        throw new BadRequestException("Business with this name already exists");
      }
    }
    updateData.name = payload.name;
  }

  if (payload.website !== undefined) {
    updateData.website = payload.website;
  }

  if (payload.phoneNumber !== undefined) {
    updateData.phoneNumber = payload.phoneNumber;
  }

  if (payload.email !== undefined) {
    updateData.email = payload.email;
  }

  if (payload.address !== undefined) {
    updateData.address = payload.address;
  }

  if (file) {
    updateData.businessLogo = buildFileUrl(file.filename);
  }

  if (Object.keys(updateData).length === 1) {
    throw new BadRequestException("At least one field must be provided to update");
  }

  const updated = await BusinessRepository.UpdateBusinessById(
    businessId,
    updateData,
  );

  return toPreferences(updated);
};
