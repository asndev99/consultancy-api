import BranchRepository from "../../Infra/db/repositories/branch/index.js";
import UserRepository from "../../Infra/db/repositories/user/index.js";
import { BadRequestException, NotFoundException } from "../../shared/error.js";

export const GetCounselorsByBranchUseCase = async (
  organizationId,
  branchId,
) => {
  if (organizationId == null) {
    throw new BadRequestException("organizationId is required");
  }

  const parsedBusinessId = Number(organizationId);
  const parsedBranchId = Number(branchId);

  const branch = await BranchRepository.FindBranchById(
    parsedBranchId,
    parsedBusinessId,
  );

  if (!branch) {
    throw new NotFoundException("Branch not found");
  }

  return UserRepository.FindCounselorsByBranch(
    parsedBusinessId,
    parsedBranchId,
  );
};
