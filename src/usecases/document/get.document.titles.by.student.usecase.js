import StudentRepository from "../../Infra/db/repositories/student/index.js";
import DocumentRepository from "../../Infra/db/repositories/document/index.js";
import { NotFoundException } from "../../shared/error.js";

export const GetDocumentTitlesByStudentUseCase = async (req, studentId) => {
  const student = await StudentRepository.FindStudentById(
    Number(studentId),
    req.user.businessId,
  );

  if (!student) {
    throw new NotFoundException("Student not found");
  }

  return DocumentRepository.FindDocumentTitlesByStudentId(student.id);
};
