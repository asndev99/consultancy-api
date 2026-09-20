import StudentRepository from "../../Infra/db/repositories/student/index.js";
import { NotFoundException } from "../../shared/error.js";

export const GetStudentByIdUseCase = async (req, studentId, branchId) => {
  const student = await StudentRepository.FindStudentDetailsByIdAndBranch(
    Number(studentId),
    Number(branchId),
    req.user.businessId || null,
  );

  if (!student) {
    throw new NotFoundException("Student not found");
  }

  return student;
};
