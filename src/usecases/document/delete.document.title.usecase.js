import StudentRepository from "../../Infra/db/repositories/student/index.js";
import DocumentRepository from "../../Infra/db/repositories/document/index.js";
import { NotFoundException } from "../../shared/error.js";

export const DeleteDocumentTitleUseCase = async (req, documentTitleId) => {
  const documentTitle = await DocumentRepository.FindDocumentTitleById(
    Number(documentTitleId),
  );

  if (!documentTitle) {
    throw new NotFoundException("Document title not found");
  }

  const student = await StudentRepository.FindStudentById(
    documentTitle.studentId,
    req.user.businessId,
  );

  if (!student) {
    throw new NotFoundException("Document title not found");
  }

  return DocumentRepository.DeleteDocumentTitle(documentTitle.id, {
    deletedAt: new Date(),
    deletedBy: req.user.id,
  });
};
