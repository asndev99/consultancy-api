import { UserStatus } from "../../../../shared/application.constants.js";
import { prisma } from "../../prisma.client.js";

export async function findActiveUserByEmailAndBusinessId(email, businesId) {
  return prisma.user.findUnique({
    where: {
      businessId_email: {
        businessId,
        email,
      },
      status: UserStatus.Active,
    },
  });
}

export async function findUserByEmail(email, businesId) {
  return prisma.user.findUnique({
    where: {
      email,
      status: UserStatus.Active,
      isDeleted: false,
    },
  });
}

export async function createUser(data) {
  return prisma.user.create({ data });
}
