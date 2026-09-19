import { prisma } from "../../prisma.client.js";

export async function createUniversity(data) {
  return prisma.university.create({ data });
}

export async function findUniversityByBusinessId(businessId) {
  return prisma.university.findFirst({
    where: {
      businessId,
    },
  });
}

export async function findUniversityById(id, { includeDeleted = false } = {}) {
  return prisma.university.findFirst({
    where: {
      id,
      ...(includeDeleted ? {} : { deletedAt: null }),
    },
  });
}

function buildUniversityListWhere(businessId, filters = {}) {
  const { universityName, isActive } = filters;

  return {
    businessId,
    deletedAt: null,
    ...(universityName
      ? { universityName: { contains: universityName, mode: "insensitive" } }
      : {}),
    ...(typeof isActive === "boolean" ? { isActive } : {}),
  };
}

export async function CountUniversitiesByBusinessId(businessId, filters = {}) {
  return prisma.university.count({
    where: buildUniversityListWhere(businessId, filters),
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

// Used to search target universities (with their courses) when working with
// a student - no pagination, matches on university name, country, or any of
// its courses' titles. An empty/nullable searchTerm returns every university.
export async function findTargetUniversitiesByBusinessId(
  businessId,
  searchTerm,
) {
  const trimmedSearchTerm =
    typeof searchTerm === "string" ? searchTerm.trim() : "";

  return prisma.university.findMany({
    where: {
      businessId,
      deletedAt: null,
      ...(trimmedSearchTerm
        ? {
            OR: [
              {
                universityName: {
                  contains: trimmedSearchTerm,
                  mode: "insensitive",
                },
              },
              { country: { contains: trimmedSearchTerm, mode: "insensitive" } },
              {
                universityCourses: {
                  some: {
                    deletedAt: null,
                    courseTitle: {
                      contains: trimmedSearchTerm,
                      mode: "insensitive",
                    },
                  },
                },
              },
            ],
          }
        : {}),
    },
    include: {
      universityCourses: {
        where: { deletedAt: null },
      },
    },
    orderBy: { universityName: "asc" },
  });
}

export async function findUniversityCoursesByUniversityId(
  universityId,
  searchTerm,
) {
  const trimmedSearchTerm =
    typeof searchTerm === "string" ? searchTerm.trim() : "";

  return prisma.universityCourses.findMany({
    where: {
      universityId,
      deletedAt: null,
      ...(trimmedSearchTerm
        ? {
            courseTitle: {
              contains: trimmedSearchTerm,
              mode: "insensitive",
            },
          }
        : {}),
    },
    orderBy: { courseTitle: "asc" },
  });
}

export async function findUniversitiesByBusinessId(
  businessId,
  page = 1,
  pageSize = 10,
  filters = {},
) {
  const universities = await prisma.university.findMany({
    where: buildUniversityListWhere(businessId, filters),
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      _count: {
        select: {
          universityCourses: {
            where: { isActive: true, deletedAt: null },
          },
        },
      },
    },
  });

  return universities.map(({ _count, ...university }) => ({
    ...university,
    courseCount: _count.universityCourses,
  }));
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

export async function findUniversityCourseById(
  id,
  { includeDeleted = false } = {},
) {
  return prisma.universityCourses.findFirst({
    where: {
      id,
      ...(includeDeleted ? {} : { deletedAt: null }),
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
                date: intakeDate.date ?? new Date(intakeDate),
                createdBy: intakeDate.createdBy ?? courseData.createdBy,
                universityId: courseData.universityId,
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
    where: { id: Number(id) },
    data,
  });
}

export async function softDeleteUniversityRequirement(id, deletedBy) {
  return prisma.universityRequirement.update({
    where: { id: Number(id) },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy,
    },
  });
}

// export
