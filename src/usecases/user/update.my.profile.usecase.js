import UserRepository from "../../Infra/db/repositories/user/index.js";
import { BadRequestException, NotFoundException } from "../../shared/error.js";
import { invalidateUserAuthContext } from "../session/auth.session.js";
import { buildFileUrl } from "../../shared/utils.js";

const PROFILE_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const UpdateMyProfileUseCase = async (req, payload, file) => {
  const userId = Number(req.user.id);
  const existingUser = await UserRepository.findUserById(userId);

  if (!existingUser || existingUser.isDeleted) {
    throw new NotFoundException("User not found");
  }

  if (file) {
    if (!PROFILE_IMAGE_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException("Profile image must be JPG, PNG or WebP");
    }
    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException("Profile image must be at most 2MB");
    }
  }

  const updateData = {
    updatedBy: userId,
    updatedAt: new Date(),
  };

  if (payload.name !== undefined) {
    updateData.name = payload.name;
  }

  if (payload.phoneNumber !== undefined) {
    updateData.phoneNumber = payload.phoneNumber;
  }

  if (file) {
    updateData.profileMedia = buildFileUrl(file.filename);
  }

  if (Object.keys(updateData).length === 2) {
    throw new BadRequestException(
      "At least one field or profile image must be provided to update",
    );
  }

  const updatedUser = await UserRepository.updateUserById(userId, updateData);

  await invalidateUserAuthContext(updatedUser.id);

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    phoneNumber: updatedUser.phoneNumber,
    profileMedia: updatedUser.profileMedia,
  };
};
