import { prisma } from "../../prisma.client.js";

function remarkSelect() {
  return {
    id: true,
    comment: true,
    applicationId: true,
    createdAt: true,
    updatedAt: true,
    Author: {
      select: { id: true, name: true, role: true },
    },
  };
}

export function CreateStudentApplicationRemark(payload) {
  return prisma.studentApplicationRemarks.create({
    data: payload,
    select: remarkSelect(),
  });
}

export function FindStudentApplicationRemarkById(remarkId, businessId) {
  return prisma.studentApplicationRemarks.findFirst({
    where: {
      id: remarkId,
      deletedAt: null,
      Application: {
        isActive: true,
        // Super Admins have no businessId, so they aren't scoped to one business.
        ...(businessId != null ? { businessId } : {}),
      },
    },
  });
}

export function UpdateStudentApplicationRemark(remarkId, payload) {
  return prisma.studentApplicationRemarks.update({
    where: { id: remarkId },
    data: payload,
    select: remarkSelect(),
  });
}

//soft delete.
export function DeleteStudentApplicationRemark(remarkId, payload) {
  return prisma.studentApplicationRemarks.update({
    where: { id: remarkId },
    data: payload,
    select: { id: true, deletedAt: true },
  });
}
