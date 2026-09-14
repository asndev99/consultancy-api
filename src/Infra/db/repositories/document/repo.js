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
