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

  // Maps to the TargetUniversity/TargetCourse row ids (not the underlying
  // University/Course ids) so selected items can be identified for
  // update/delete without a further lookup.
  const targetUniversityIdByUniversityId = new Map(
    studentTargetUniversities.map((tu) => [tu.universityId, tu.id]),
  );

  const targetCourseIdByCourseIdByUniversityId = new Map(
    studentTargetUniversities.map((tu) => [
      tu.universityId,
      new Map(tu.targetCourses.map((tc) => [tc.courseId, tc.id])),
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

    const targetUniversityId = targetUniversityIdByUniversityId.get(
      university.id,
    );
    const targetCourseIdByCourseId =
      targetCourseIdByCourseIdByUniversityId.get(university.id) ?? new Map();

    return courses.map((course) => {
      const targetCourseId = targetCourseIdByCourseId.get(course.id);
      const isSelected = targetCourseId != null;

      return {
        ...course,
        isSelected,
        ...(isSelected ? { targetUniversityId, targetCourseId } : {}),
      };
    });
  }

  const universities =
    await UniversityRepository.findTargetUniversitiesByBusinessId(
      +businessId,
      searchTerm,
    );

  return universities.map(({ universityCourses, ...university }) => {
    const targetUniversityId = targetUniversityIdByUniversityId.get(
      university.id,
    );
    const isUniversitySelected = targetUniversityId != null;
    const targetCourseIdByCourseId =
      targetCourseIdByCourseIdByUniversityId.get(university.id) ?? new Map();

    return {
      ...university,
      isSelected: isUniversitySelected,
      ...(isUniversitySelected ? { targetUniversityId } : {}),
      universityCourses: universityCourses.map((course) => {
        const targetCourseId = targetCourseIdByCourseId.get(course.id);
        const isSelected = targetCourseId != null;

        return {
          ...course,
          isSelected,
          ...(isSelected ? { targetCourseId } : {}),
        };
      }),
    };
  });
}
