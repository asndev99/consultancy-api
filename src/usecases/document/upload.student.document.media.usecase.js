import StudentRepository from "../../Infra/db/repositories/student/index.js";
import DocumentRepository from "../../Infra/db/repositories/document/index.js";
import { NotFoundException, BadRequestException } from "../../shared/error.js";
import { buildFileUrl } from "../../shared/utils.js";

export const UploadStudentDocumentMediaUseCase = async (req, payload, files) => {
  if (!files || files.length === 0) {
    throw new BadRequestException("At least one file is required");
  }

  const documentTitle = await DocumentRepository.FindDocumentTitleById(
    Number(payload.documentId),
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

  const createdMedia = await Promise.all(
    files.map((file) =>
      DocumentRepository.CreateStudentDocumentMedia({
        studentId: student.id,
        documentId: documentTitle.id,
        mediaType: file.mimetype,
        fileKey: file.filename,
        isActive: true,
        createdBy: req.user.id,
      }),
    ),
  );

  return createdMedia.map((media) => ({
    ...media,
    filePath: buildFileUrl(media.fileKey),
  }));
};
