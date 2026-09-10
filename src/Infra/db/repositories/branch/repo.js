import { UserRoles } from "../../../../shared/application.constants.js";
import { prisma } from "../../prisma.client.js";

function buildBranchListWhere(businessId, filters = {}) {
  const { isActive } = filters;

  return {
    businessId,
    isDeleted: false,
    ...(typeof isActive === "boolean" ? { isActive } : {}),
  };
}

export async function CountBranchesByBusinessId(businessId, filters = {}) {
  return prisma.branch.count({
    where: buildBranchListWhere(businessId, filters),
  });
}

export async function FindBranchesByBusinessId(
  businessId,
  { isActive, skip, take, includeManagers = false } = {},
) {
  const branches = await prisma.branch.findMany({
    where: buildBranchListWhere(businessId, { isActive }),
    skip,
    take,
    ...(includeManagers
      ? {
          include: {
            branchUsers: {
              where: {
                isActive: true,
                deletedAt: null,
                User: { role: UserRoles.Manager, isDeleted: false },
              },
              include: {
                User: { select: { name: true } },
              },
            },
          },
        }
      : {}),
  });

  if (!includeManagers) {
    return branches;
  }

  return branches.map(({ branchUsers, ...branch }) => ({
    ...branch,
    managers: branchUsers.map((branchUser) => branchUser.User.name),
  }));
}

export async function CreateBranch(payload) {
  return prisma.branch.create({
    data: payload,
  });
}

export async function FindByBranchName(name) {
  return prisma.branch.findUnique({
    where: {
      name,
    },
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
