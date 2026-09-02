import {
  UserRoles,
  UserStatus,
} from "../../../../shared/application.constants.js";
import { prisma } from "../../prisma.client.js";

//need to update this once subdomain work is done.
export async function findUserByEmail(email) {
  return prisma.user.findFirst({
    where: {
      email,
      status: UserStatus.Active,
      isDeleted: false,
    },
    include: {
      Business: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function FindAssignedBranchesToUserByUserId(userId) {
  return prisma.userBranch.findMany({
    where: {
      userId,
    },
    include: {
      Branch: true,
    },
  });
}

export async function findUserByEmailAndBusinessIncludingBranches(
  email,
  businessId,
) {
  return prisma.user.findUnique({
    where: {
      businessId_email: {
        businessId,
        email,
      },
      isDeleted: false,
      deletedAt: null,
    },
    include: {
      userBranches: true,
    },
  });
}

export async function countUsersByBusiness(businessId) {
  return prisma.user.count({ where: { businessId } });
}

export async function countBusinessUsers({ businessId, name, branchIds } = {}) {
  return prisma.user.count({
    where: buildBusinessUsersWhere({ businessId, name, branchIds }),
  });
}

export async function addUserToBranch({
  userId,
  branchId,
  businessId,
  createdBy,
}) {
  return prisma.userBranch.create({
    data: {
      userId: userId,
      branchId,
      businessId,
      createdBy,
      isActive: true,
    },
  });
}

export async function createUser(data) {
  return prisma.user.create({ data });
}

function buildBusinessUsersWhere({ businessId, name, branchIds }) {
  return {
    businessId,
    isDeleted: false,
    role: {
      notIn: ["Super Admin", "Business Admin"],
    },
    ...(name ? { name: { contains: name, mode: "insensitive" } } : {}),
    ...(branchIds
      ? {
          userBranches: {
            some: {
              deletedAt: null,
              branchId: { in: branchIds },
            },
          },
        }
      : {}),
  };
}

export async function getUsersByBusinessId({
  businessId,
  name,
  branchIds,
  skip,
  take,
} = {}) {
  return prisma.user.findMany({
    where: buildBusinessUsersWhere({ businessId, name, branchIds }),
    select: {
      id: true,
      name: true,
      email: true,
      previousEmailAddress: true,
      status: true,
      inviteAcceptedAt: true,
      createdAt: true,
      updatedAt: true,
      role: true,
      userBranches: {
        where: { deletedAt: null },
        select: {
          Branch: true,
        },
      },
    },
    orderBy: { id: "asc" },
    skip,
    take,
  });
}

export async function GetManagersByBusiness(businessId) {
  return prisma.user.findMany({
    where: {
      isActive: true,
      businessId: Number(businessId),
      status: UserStatus.Active,
      role: UserRoles.Manager,
      isDeleted: false,
    },
  });
}

export async function DeleteUserByBusiness(updatedBy, userId, businessId) {
  const user = await findUserById(userId);

  return prisma.user.update({
    where: {
      id: user.id,
      // Super Admins have no businessId, so they aren't scoped to one business.
      ...(businessId != null ? { businessId } : {}),
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: updatedBy,
      email: `del_${new Date().getTime()}_${user.email}`,
      backUpEmailAddress: user.email,
    },
  });
}

export async function findUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

export async function updateUserById(id, data) {
  return prisma.user.update({ where: { id }, data });
}
