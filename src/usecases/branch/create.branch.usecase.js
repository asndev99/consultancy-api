import BranchRepository from "../../Infra/db/repositories/branch/index.js";
import BusinessRepository from "../../Infra/db/repositories/business/index.js";
import UserRepository from "../../Infra/db/repositories/user/index.js";
import { BadRequestException } from "../../shared/error.js";
import { generateBranchCode } from "../../shared/utils.js";

// TODO: once transactional repository support is added, wrap the Branch and
// BranchManager creation below in a single prisma.$transaction so a failure
// creating the BranchManager rolls back the Branch too.
export const CreateBranchUseCase = async (req, payload) => {
  const { userId = null, ...branchData } = payload;

  const business = await BusinessRepository.FindBusinessById(
    payload.businessId,
  );

  const branch = await BranchRepository.FindByBranchName(payload.name);
  if (branch) {
    throw new BadRequestException("Branch with this name already exists");
  }

  const newBranch = await BranchRepository.CreateBranch({
    ...branchData,
    createdBy: req.user.id,
    branchCode: generateBranchCode(business.name),
  });

  if (userId) {
    await UserRepository.addUserToBranch({
      userId,
      branchId: newBranch.id,
      businessId: payload.businessId,
      createdBy: req.user.id,
    });
  }

  return branch;
};
