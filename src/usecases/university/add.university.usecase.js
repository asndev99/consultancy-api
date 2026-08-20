import UniversityRepository from "../../Infra/db/repositories/university/index.js";

export async function AddUniversityUseCase(userId, payload) {
  return UniversityRepository.createUniversity({
    ...payload,
    createdBy: userId,
  });
}
