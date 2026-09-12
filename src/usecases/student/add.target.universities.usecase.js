import StudentRepository from "../../Infra/db/repositories/student/index.js";
import UniversityRepository from "../../Infra/db/repositories/university/index.js";
import { BadRequestException, NotFoundException } from "../../shared/error.js";

// Bulk-adds target universities (and optional initial courses) for a
// student. Existing (studentId, universityId) or (targetUniversityId,
// courseId) rows are skipped at the DB level rather than raising an error.
export const AddTargetUniversitiesUseCase = async (req, studentId, payload) => {
  const student = await StudentRepository.FindStudentById(
    Number(studentId),
    req.user.businessId,
  );

  if (!student) {
    throw new NotFoundException("Student not found");
  }

  await Promise.all(
    payload.map(async ({ universityId }) => {
      const university = await UniversityRepository.findUniversityById(
        Number(universityId),
      );

      if (!university || university.businessId !== student.businessId) {
        throw new BadRequestException(
          `University ${universityId} not found in this business`,
        );
      }
    }),
  );

  await Promise.all(
    payload.flatMap(({ universityId, courseIds = [] }) =>
      courseIds.map(async (courseId) => {
        const course = await UniversityRepository.findUniversityCourseById(
          Number(courseId),
        );

        if (!course || course.universityId !== Number(universityId)) {
          throw new BadRequestException(
            `Course ${courseId} does not belong to university ${universityId}`,
          );
        }
      }),
    ),
  );

  await StudentRepository.CreateTargetUniversities(
    payload.map(({ universityId }) => ({
      studentId: student.id,
      universityId: Number(universityId),
      createdBy: req.user.id,
    })),
  );

  const targetUniversities =
    await StudentRepository.FindTargetUniversitiesByStudentAndUniversityIds(
      student.id,
      payload.map(({ universityId }) => Number(universityId)),
    );

  const targetUniversityIdByUniversityId = new Map(
    targetUniversities.map((tu) => [tu.universityId, tu.id]),
  );

  const targetCourseRows = payload.flatMap(
    ({ universityId, courseIds = [] }) =>
      courseIds.map((courseId) => ({
        targetUniversityId: targetUniversityIdByUniversityId.get(
          Number(universityId),
        ),
        courseId: Number(courseId),
        createdBy: req.user.id,
      })),
  );

  if (targetCourseRows.length > 0) {
    await StudentRepository.CreateTargetCourses(targetCourseRows);
  }

  return StudentRepository.FindTargetUniversitiesByStudentId(student.id);
};
