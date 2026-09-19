import { prisma } from "../../prisma.client.js";

export async function CreateLeadForm(payload) {
  return prisma.leadForms.create({
    data: payload,
  });
}

export function FindLeadFormById(leadFormId, businessId) {
  return prisma.leadForms.findFirst({
    where: {
      id: leadFormId,
      isDeleted: false,
      // Super Admins have no businessId, so they aren't scoped to one business.
      ...(businessId != null ? { businessId } : {}),
    },
  });
}

// branchId is optional - omit it to fetch every lead form in the business.
export async function FindLeadForms(businessId, branchId) {
  return prisma.leadForms.findMany({
    where: {
      isDeleted: false,
      // Super Admins have no businessId, so they aren't scoped to one business.
      ...(businessId != null ? { businessId } : {}),
      ...(branchId != null ? { branchId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export function UpdateLeadForm(leadFormId, payload, businessId) {
  return prisma.leadForms.update({
    where: {
      id: leadFormId,
      // Super Admins have no businessId, so they aren't scoped to one business.
      ...(businessId != null ? { businessId } : {}),
    },
    data: payload,
  });
}

// soft delete.
export function DeleteLeadForm(leadFormId, payload, businessId) {
  return prisma.leadForms.update({
    where: {
      id: leadFormId,
      // Super Admins have no businessId, so they aren't scoped to one business.
      ...(businessId != null ? { businessId } : {}),
    },
    data: payload,
  });
}

export function FindPublicLeadFormByPublicId(publicId) {
  return prisma.leadForms.findFirst({
    where: {
      publicId,
      isActive: true,
      isDeleted: false,
    },
    select: {
      name: true,
      targetDegreeLevel: true,
      targetCountries: true,
    },
  });
}
