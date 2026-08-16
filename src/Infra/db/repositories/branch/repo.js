import { prisma } from "../../prisma.client";

export async function GetBranchesByBusinessIdIncludingUsers(businessId) {
  return prisma.branch.findMany({
    where: {
      businessId,
      isActive: true,
      isDeleted: false,
    },
    include: {
      users: {
        where: {
          isActive: true,
          isDeleted: false,
        },
      },
    },
  });
}

export async function CreateBranch(payload) {
  return prisma.branch.create({
    data: payload,
  });
}

export function UpdateBranch(branchId, payload) {
  return prisma.branch.update({
    where: {
      id: branchId,
    },
    data: payload,
  });
}

//soft delete.
export function DeleteBranch(branchId, payload) {
  return prisma.branch.update({
    where: {
      id,
    },
    data: payload,
  });
}
