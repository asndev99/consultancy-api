import UniversityRepository from "../../Infra/db/repositories/university/index.js";

export async function DeleteUniversityRequirementUseCase(
  userId,
  requirementId,
) {
  return UniversityRepository.softDeleteUniversityRequirement(
    requirementId,
    userId,
  );
}
