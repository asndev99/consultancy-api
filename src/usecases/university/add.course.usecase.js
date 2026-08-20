import UniversityRepository from "../../Infra/db/repositories/university/index.js";

export async function AddUniversityCourseUseCase(userId, data) {
  return UniversityRepository.createUniversityCourse({
    ...data,
    createdBy: userId,
  });
}
