import UniversityRepository from "../../Infra/db/repositories/university/index.js";

export async function AddUniversityUseCase(payload) {
  const data = await UniversityRepository.createUniversity(payload);
}
