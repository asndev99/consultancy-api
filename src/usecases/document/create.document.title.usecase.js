import StudentRepository from "../../Infra/db/repositories/student/index.js";
import DocumentRepository from "../../Infra/db/repositories/document/index.js";
import { NotFoundException } from "../../shared/error.js";

export const CreateDocumentTitleUseCase = async (req, payload) => {
  const student = await StudentRepository.FindStudentById(
    Number(payload.studentId),
    req.user.businessId,
  );

  if (!student) {
    throw new NotFoundException("Student not found");
  }

  return DocumentRepository.CreateDocumentTitle({
    studentId: student.id,
    documentTitle: payload.documentTitle,
    isMandatory: payload.isMandatory,
    quantity: payload.quantity,
    createdBy: req.user.id,
  });
};
