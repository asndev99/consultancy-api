import UniversityRepository from "../../Infra/db/repositories/university/index.js";
import StudentRepository from "../../Infra/db/repositories/student/index.js";
import { BadRequestException, NotFoundException } from "../../shared/error.js";

// Fetches target universities for a student, annotated with isSelected
// based on the student's current TargetUniversity/TargetCourse rows.
// - universityId omitted: searches/lists every university in the business
//   (matching university name, country, or course title), each with its
//   full course list and an isSelected flag at both the university and
//   course level.
// - universityId provided: searches only that university's courses by
//   title and returns a bare array of courses with isSelected.
export async function GetTargetUniversitiesUseCase(
  businessId,
  studentId,
  { searchTerm, universityId } = {},
) {
  if (!studentId) {
    throw new BadRequestException("studentId is required");
  }

  const student = await StudentRepository.FindStudentById(
    Number(studentId),
    businessId,
  );
  if (!student) {
    throw new NotFoundException("Student not found");
  }

  const studentTargetUniversities =
    await StudentRepository.FindTargetUniversitiesByStudentId(student.id);

  const selectedUniversityIds = new Set(
    studentTargetUniversities.map((tu) => tu.universityId),
  );

  const selectedCourseIdsByUniversityId = new Map(
    studentTargetUniversities.map((tu) => [
      tu.universityId,
      new Set(tu.targetCourses.map((tc) => tc.courseId)),
    ]),
  );

  if (universityId != null) {
    const university = await UniversityRepository.findUniversityById(
      Number(universityId),
    );
    if (
      !university ||
      (businessId != null && university.businessId !== +businessId)
    ) {
      throw new NotFoundException("University not found");
    }

    const courses =
      await UniversityRepository.findUniversityCoursesByUniversityId(
        university.id,
        searchTerm,
      );

    const selectedCourseIds =
      selectedCourseIdsByUniversityId.get(university.id) ?? new Set();

    return courses.map((course) => ({
      ...course,
      isSelected: selectedCourseIds.has(course.id),
    }));
  }

  const universities =
    await UniversityRepository.findTargetUniversitiesByBusinessId(
      +businessId,
      searchTerm,
    );

  return universities.map(({ universityCourses, ...university }) => {
    const selectedCourseIds =
      selectedCourseIdsByUniversityId.get(university.id) ?? new Set();

    return {
      ...university,
      isSelected: selectedUniversityIds.has(university.id),
      universityCourses: universityCourses.map((course) => ({
        ...course,
        isSelected: selectedCourseIds.has(course.id),
      })),
    };
  });
}
