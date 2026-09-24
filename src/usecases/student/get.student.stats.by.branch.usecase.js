import StudentRepository from "../../Infra/db/repositories/student/index.js";
import { BadRequestException } from "../../shared/error.js";
import { LeadStage } from "../../generated/prisma/client.js";

export const GetStudentStatsByBranchUseCase = async ({
  businessId,
  branchId,
}) => {
  if (branchId == null) {
    throw new BadRequestException("branchId is required");
  }

  const parsedBusinessId = businessId != null ? Number(businessId) : null;
  const parsedBranchId = Number(branchId);

  const grouped = await StudentRepository.CountStudentsByStatusForBranch(
    parsedBusinessId,
    parsedBranchId,
  );

  const countsByStatus = Object.fromEntries(
    Object.values(LeadStage).map((status) => [status, 0]),
  );

  let total = 0;
  for (const { leadStage, _count } of grouped) {
    countsByStatus[leadStage] = _count._all;
    total += _count._all;
  }

  return { total, countsByStatus };
};
