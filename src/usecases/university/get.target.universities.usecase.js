import UniversityRepository from "../../Infra/db/repositories/university/index.js";

// Fetches target universities for a student: no pagination, searches
// university name, country, and course titles. An empty/nullable
// searchTerm returns every university along with its courses.
export async function GetTargetUniversitiesUseCase(businessId, searchTerm) {
  return UniversityRepository.findTargetUniversitiesByBusinessId(
    +businessId,
    searchTerm,
  );
}
