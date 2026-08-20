import UniversityRepository from "../../Infra/db/repositories/university/index.js";

export async function EditUniversityRequirementUseCase(
  userId,
  requirementId,
  payload,
) {
  return UniversityRepository.updateUniversityRequirement(requirementId, {
    ...payload,
    updatedBy: userId,
  });
}
