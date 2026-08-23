import UniversityRepository from "../../Infra/db/repositories/university/index.js";
import { NotFoundException } from "../../shared/error.js";

export async function DeleteUniversityRequirementUseCase(req) {
  if (req.user.role !== "Super Admin") {
    const university = await UniversityRepository.findUniversityById(
      +req.query.universityId,
    );

    if (!university || university.businessId !== req.user.businessId) {
      throw new NotFoundException("Forbidden!");
    }
  }
  return UniversityRepository.softDeleteUniversityRequirement(
    +req.params.requirementId,
    req.user.id,
  );
}
