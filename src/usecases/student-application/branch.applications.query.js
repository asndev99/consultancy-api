import StudentApplicationRepository from "../../Infra/db/repositories/student-application/index.js";
import { BadRequestException } from "../../shared/error.js";
import { ApplicationStatus } from "../../shared/application.constants.js";

export function parseOptionalId(value, name) {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestException(`Invalid ${name}`);
  }
  return parsed;
}

// "0" means "not assigned yet" (matches unassignedWhere); any other value must be a valid id.
export function buildAssignmentFilter(value, idField, unassignedWhere) {
  if (value == null || String(value).trim() === "") return {};
  if (Number(value) === 0) return unassignedWhere;
  return { [idField]: parseOptionalId(value, idField) };
}

export const UnassignedWhere = {
  manager: { isManagerAssigned: false },
  admissionOfficer: { isAdmissionTeamAssigned: false },
  counselor: { counselorId: null },
};

// Case-insensitive match on target university or student name; blank terms are ignored.
export function buildSearchFilter(searchTerm) {
  const term = typeof searchTerm === "string" ? searchTerm.trim() : "";
  if (term === "") return {};
  return {
    OR: [
      { applicationTargetUniversity: { contains: term, mode: "insensitive" } },
      { Student: { fullName: { contains: term, mode: "insensitive" } } },
    ],
  };
}

// Optional status / manager / admission officer / search filters shared by the
// counselor and sub agent views.
export function buildOwnApplicationsFilters({
  status,
  managerId,
  admissionOfficerId,
  searchTerm,
} = {}) {
  const parsedStatus = parseOptionalStatus(status);
  return {
    ...(parsedStatus != null ? { applicationStatus: parsedStatus } : {}),
    ...buildAssignmentFilter(managerId, "managerId", UnassignedWhere.manager),
    ...buildAssignmentFilter(
      admissionOfficerId,
      "admissionOfficerId",
      UnassignedWhere.admissionOfficer,
    ),
    ...buildSearchFilter(searchTerm),
  };
}

export function parseRequiredBranchId(branchId) {
  const parsed = parseOptionalId(branchId, "branchId");
  if (parsed == null) {
    throw new BadRequestException("branchId is required");
  }
  return parsed;
}

export function parseOptionalStatus(status) {
  if (status == null || status === "") return undefined;
  if (!Object.values(ApplicationStatus).includes(status)) {
    throw new BadRequestException("Invalid status");
  }
  return status;
}

// Paginated list of a branch's applications, always scoped to the actor's business.
export async function listBranchApplications(
  req,
  where,
  { page = 1, limit = 10 } = {},
) {
  if (!Number.isInteger(page) || page < 1) {
    throw new BadRequestException("Invalid page");
  }
  if (!Number.isInteger(limit) || limit < 1) {
    throw new BadRequestException("Invalid limit");
  }

  const businessId = req.user.businessId ?? null;

  const [total, applications] = await Promise.all([
    StudentApplicationRepository.CountStudentApplications(businessId, where),
    StudentApplicationRepository.FindStudentApplications(businessId, where, {
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    data: applications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
