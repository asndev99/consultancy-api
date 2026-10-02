import { prisma } from "../../prisma.client.js";

export function FindSubAgentsByBranch(businessId, branchId) {
  return prisma.subAgentBranchProfile.findMany({
    where: {
      deletedAt: null,
      branch: {
        branchId,
        deletedAt: null,
        // Super Admins have no businessId, so they aren't scoped to one business.
        ...(businessId != null ? { businessId } : {}),
        User: { isDeleted: false },
      },
    },
    select: subAgentProfileSelect,
    orderBy: { createdAt: "desc" },
  });
}

const subAgentProfileSelect = {
  id: true,
  companyName: true,
  commissionRate: true,
  targetCountries: true,
  referredStudents: true,
  branch: {
    select: {
      Branch: {
        select: { id: true, name: true },
      },
      User: {
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          status: true,
          inviteAcceptedAt: true,
          isEmailVerified: true,
        },
      },
    },
  },
};

export function FindSubAgentProfileById(profileId, businessId) {
  return prisma.subAgentBranchProfile.findFirst({
    where: {
      id: profileId,
      deletedAt: null,
      branch: {
        deletedAt: null,
        // Super Admins have no businessId, so they aren't scoped to one business.
        ...(businessId != null ? { businessId } : {}),
        User: { isDeleted: false },
      },
    },
    select: {
      ...subAgentProfileSelect,
      branch: {
        select: {
          ...subAgentProfileSelect.branch.select,
          businessId: true,
          User: {
            select: {
              ...subAgentProfileSelect.branch.select.User.select,
              role: true,
            },
          },
        },
      },
    },
  });
}

// Updates the sub agent's user fields and this branch's profile together.
export function UpdateSubAgent({ userId, userData, profileId, profileData }) {
  return prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: userData });
    return tx.subAgentBranchProfile.update({
      where: { id: profileId },
      data: profileData,
      select: subAgentProfileSelect,
    });
  });
}

// Assigns an existing sub agent to a branch with its profile in one
// transaction. A previously removed UserBranch (and its profile) is restored
// rather than re-created, since (userId, branchId) and userBranchId are unique.
export function AssignSubAgentToBranch({
  userId,
  branchId,
  businessId,
  existingUserBranchId,
  profile,
  actorId,
}) {
  return prisma.$transaction(async (tx) => {
    const userBranch =
      existingUserBranchId != null
        ? await tx.userBranch.update({
            where: { id: existingUserBranchId },
            data: {
              isActive: true,
              deletedAt: null,
              deletedBy: null,
              updatedBy: actorId,
            },
          })
        : await tx.userBranch.create({
            data: {
              userId,
              branchId,
              businessId,
              createdBy: actorId,
              isActive: true,
            },
          });

    const subAgentProfile = await tx.subAgentBranchProfile.upsert({
      where: { userBranchId: userBranch.id },
      create: {
        ...profile,
        userBranchId: userBranch.id,
        createdBy: actorId,
      },
      update: {
        ...profile,
        deletedAt: null,
        deletedBy: null,
        updatedBy: actorId,
      },
    });

    return { userBranch, subAgentProfile };
  });
}

// Creates the user, their branch assignment and the sub agent profile
// together so a partial sub agent is never left behind.
export function CreateSubAgent({ user, branchId, profile, createdBy }) {
  return prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: user,
      omit: { password: true },
    });

    const userBranch = await tx.userBranch.create({
      data: {
        userId: createdUser.id,
        branchId,
        businessId: createdUser.businessId,
        createdBy,
        isActive: true,
      },
    });

    const subAgentProfile = await tx.subAgentBranchProfile.create({
      data: {
        ...profile,
        userBranchId: userBranch.id,
        createdBy,
      },
    });

    return { user: createdUser, userBranch, subAgentProfile };
  });
}
