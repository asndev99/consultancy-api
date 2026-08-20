import UniversityRepository from "../../Infra/db/repositories/university/index.js";

export async function EditUniversityUseCase(userId, universityId, payload) {
  return UniversityRepository.update(universityId, {
    ...payload,
    updatedBy: userId,
  });
}
