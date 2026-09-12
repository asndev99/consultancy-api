import StudentRepository from "../../Infra/db/repositories/student/index.js";
import UniversityRepository from "../../Infra/db/repositories/university/index.js";
import { BadRequestException, NotFoundException } from "../../shared/error.js";

// Adds one or more courses to an existing target university section.
// Courses already attached to this target university are skipped at the DB
// level rather than raising an error.
export const AddTargetUniversityCoursesUseCase = async (
  req,
  studentId,
  targetUniversityId,
  courseIds,
) => {
  const student = await StudentRepository.FindStudentById(
    Number(studentId),
    req.user.businessId,
  );

  if (!student) {
    throw new NotFoundException("Student not found");
  }

  const targetUniversity = await StudentRepository.FindTargetUniversityById(
    Number(targetUniversityId),
  );

  if (!targetUniversity || targetUniversity.studentId !== student.id) {
    throw new NotFoundException("Target university not found");
  }

  await Promise.all(
    courseIds.map(async (courseId) => {
      const course = await UniversityRepository.findUniversityCourseById(
        Number(courseId),
      );

      if (!course || course.universityId !== targetUniversity.universityId) {
        throw new BadRequestException(
          `Course ${courseId} does not belong to this target university`,
        );
      }
    }),
  );

  await StudentRepository.CreateTargetCourses(
    courseIds.map((courseId) => ({
      targetUniversityId: targetUniversity.id,
      courseId: Number(courseId),
      createdBy: req.user.id,
    })),
  );

  return StudentRepository.FindTargetUniversityWithCoursesById(
    targetUniversity.id,
  );
};
