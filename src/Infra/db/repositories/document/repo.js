import { prisma } from "../../prisma.client.js";

export async function CreateDocumentTitle(payload) {
  return prisma.documentTitle.create({
    data: payload,
  });
}

export async function FindDocumentTitlesByStudentId(studentId) {
  return prisma.documentTitle.findMany({
    where: { studentId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export function FindDocumentTitleById(documentTitleId) {
  return prisma.documentTitle.findFirst({
    where: { id: documentTitleId, deletedAt: null },
  });
}

export function UpdateDocumentTitle(documentTitleId, payload) {
  return prisma.documentTitle.update({
    where: { id: documentTitleId },
    data: payload,
  });
}

// soft delete.
export function DeleteDocumentTitle(documentTitleId, payload) {
  return prisma.documentTitle.update({
    where: { id: documentTitleId },
    data: payload,
  });
}

export async function CreateStudentDocumentMedia(payload) {
  return prisma.studentDocumentMedia.create({
    data: payload,
  });
}

export function FindStudentDocumentMediaById(mediaId) {
  return prisma.studentDocumentMedia.findFirst({
    where: { id: mediaId, isDeleted: false },
  });
}

export async function FindStudentDocumentMediaByStudentId(studentId) {
  return prisma.studentDocumentMedia.findMany({
    where: { studentId, isDeleted: false },
    select: {
      id: true,
      fileKey: true,
      mediaType: true,
      createdAt: true,
      Document: {
        select: { documentTitle: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function UpdateStudentDocumentMedia(mediaId, payload) {
  return prisma.studentDocumentMedia.update({
    where: { id: mediaId },
    data: payload,
  });
}

// soft delete.
export function DeleteStudentDocumentMedia(mediaId, payload) {
  return prisma.studentDocumentMedia.update({
    where: { id: mediaId },
    data: payload,
  });
}
