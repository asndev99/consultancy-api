import { prisma } from "../../prisma.client.js";

export const findBusinessByName = (name) => {
  return prisma.business.findUnique({
    where: {
      name,
    },
  });
};

export const RegisterBusiness = (payload) => {
  return prisma.business.create({
    data: payload,
  });
};

export const FindBusinessById = (businessId) => {
  return prisma.business.findUnique({
    where: {
      id: Number(businessId),
    },
  });
};

// Atomically bumps the business' student counter so concurrent creates never
// collide on the same sequence number.
export const IncrementStudentSequence = (businessId) => {
  return prisma.business.update({
    where: { id: Number(businessId) },
    data: { studentSequence: { increment: 1 } },
    select: { studentSequence: true, businessCode: true },
  });
};
