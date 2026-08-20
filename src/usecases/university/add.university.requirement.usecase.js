import UniversityRepository from "../../Infra/db/repositories/university/index.js";

export async function AddUniversityRequirementUseCase(userId, payload) {
  return UniversityRepository.createUniversityRequirement({
    ...payload,
    createdBy: userId,
  });
}
