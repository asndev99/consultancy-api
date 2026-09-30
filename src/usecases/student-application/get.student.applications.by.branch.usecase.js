import StudentApplicationRepository from "../../Infra/db/repositories/student-application/index.js";
import { BadRequestException, ForBiddenException } from "../../shared/error.js";
import { UserRoles } from "../../shared/application.constants.js";

function parseOptionalId(value, name) {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestException(`Invalid ${name}`);
  }
  return parsed;
}

// Builds the role-specific part of the where clause.
function buildRoleScope(currentUser, managerId, admissionOfficerId) {
  const optionalFilters = {
    ...(managerId != null ? { managerId } : {}),
    ...(admissionOfficerId != null ? { admissionOfficerId } : {}),
  };

  switch (currentUser.role) {
    case UserRoles["Counselor"]:
      return { createdBy: currentUser.id, ...optionalFilters };
    case UserRoles["Admission Team"]:
      return { admissionOfficerId: currentUser.id };
    case UserRoles["Manager"]:
    case UserRoles["Business Admin"]:
      return optionalFilters;
    default:
      throw new ForBiddenException(
        "You are not allowed to view student applications",
      );
  }
}

export const GetStudentApplicationsByBranchUseCase = async (
  req,
  branchId,
  { page = 1, limit = 10 } = {},
  { managerId, admissionOfficerId } = {},
) => {
  const parsedBranchId = parseOptionalId(branchId, "branchId");
  if (parsedBranchId == null) {
    throw new BadRequestException("branchId is required");
  }

  if (!Number.isInteger(page) || page < 1) {
    throw new BadRequestException("Invalid page");
  }
  if (!Number.isInteger(limit) || limit < 1) {
    throw new BadRequestException("Invalid limit");
  }

  const where = {
    branchId: parsedBranchId,
    ...buildRoleScope(
      req.user,
      parseOptionalId(managerId, "managerId"),
      parseOptionalId(admissionOfficerId, "admissionOfficerId"),
    ),
  };

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
};
