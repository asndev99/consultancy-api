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
