import UniversityRepository from "../../Infra/db/repositories/university/index.js";

export async function AddUniversityUseCase(req) {
  return UniversityRepository.createUniversity({
    ...req.body,
    createdBy: req.user.id,
  });
}
