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
      targetCountry: true,
      ...applicationTeamSelect(),
    },
    orderBy: { createdAt: "desc" },
  });
}

function listStudentApplicationsWhere(businessId, filters) {
  return {
    ...filters,
    isActive: true,
    deletedAt: null,
    // Super Admins have no businessId, so they aren't scoped to one business.
    ...(businessId != null ? { businessId } : {}),
  };
}

export function CountStudentApplications(businessId, filters) {
  return prisma.studentApplication.count({
    where: listStudentApplicationsWhere(businessId, filters),
  });
}

export function FindStudentApplications(businessId, filters, { skip, take }) {
  return prisma.studentApplication.findMany({
    where: listStudentApplicationsWhere(businessId, filters),
    select: {
      id: true,
      studentId: true,
      Student: {
        select: { fullName: true },
      },
      applicationStatus: true,
      applicationTargetUniversity: true,
      applicationTargetCourses: true,
      targetCountry: true,
      applicationIntake: true,
      Manager: {
        select: { id: true, name: true },
      },
      AdmissionOfficer: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
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
      targetCountry: true,
      Branch: {
        select: { id: true, name: true },
      },
      Student: {
        select: {
          id: true,
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
        select: { id: true, name: true },
      },
      AdmissionOfficer: {
        select: { id: true, name: true },
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

export function EditStudentApplication(applicationId, payload, businessId) {
  return prisma.studentApplication.update({
    where: {
      id: applicationId,
      // Super Admins have no businessId, so they aren't scoped to one business.
      ...(businessId != null ? { businessId } : {}),
    },
    data: payload,
    select: {
      id: true,
      applicationIntake: true,
      applicationTargetUniversity: true,
      applicationTargetCourses: true,
      applicationTutionFee: true,
      applicationTutionFeePeriod: true,
      tutionFeeCurrency: true,
      targetCountry: true,
      updatedAt: true,
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
