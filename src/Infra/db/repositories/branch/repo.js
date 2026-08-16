import { prisma } from "../../prisma.client.js";

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
      id: branchId,
    },
    data: payload,
  });
}

// TODO: once transactional repository support is added, CreateBranch + CreateBranchManager
// should run inside a single prisma.$transaction so a failure in one rolls back the other.
export async function CreateBranchManager(data) {
  return prisma.branchManager.create({ data });
}
