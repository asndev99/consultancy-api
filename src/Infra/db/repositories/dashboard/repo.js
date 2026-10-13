import { Prisma } from "../../../../generated/prisma/client.js";
import { prisma } from "../../prisma.client.js";
import { ApplicationStatus, UserRoles } from "../../../../shared/application.constants.js";

const branchFilter = (branchId) => (branchId != null ? { branchId } : {});

const toKeyCountRows = (grouped, field) =>
  grouped.map((g) => ({ key: g[field], count: g._count._all }));

function subAgentWhere(businessId, branchId) {
  return {
    businessId,
    role: UserRoles["Sub Agent"],
    isDeleted: false,
    ...(branchId != null
      ? { userBranches: { some: { branchId, deletedAt: null } } }
      : {}),
  };
}

export async function CountBranches(businessId) {
  const [total, active] = await Promise.all([
    prisma.branch.count({ where: { businessId, isDeleted: false } }),
    prisma.branch.count({ where: { businessId, isDeleted: false, isActive: true } }),
  ]);
  return { total, active };
}

export function CountStudents(businessId, branchId) {
  return prisma.student.count({
    where: { businessId, isDeleted: false, ...branchFilter(branchId) },
  });
}

export function CountSubAgents(businessId, branchId) {
  return prisma.user.count({ where: subAgentWhere(businessId, branchId) });
}

export async function GroupApplicationsByStatus(businessId, branchId) {
  const grouped = await prisma.studentApplication.groupBy({
    by: ["applicationStatus"],
    where: { businessId, deletedAt: null, ...branchFilter(branchId) },
    _count: { _all: true },
  });
  return toKeyCountRows(grouped, "applicationStatus");
}

export function ListBranches(businessId) {
  return prisma.branch.findMany({
    where: { businessId, isDeleted: false },
    select: { id: true, name: true, isActive: true },
  });
}

export async function GroupStudentsByBranch(businessId) {
  const grouped = await prisma.student.groupBy({
    by: ["branchId"],
    where: { businessId, isDeleted: false },
    _count: { _all: true },
  });
  return grouped.map((g) => ({ branchId: g.branchId, count: g._count._all }));
}

export async function GroupSubAgentsByBranch(businessId) {
  const grouped = await prisma.userBranch.groupBy({
    by: ["branchId"],
    where: {
      businessId,
      deletedAt: null,
      User: { role: UserRoles["Sub Agent"], isDeleted: false },
    },
    _count: { _all: true },
  });
  return grouped.map((g) => ({ branchId: g.branchId, count: g._count._all }));
}

export async function GroupApplicationsByBranchAndStatus(businessId) {
  const grouped = await prisma.studentApplication.groupBy({
    by: ["branchId", "applicationStatus"],
    where: { businessId, deletedAt: null },
    _count: { _all: true },
  });
  return grouped.map((g) => ({
    branchId: g.branchId,
    key: g.applicationStatus,
    count: g._count._all,
  }));
}

async function groupStudentsBy(field, businessId, branchId) {
  const grouped = await prisma.student.groupBy({
    by: [field],
    where: { businessId, isDeleted: false, ...branchFilter(branchId) },
    _count: { _all: true },
  });
  return toKeyCountRows(grouped, field);
}

export function GroupStudentsByLeadStage(businessId, branchId) {
  return groupStudentsBy("leadStage", businessId, branchId);
}

export function GroupStudentsByLeadSource(businessId, branchId) {
  return groupStudentsBy("leadSource", businessId, branchId);
}

export async function GroupApplicationsByTargetCountry(businessId, branchId) {
  const grouped = await prisma.studentApplication.groupBy({
    by: ["targetCountry"],
    where: { businessId, deletedAt: null, ...branchFilter(branchId) },
    _count: { _all: true },
  });
  return toKeyCountRows(grouped, "targetCountry");
}

export function ListSubAgents(businessId, branchId) {
  return prisma.user.findMany({
    where: subAgentWhere(businessId, branchId),
    select: {
      id: true,
      name: true,
      status: true,
      // The profile that supplies companyName: the branch's own, or else the earliest one.
      userBranches: {
        where: {
          deletedAt: null,
          businessId,
          Branch: { isDeleted: false },
          ...branchFilter(branchId),
          subAgentPartnerDetails: { is: { deletedAt: null } },
        },
        orderBy: { subAgentPartnerDetails: { createdAt: "asc" } },
        take: 1,
        select: { subAgentPartnerDetails: { select: { companyName: true } } },
      },
    },
  });
}

export async function GroupStudentsByCreator(businessId, branchId, creatorIds) {
  if (creatorIds.length === 0) {
    return [];
  }
  const grouped = await prisma.student.groupBy({
    by: ["createdBy"],
    where: {
      businessId,
      isDeleted: false,
      createdBy: { in: creatorIds },
      ...branchFilter(branchId),
    },
    _count: { _all: true },
  });
  return grouped.map((g) => ({ agentId: g.createdBy, count: g._count._all }));
}

// Applications are credited to the sub agent who created the student.
export function GroupApplicationsByCreatorAndStatus(businessId, branchId, creatorIds) {
  if (creatorIds.length === 0) {
    return Promise.resolve([]);
  }
  return prisma.$queryRaw`
    SELECT s."createdBy" AS "agentId",
           a."applicationStatus" AS "key",
           COUNT(*)::int AS "count",
           COUNT(DISTINCT s."id")::int AS "students"
    FROM "StudentApplication" a
    JOIN "Student" s ON s."id" = a."studentId"
    WHERE s."businessId" = ${businessId}
      AND s."isDeleted" = false
      AND a."deletedAt" IS NULL
      AND s."createdBy" IN (${Prisma.join(creatorIds)})
      ${branchId != null ? Prisma.sql`AND s."branchId" = ${branchId}` : Prisma.empty}
    GROUP BY s."createdBy", a."applicationStatus"`;
}

export function FindBusinessTimeZone(businessId) {
  return prisma.business.findUnique({
    where: { id: businessId },
    select: { timeZone: true },
  });
}

const PERIOD_LABEL_FORMAT = { day: "YYYY-MM-DD", week: "YYYY-MM-DD", month: "YYYY-MM" };

// table/column come only from the hard-coded callers below, never from user input.
function countByPeriod({ table, column, filter, businessId, branchId, from, to, groupBy, timeZone }) {
  const localTime = Prisma.sql`(${Prisma.raw(`"${column}"`)} AT TIME ZONE ${timeZone})`;
  return prisma.$queryRaw`
    SELECT to_char(date_trunc(${groupBy}, ${localTime}), ${PERIOD_LABEL_FORMAT[groupBy]}) AS "period",
           COUNT(*)::int AS "count"
    FROM ${Prisma.raw(`"${table}"`)}
    WHERE "businessId" = ${businessId}
      AND ${filter}
      ${branchId != null ? Prisma.sql`AND "branchId" = ${branchId}` : Prisma.empty}
      AND ${localTime}::date BETWEEN ${from}::date AND ${to}::date
    GROUP BY 1`;
}

export function CountNewStudentsByPeriod(params) {
  return countByPeriod({
    ...params,
    table: "Student",
    column: "createdAt",
    filter: Prisma.sql`"isDeleted" = false`,
  });
}

export function CountNewApplicationsByPeriod(params) {
  return countByPeriod({
    ...params,
    table: "StudentApplication",
    column: "createdAt",
    filter: Prisma.sql`"deletedAt" IS NULL`,
  });
}

// No status history exists, so updatedAt approximates the enrollment date.
export function CountEnrolledApplicationsByPeriod(params) {
  return countByPeriod({
    ...params,
    table: "StudentApplication",
    column: "updatedAt",
    filter: Prisma.sql`"deletedAt" IS NULL AND "applicationStatus" = ${ApplicationStatus.Enrolled}`,
  });
}
