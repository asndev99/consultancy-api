import StudentRepository from "../../Infra/db/repositories/student/index.js";
import UniversityRepository from "../../Infra/db/repositories/university/index.js";
import { BadRequestException, NotFoundException } from "../../shared/error.js";

// removedUniversities/removedCourses (targetUniversityId / targetCourseId,
// i.e. the join-row ids also used by the single-item DELETE endpoints) are
// applied first. TargetCourse.TargetUniversity is onDelete: Cascade, so
// removing a target university also removes its courses - any id in
// removedCourses that was already cascaded away is skipped rather than
// raising an error.
export const UpdateTargetUniversitiesUseCase = async (
  req,
  studentId,
  payload,
) => {
  const student = await StudentRepository.FindStudentById(
    Number(studentId),
    req.user.businessId,
  );

  if (!student) {
    throw new NotFoundException("Student not found");
  }

  const {
    targetUniversities,
    removedUniversities = [],
    removedCourses = [],
  } = payload;

  for (const targetUniversityId of removedUniversities) {
    const targetUniversity = await StudentRepository.FindTargetUniversityById(
      Number(targetUniversityId),
    );

    if (!targetUniversity || targetUniversity.studentId !== student.id) {
      throw new NotFoundException(
        `Target university ${targetUniversityId} not found`,
      );
    }

    await StudentRepository.DeleteTargetUniversity(targetUniversity.id);
  }

  for (const targetCourseId of removedCourses) {
    const targetCourse = await StudentRepository.FindTargetCourseById(
      Number(targetCourseId),
    );

    if (!targetCourse) {
      continue;
    }

    const targetUniversity = await StudentRepository.FindTargetUniversityById(
      targetCourse.targetUniversityId,
    );

    if (!targetUniversity || targetUniversity.studentId !== student.id) {
      throw new NotFoundException(`Target course ${targetCourseId} not found`);
    }

    await StudentRepository.DeleteTargetCourse(targetCourse.id);
  }

  await Promise.all(
    targetUniversities.map(async ({ universityId }) => {
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
    targetUniversities.flatMap(({ universityId, courseIds = [] }) =>
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
    targetUniversities.map(({ universityId }) => ({
      studentId: student.id,
      universityId: Number(universityId),
      createdBy: req.user.id,
    })),
  );

  const createdTargetUniversities =
    await StudentRepository.FindTargetUniversitiesByStudentAndUniversityIds(
      student.id,
      targetUniversities.map(({ universityId }) => Number(universityId)),
    );

  const targetUniversityIdByUniversityId = new Map(
    createdTargetUniversities.map((tu) => [tu.universityId, tu.id]),
  );

  const targetCourseRows = targetUniversities.flatMap(
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
