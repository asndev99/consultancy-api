import StudentRepository from "../../Infra/db/repositories/student/index.js";
import { NotFoundException } from "../../shared/error.js";

export const GetTargetUniversitiesUseCase = async (req, studentId) => {
  const student = await StudentRepository.FindStudentById(
    Number(studentId),
    req.user.businessId,
  );

  if (!student) {
    throw new NotFoundException("Student not found");
  }

  return StudentRepository.FindTargetUniversitiesByStudentId(student.id);
};
