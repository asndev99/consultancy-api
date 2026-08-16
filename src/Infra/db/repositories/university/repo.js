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

export async function findUniversitiesByBusinessId(businessId) {
  return prisma.university.findMany({
    where: {
      businessId,
    },
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
  return prisma.universityCourses.create({ data });
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
