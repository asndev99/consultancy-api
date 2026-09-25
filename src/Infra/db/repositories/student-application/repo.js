import { prisma } from "../../prisma.client.js";

export async function CreateStudentApplication(payload) {
  return prisma.studentApplication.create({
    data: payload,
  });
}

function applicationTeamSelect() {
  return {
    Manager: {
      select: { id: true, name: true, email: true },
    },
    AdmissionOfficer: {
      select: { id: true, name: true, email: true },
    },
  };
}

export async function FindStudentApplicationsByStudentAndBranch(
  businessId,
  studentId,
  branchId,
) {
  return prisma.studentApplication.findMany({
    where: {
      studentId,
      branchId,
      isActive: true,
      // Super Admins have no businessId, so they aren't scoped to one business.
      ...(businessId != null ? { businessId } : {}),
    },
    select: {
      id: true,
      applicationStatus: true,
      applicationIntake: true,
      applicationTargetUniversity: true,
      applicationTargetCourses: true,
      applicationTutionFee: true,
      applicationTutionFeePeriod: true,
      tutionFeeCurrency: true,
      applicationSubmittedAt: true,
      isAdmissionTeamAssigned: true,
      isManagerAssigned: true,
      ...applicationTeamSelect(),
    },
    orderBy: { createdAt: "desc" },
  });
}

export function FindStudentApplicationById(applicationId, businessId) {
  return prisma.studentApplication.findFirst({
    where: {
      id: applicationId,
      isActive: true,
      // Super Admins have no businessId, so they aren't scoped to one business.
      ...(businessId != null ? { businessId } : {}),
    },
  });
}

export function FindStudentApplicationDetailsById(applicationId, businessId) {
  return prisma.studentApplication.findFirst({
    where: {
      id: applicationId,
      isActive: true,
      // Super Admins have no businessId, so they aren't scoped to one business.
      ...(businessId != null ? { businessId } : {}),
    },
    select: {
      id: true,
      applicationStatus: true,
      applicationIntake: true,
      applicationTargetUniversity: true,
      applicationTargetCourses: true,
      applicationTutionFee: true,
      applicationTutionFeePeriod: true,
      tutionFeeCurrency: true,
      applicationSubmittedAt: true,
      isAdmissionTeamAssigned: true,
      isManagerAssigned: true,
      Student: {
        select: {
          fullName: true,
          email: true,
          phoneNo: true,
          targetDegree: true,
          Counselor: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      Manager: {
        select: { name: true },
      },
      AdmissionOfficer: {
        select: { name: true },
      },
    },
  });
}

export async function FindRemarksByApplicationId(applicationId, businessId) {
  return prisma.studentApplicationRemarks.findMany({
    where: {
      applicationId,
      deletedAt: null,
      // Super Admins have no businessId, so they aren't scoped to one business.
      ...(businessId != null ? { Application: { businessId } } : {}),
    },
    select: {
      id: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
      Author: {
        select: { name: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function AssignStudentApplication(applicationId, payload, businessId) {
  return prisma.studentApplication.update({
    where: {
      id: applicationId,
      // Super Admins have no businessId, so they aren't scoped to one business.
      ...(businessId != null ? { businessId } : {}),
    },
    data: payload,
    select: {
      id: true,
      managerId: true,
      isManagerAssigned: true,
      managerAssignedAt: true,
      admissionOfficerId: true,
      isAdmissionTeamAssigned: true,
      admissionTeamAssignedAt: true,
    },
  });
}

export function UpdateStudentApplicationStatus(
  applicationId,
  payload,
  businessId,
) {
  return prisma.studentApplication.update({
    where: {
      id: applicationId,
      // Super Admins have no businessId, so they aren't scoped to one business.
      ...(businessId != null ? { businessId } : {}),
    },
    data: payload,
    select: {
      id: true,
      applicationStatus: true,
      updatedAt: true,
    },
  });
}

//soft delete.
export function DeleteStudentApplication(applicationId, payload, businessId) {
  return prisma.studentApplication.update({
    where: {
      id: applicationId,
      // Super Admins have no businessId, so they aren't scoped to one business.
      ...(businessId != null ? { businessId } : {}),
    },
    data: payload,
  });
}
