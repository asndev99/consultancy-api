import UniversityRepository from "../../Infra/db/repositories/university/index.js";
import { ForBiddenException } from "../../shared/error.js";

export async function AddUniversityCourseUseCase(req) {
  if (req.user.role !== "Super Admin") {
    const university = await UniversityRepository.findUniversityById(
      req.body.univeristyId,
    );

    if (!university || university.businessId !== req.user.businessId) {
      throw new ForBiddenException("Forbidden!");
    }
  }
  return UniversityRepository.createUniversityCourse({
    ...req.body,
    createdBy: req.user.id,
  });
}
