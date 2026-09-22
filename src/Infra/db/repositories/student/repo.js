import { prisma } from "../../prisma.client.js";

function buildStudentListWhere(businessId, branchId, filters = {}) {
  const { counselorId, leadStage, searchTerm } = filters;

  return {
    branchId,
    isDeleted: false,
    // Super Admins have no businessId, so they aren't scoped to one business.
    ...(businessId != null ? { businessId } : {}),
    ...(counselorId != null ? { counselorId } : {}),
    ...(leadStage ? { leadStage } : {}),
    ...(searchTerm
      ? {
          OR: [
            { fullName: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } },
            { phoneNo: { contains: searchTerm, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export async function CountStudentsByBusinessBranch(
  businessId,
  branchId,
  filters = {},
) {
  return prisma.student.count({
    where: buildStudentListWhere(businessId, branchId, filters),
  });
}

export async function FindStudentsByBusinessBranch(
  businessId,
  branchId,
  { counselorId, leadStage, searchTerm, skip, take } = {},
) {
  return prisma.student.findMany({
    where: buildStudentListWhere(businessId, branchId, {
      counselorId,
      leadStage,
      searchTerm,
    }),
    include: {
      Counselor: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
}

export async function CreateStudent(payload) {
  return prisma.student.create({
    data: payload,
  });
}

export async function FindStudentByBusinessBranchEmailPhone(
  businessId,
  branchId,
  email,
  phoneNo,
) {
  return prisma.student.findUnique({
    where: {
      businessId_branchId_email_phoneNo: {
        businessId,
        branchId,
        email,
        phoneNo,
      },
    },
  });
}

export function FindStudentById(studentId, businessId) {
  return prisma.student.findFirst({
    where: {
      id: studentId,
      isDeleted: false,
      // Super Admins have no businessId, so they aren't scoped to one business.
      ...(businessId != null ? { businessId } : {}),
    },
  });
}

export function FindStudentDetailsByIdAndBranch(
  studentId,
  branchId,
  businessId,
) {
  return prisma.student.findFirst({
    where: {
      id: studentId,
      branchId,
      isDeleted: false,
      // Super Admins have no businessId, so they aren't scoped to one business.
      ...(businessId != null ? { businessId } : {}),
    },
    select: {
      fullName: true,
      email: true,
      phoneNo: true,
      preferredTargetCountries: true,
      targetDegree: true,
      leadStage: true,
      Counselor: {
        select: { id: true, name: true, email: true },
      },
      Branch: {
        select: { id: true, name: true },
      },
    },
  });
}

export function UpdateStudent(studentId, payload, businessId) {
  return prisma.student.update({
    where: {
      id: studentId,
      // Super Admins have no businessId, so they aren't scoped to one business.
      ...(businessId != null ? { businessId } : {}),
    },
    data: payload,
  });
}

export async function FindActiveStudentsByIds(studentIds, businessId) {
  return prisma.student.findMany({
    where: {
      id: { in: studentIds },
      isDeleted: false,
      // Super Admins have no businessId, so they aren't scoped to one business.
      ...(businessId != null ? { businessId } : {}),
    },
    select: { id: true },
  });
}

export async function BulkUpdateStudentCounselor(
  studentIds,
  payload,
  businessId,
) {
  return prisma.student.updateMany({
    where: {
      id: { in: studentIds },
      // Super Admins have no businessId, so they aren't scoped to one business.
      ...(businessId != null ? { businessId } : {}),
    },
    data: payload,
  });
}

function targetUniversityInclude() {
  return {
    University: {
      include: {
        universityRequirements: {
          where: { isActive: true, isDeleted: false },
        },
      },
    },
    targetCourses: {
      where: { deletedAt: null },
      include: { Course: true },
    },
  };
}

export async function FindTargetUniversitiesByStudentId(studentId) {
  return prisma.targetUniversity.findMany({
    where: { studentId, isDeleted: false },
    include: targetUniversityInclude(),
    orderBy: { createdAt: "desc" },
  });
}

export function FindTargetUniversityWithCoursesById(targetUniversityId) {
  return prisma.targetUniversity.findFirst({
    where: { id: targetUniversityId, isDeleted: false },
    include: targetUniversityInclude(),
  });
}

export async function FindTargetUniversitiesByStudentAndUniversityIds(
  studentId,
  universityIds,
) {
  return prisma.targetUniversity.findMany({
    where: { studentId, universityId: { in: universityIds } },
  });
}

// Duplicate (studentId, universityId) pairs are skipped at the DB level
// instead of throwing, per the unique constraint on TargetUniversity.
export async function CreateTargetUniversities(data) {
  return prisma.targetUniversity.createMany({
    data,
    skipDuplicates: true,
  });
}

export function FindTargetUniversityById(targetUniversityId) {
  return prisma.targetUniversity.findFirst({
    where: { id: targetUniversityId, isDeleted: false },
  });
}

// Duplicate (targetUniversityId, courseId) pairs are skipped at the DB level
// instead of throwing, per the unique constraint on TargetCourse.
export async function CreateTargetCourses(data) {
  return prisma.targetCourse.createMany({
    data,
    skipDuplicates: true,
  });
}

export function FindTargetCourseById(targetCourseId) {
  return prisma.targetCourse.findFirst({
    where: { id: targetCourseId, deletedAt: null },
  });
}

// Hard delete: TargetCourse.TargetUniversity is onDelete: Cascade, so this
// also removes every target course under this target university.
export function DeleteTargetUniversity(targetUniversityId) {
  return prisma.targetUniversity.delete({
    where: { id: targetUniversityId },
  });
}

// Hard delete.
export function DeleteTargetCourse(targetCourseId) {
  return prisma.targetCourse.delete({
    where: { id: targetCourseId },
  });
}
