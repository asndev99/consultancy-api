import StudentRepository from "../../Infra/db/repositories/student/index.js";
import DocumentRepository from "../../Infra/db/repositories/document/index.js";
import { NotFoundException } from "../../shared/error.js";

export const DeleteStudentDocumentMediaUseCase = async (req, mediaId) => {
  const media = await DocumentRepository.FindStudentDocumentMediaById(
    Number(mediaId),
  );
  if (!media) {
    throw new NotFoundException("Document media not found");
  }

  const student = await StudentRepository.FindStudentById(
    media.studentId,
    req.user.businessId,
  );
  if (!student) {
    throw new NotFoundException("Document media not found");
  }

  return DocumentRepository.DeleteStudentDocumentMedia(media.id, {
    isActive: false,
    isDeleted: true,
    deletedAt: new Date(),
    deletedBy: req.user.id,
  });
};
