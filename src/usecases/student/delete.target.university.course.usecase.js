import StudentRepository from "../../Infra/db/repositories/student/index.js";
import { NotFoundException } from "../../shared/error.js";

// Hard deletes a single course from a target university section.
export const DeleteTargetUniversityCourseUseCase = async (
  req,
  studentId,
  targetUniversityId,
  targetCourseId,
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

  const targetCourse = await StudentRepository.FindTargetCourseById(
    Number(targetCourseId),
  );

  if (
    !targetCourse ||
    targetCourse.targetUniversityId !== targetUniversity.id
  ) {
    throw new NotFoundException("Target course not found");
  }

  return StudentRepository.DeleteTargetCourse(targetCourse.id);
};
