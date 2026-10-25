import StudentRepository from "../../Infra/db/repositories/student/index.js";
import { NotFoundException } from "../../shared/error.js";

export const DeleteStudentUseCase = async (req, studentId) => {
  const businessId = req.user.businessId || null;

  const student = await StudentRepository.FindStudentById(
    Number(studentId),
    businessId,
  );
  if (!student) {
    throw new NotFoundException("Student not found");
  }

  await StudentRepository.SoftDeleteStudents(
    [student.id],
    req.user.id,
    businessId,
  );

  return { studentId: student.id };
};
