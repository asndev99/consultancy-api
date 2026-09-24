import UniversityRepository from "../../Infra/db/repositories/university/index.js";
import { NotFoundException, ForBiddenException } from "../../shared/error.js";

export async function EditUniversityCourseUseCase(req) {
  const course = await UniversityRepository.findUniversityCourseById(
    +req.params.courseId,
  );

  if (!course) {
    throw new NotFoundException("Course not found");
  }

  if (
    req.user.role !== "Super Admin" &&
    course.businessId !== req.user.businessId
  ) {
    throw new ForBiddenException("Forbidden!");
  }

  const { intakeDates, ...body } = req.body;

  return UniversityRepository.updateUniversityCourse(course.id, {
    ...body,
    updatedBy: req.user.id,
    ...(Array.isArray(intakeDates) && intakeDates.length > 0
      ? { intakeDates, universityId: course.universityId }
      : {}),
  });
}
