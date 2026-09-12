import StudentRepository from "../../Infra/db/repositories/student/index.js";
import { NotFoundException } from "../../shared/error.js";

// Hard deletes a target university section. TargetCourse.TargetUniversity is
// onDelete: Cascade, so this also removes all of its target courses.
export const DeleteTargetUniversityUseCase = async (
  req,
  studentId,
  targetUniversityId,
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

  return StudentRepository.DeleteTargetUniversity(targetUniversity.id);
};
