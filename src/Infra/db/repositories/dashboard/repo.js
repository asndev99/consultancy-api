import { prisma } from "../../prisma.client.js";
import { Prisma } from "../../../../generated/prisma/client.js";
import {
  ApplicationStatus,
  LeadStage,
  UserRoles,
  UserStatus,
} from "../../../../shared/application.constants.js";

// Half-open window [from, to) on the given date column.
const inWindow = ({ from, to }) => ({ gte: from, lt: to });

export function CountNewLeads(businessId, branchId, window) {
  return prisma.student.count({
    where: {
      businessId,
      branchId,
      isDeleted: false,
      createdAt: inWindow(window),
    },
  });
}

export function CountSubmittedApplications(businessId, branchId, window) {
  return prisma.studentApplication.count({
    where: {
      businessId,
      branchId,
      deletedAt: null,
      applicationSubmittedAt: inWindow(window),
    },
  });
}

export function CountApplicationsByStatus(businessId, branchId, applicationStatus) {
  return prisma.studentApplication.count({
    where: { businessId, branchId, deletedAt: null, applicationStatus },
  });
}

// No stage history exists, so updatedAt approximates when the student was enrolled.
export function CountEnrolledStudents(businessId, branchId, window) {
  return prisma.student.count({
    where: {
      businessId,
      branchId,
      isDeleted: false,
      leadStage: LeadStage.Enrolled,
      updatedAt: inWindow(window),
    },
  });
}

// Each country a student picked counts once per student; blank entries are ignored.
export function GroupStudentsByTargetCountry(businessId, branchId) {
  return prisma.$queryRaw`
    SELECT TRIM(c) AS "country",
           COUNT(DISTINCT s."id")::int AS "count"
    FROM "Student" s
    CROSS JOIN LATERAL unnest(s."preferredTargetCountries") AS c
    WHERE s."businessId" = ${businessId}
      AND s."branchId" = ${branchId}
      AND s."isDeleted" = false
      AND TRIM(c) <> ''
    GROUP BY 1
    ORDER BY "count" DESC, "country" ASC`;
}

export async function CountStudentsWithTargetCountry(businessId, branchId) {
  const [row] = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT s."id")::int AS "count"
    FROM "Student" s
    CROSS JOIN LATERAL unnest(s."preferredTargetCountries") AS c
    WHERE s."businessId" = ${businessId}
      AND s."branchId" = ${branchId}
      AND s."isDeleted" = false
      AND TRIM(c) <> ''`;
  return row.count;
}

export async function GroupStudentsByLeadStage(businessId, branchId) {
  const grouped = await prisma.student.groupBy({
    by: ["leadStage"],
    where: { businessId, branchId, isDeleted: false },
    _count: { _all: true },
  });
  return grouped.map((g) => ({ leadStage: g.leadStage, count: g._count._all }));
}

export async function GroupApplicationsByIntake(businessId, branchId, excludedStatuses) {
  const grouped = await prisma.studentApplication.groupBy({
    by: ["applicationIntake", "isAdmissionTeamAssigned"],
    where: {
      businessId,
      branchId,
      deletedAt: null,
      applicationStatus: { notIn: excludedStatuses },
    },
    _count: { _all: true },
  });
  return grouped.map((g) => ({
    applicationIntake: g.applicationIntake,
    isAdmissionTeamAssigned: g.isAdmissionTeamAssigned,
    count: g._count._all,
  }));
}

export function FindBusinessTimeZone(businessId) {
  return prisma.business.findUnique({
    where: { id: businessId },
    select: { timeZone: true },
  });
}

// Source = leadSource when set, else "Sub-agents" if a Sub Agent created the student, else "Direct".
export function GroupLeadsBySource(businessId, branchId, { from, to }) {
  return prisma.$queryRaw`
    SELECT CASE
             WHEN NULLIF(TRIM(s."leadSource"), '') IS NOT NULL THEN TRIM(s."leadSource")
             WHEN u."role" = ${UserRoles["Sub Agent"]} THEN 'Sub-agents'
             ELSE 'Direct'
           END AS "source",
           COUNT(*)::int AS "leads",
           (COUNT(*) FILTER (WHERE s."leadStage"::text = ${LeadStage.Enrolled}))::int AS "enrolled"
    FROM "Student" s
    LEFT JOIN "User" u ON u."id" = s."createdBy"
    WHERE s."businessId" = ${businessId}
      AND s."branchId" = ${branchId}
      AND s."isDeleted" = false
      AND s."createdAt" >= ${from}
      AND s."createdAt" < ${to}
    GROUP BY 1
    ORDER BY "leads" DESC, "source" ASC`;
}

// Per counselor (null = unassigned): students not yet enrolled, all students,
// all enrolled, and enrolled within the window (updatedAt approximates the
// enrolment date, as in CountEnrolledStudents).
export function GroupStudentWorkloadByCounselor(businessId, branchId, { from, to }) {
  return prisma.$queryRaw`
    SELECT s."counselorId" AS "counselorId",
           (COUNT(*) FILTER (WHERE s."leadStage"::text <> ${LeadStage.Enrolled}))::int AS "activeStudents",
           COUNT(*)::int AS "totalStudents",
           (COUNT(*) FILTER (WHERE s."leadStage"::text = ${LeadStage.Enrolled}))::int AS "enrolledStudents",
           (COUNT(*) FILTER (
             WHERE s."leadStage"::text = ${LeadStage.Enrolled}
               AND s."updatedAt" >= ${from}
               AND s."updatedAt" < ${to}
           ))::int AS "enrolledInPeriod"
    FROM "Student" s
    WHERE s."businessId" = ${businessId}
      AND s."branchId" = ${branchId}
      AND s."isDeleted" = false
    GROUP BY 1`;
}

export async function GroupOpenApplicationsByCounselor(businessId, branchId, closedStatuses) {
  const grouped = await prisma.studentApplication.groupBy({
    by: ["counselorId"],
    where: {
      businessId,
      branchId,
      deletedAt: null,
      applicationStatus: { notIn: closedStatuses },
    },
    _count: { _all: true },
  });
  return grouped.map((g) => ({ counselorId: g.counselorId, count: g._count._all }));
}

// Users of a role currently working the branch (active, assigned to it).
export function FindActiveBranchUsersByRole(businessId, branchId, role) {
  return prisma.user.findMany({
    where: {
      businessId,
      role,
      isDeleted: false,
      status: UserStatus.Active,
      userBranches: { some: { branchId, deletedAt: null } },
    },
    select: { id: true, name: true },
  });
}

// Names for users who still hold branch work but no longer qualify for
// FindActiveBranchUsersByRole (deactivated, deleted or moved off the branch).
export function FindUsersByIds(userIds) {
  return prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
}

// Per admission officer (null = unassigned) application counts for the branch.
// "Successful" means the application got an offer or went past it.
export function GroupApplicationWorkloadByAdmissionOfficer(
  businessId,
  branchId,
  { from, to },
) {
  const closed = [ApplicationStatus.Enrolled, ApplicationStatus.Rejected];
  const successful = [
    ApplicationStatus["Offer Letter Issued"],
    ApplicationStatus["Visa Processing"],
    ApplicationStatus.Enrolled,
  ];

  return prisma.$queryRaw`
    SELECT a."admissionOfficerId" AS "admissionOfficerId",
           (COUNT(*) FILTER (WHERE a."applicationStatus" NOT IN (${Prisma.join(closed)})))::int AS "openApplications",
           (COUNT(*) FILTER (WHERE a."applicationStatus" = ${ApplicationStatus["Under Review"]}))::int AS "underReview",
           (COUNT(*) FILTER (WHERE a."applicationStatus" = ${ApplicationStatus["Pending Documents"]}))::int AS "pendingDocuments",
           (COUNT(*) FILTER (
             WHERE a."applicationSubmittedAt" >= ${from}
               AND a."applicationSubmittedAt" < ${to}
           ))::int AS "submittedInPeriod",
           (COUNT(*) FILTER (WHERE a."applicationStatus" IN (${Prisma.join(successful)})))::int AS "successfulApplications",
           (COUNT(*) FILTER (WHERE a."applicationStatus" = ${ApplicationStatus.Rejected}))::int AS "rejectedApplications"
    FROM "StudentApplication" a
    WHERE a."businessId" = ${businessId}
      AND a."branchId" = ${branchId}
      AND a."deletedAt" IS NULL
    GROUP BY 1`;
}
