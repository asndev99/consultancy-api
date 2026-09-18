import fs from "node:fs/promises";
import path from "node:path";
import StudentRepository from "../../Infra/db/repositories/student/index.js";
import DocumentRepository from "../../Infra/db/repositories/document/index.js";
import { NotFoundException, BadRequestException } from "../../shared/error.js";
import { buildFileUrl } from "../../shared/utils.js";
import { publicDir } from "../../shared/paths.js";

export const ReplaceStudentDocumentMediaUseCase = async (
  req,
  mediaId,
  file,
) => {
  if (!file) {
    throw new BadRequestException("file is required");
  }

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

  const oldFileKey = media.fileKey;

  const updated = await DocumentRepository.UpdateStudentDocumentMedia(
    media.id,
    {
      mediaType: file.mimetype,
      fileKey: file.filename,
      updatedBy: req.user.id,
    },
  );

  // Best-effort cleanup of the file being replaced; a failure here shouldn't fail the request.
  fs.unlink(path.join(publicDir, oldFileKey)).catch(() => {});

  return { ...updated, filePath: buildFileUrl(updated.fileKey) };
};
