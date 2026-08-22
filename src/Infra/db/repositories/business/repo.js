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
