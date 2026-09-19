import StudentRepository from "../../Infra/db/repositories/student/index.js";
import DocumentRepository from "../../Infra/db/repositories/document/index.js";
import { NotFoundException } from "../../shared/error.js";
import { buildFileUrl } from "../../shared/utils.js";

export const GetStudentDocumentMediaByStudentUseCase = async (
  req,
  studentId,
) => {
  const student = await StudentRepository.FindStudentById(
    Number(studentId),
    req.user.businessId,
  );
  if (!student) {
    throw new NotFoundException("Student not found");
  }

  const mediaList = await DocumentRepository.FindStudentDocumentMediaByStudentId(
    student.id,
  );

  const grouped = new Map();
  for (const media of mediaList) {
    const documentTitle = media.Document.documentTitle;
    if (!grouped.has(documentTitle)) {
      grouped.set(documentTitle, []);
    }
    grouped.get(documentTitle).push({
      id: media.id,
      fileKey: media.fileKey,
      filePath: buildFileUrl(media.fileKey),
      mediaType: media.mediaType,
      createdAt: media.createdAt,
    });
  }

  return Array.from(grouped, ([documentTitle, files]) => ({
    documentTitle,
    files,
  }));
};
