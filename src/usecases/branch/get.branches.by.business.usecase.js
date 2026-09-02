import BranchRepository from "../../Infra/db/repositories/branch/index.js";
import { UserRoles } from "../../shared/application.constants.js";

export const GetBranchesByBusinessUseCase = async (
  businessId,
  userId,
  role,
) => {
  const parsedBusinessId = Number(businessId);

  if (role === UserRoles["Business Admin"]) {
    return BranchRepository.FindBranchesByBusinessId(parsedBusinessId);
  }

  return BranchRepository.FindBranchesByUserId(
    Number(userId),
    parsedBusinessId,
  );
};
