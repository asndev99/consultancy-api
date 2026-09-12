import StudentRepository from "../../Infra/db/repositories/student/index.js";
import { BadRequestException } from "../../shared/error.js";
import { LeadStage } from "../../generated/prisma/client.js";

export const GetStudentsByBranchUseCase = async ({
  businessId,
  branchId,
  page = 1,
  pageSize = 10,
  counselorId,
  leadStage,
  searchTerm,
}) => {
  if (branchId == null) {
    throw new BadRequestException("branchId is required");
  }

  if (leadStage && !Object.values(LeadStage).includes(leadStage)) {
    throw new BadRequestException("Invalid leadStage filter");
  }

  const parsedBusinessId = businessId != null ? Number(businessId) : null;
  const parsedBranchId = Number(branchId);
  const skip = (page - 1) * pageSize;

  const filters = {
    ...(counselorId != null ? { counselorId: Number(counselorId) } : {}),
    ...(leadStage ? { leadStage } : {}),
    ...(searchTerm ? { searchTerm } : {}),
  };

  const [total, students] = await Promise.all([
    StudentRepository.CountStudentsByBusinessBranch(
      parsedBusinessId,
      parsedBranchId,
      filters,
    ),
    StudentRepository.FindStudentsByBusinessBranch(
      parsedBusinessId,
      parsedBranchId,
      {
        ...filters,
        skip,
        take: pageSize,
      },
    ),
  ]);

  return {
    data: students,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};
