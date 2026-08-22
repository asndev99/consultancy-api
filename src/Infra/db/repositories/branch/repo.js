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

export function UpdateBranch(branchId, payload, businessId) {
  return prisma.branch.update({
    where: {
      id: branchId,
      // Super Admins have no businessId, so they aren't scoped to one business.
      ...(businessId != null ? { businessId } : {}),
    },
    data: payload,
  });
}

//soft delete.
export function DeleteBranch(branchId, payload, businessId) {
  return prisma.branch.update({
    where: {
      id: branchId,
      ...(businessId != null ? { businessId } : {}),
    },
    data: payload,
  });
}

// TODO: once transactional repository support is added, CreateBranch + CreateBranchManager
// should run inside a single prisma.$transaction so a failure in one rolls back the other.
export async function CreateBranchManager({
  branchId,
  userId,
  businessId,
  createdBy,
}) {
  return prisma.userBranch.create({
    data: {
      branchId,
      userId,
      businessId,
      createdBy,
      isActive: true,
    },
  });
}
