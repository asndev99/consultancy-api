import UniversityRepository from "../../Infra/db/repositories/university/index.js";

export async function GetUniversityDetailsUseCase(universityId) {
  return UniversityRepository.findUniversityDetailsById(universityId);
}
