import { prisma } from "../../prisma.client.js";

export async function createUniversity(data) {
  return prisma.university.create({ data });
}

export async function findUniversityById(id, { includeDeleted = false } = {}) {
  return prisma.university.findFirst({
    where: {
      id,
      ...(includeDeleted ? {} : { deletedAt: null }),
    },
  });
}

export async function CountUniversitiesByBusinessId(businessId) {
  return prisma.university.count({
    where: {
      businessId,
      deletedAt: null,
    },
  });
}

export async function findUniversityDetailsById(id) {
  return prisma.university.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      universityRequirements: {
        where: {
          isActive: true,
          isDeleted: false,
        },
      },
      universityCourses: {
        where: { deletedAt: null },
        include: {
          universityIntakeDates: {
            where: { deletedAt: null },
          },
        },
      },
    },
  });
}

export async function findUniversitiesByBusinessId(
  businessId,
  page = 1,
  pageSize = 10,
) {
  return prisma.university.findMany({
    where: {
      businessId,
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
}

export async function update(id, data) {
  return prisma.university.update({
    where: { id },
    data,
  });
}

export async function softDelete(id, deletedBy) {
  return prisma.university.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy,
    },
  });
}

export async function createUniversityCourse(data) {
  const { intakeDates, ...courseData } = data;

  return prisma.universityCourses.create({
    data: {
      ...courseData,
      ...(Array.isArray(intakeDates) && intakeDates.length > 0
        ? {
            universityIntakeDates: {
              create: intakeDates.map((intakeDate) => ({
                date: intakeDate.date ?? intakeDate,
                createdBy: intakeDate.createdBy ?? courseData.createdBy,
              })),
            },
          }
        : {}),
    },
    include: {
      universityIntakeDates: true,
    },
  });
}

export async function updateUniversityCourse(id, data) {
  return prisma.universityCourses.update({
    where: { id },
    data,
  });
}

export async function softDeleteUniversityCourse(id, deletedBy) {
  return prisma.universityCourses.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy,
    },
  });
}

export async function createUniversityRequirement(data) {
  return prisma.universityRequirement.create({ data });
}

export async function updateUniversityRequirement(id, data) {
  return prisma.universityRequirement.update({
    where: { id },
    data,
  });
}

export async function softDeleteUniversityRequirement(id, deletedBy) {
  return prisma.universityRequirement.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy,
    },
  });
}

// export
