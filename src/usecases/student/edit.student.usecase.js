import StudentRepository from "../../Infra/db/repositories/student/index.js";
import { NotFoundException, BadRequestException } from "../../shared/error.js";

export const EditStudentUseCase = async (req, studentId, payload) => {
  const businessId = req.user.businessId || null;

  const student = await StudentRepository.FindStudentById(
    Number(studentId),
    businessId,
  );
  if (!student) {
    throw new NotFoundException("Student not found");
  }

  if (payload.email || payload.phoneNo) {
    const conflict =
      await StudentRepository.FindStudentByBusinessBranchEmailPhone(
        student.businessId,
        student.branchId,
        payload.email ?? student.email,
        payload.phoneNo ?? student.phoneNo,
      );
    if (conflict && conflict.id !== student.id) {
      throw new BadRequestException(
        "Another student with this email and phone number already exists on this branch",
      );
    }
  }

  return StudentRepository.UpdateStudent(
    student.id,
    {
      ...payload,
      updatedBy: req.user.id,
    },
    businessId,
  );
};
