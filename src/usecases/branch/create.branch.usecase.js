import BranchRepository from "../../Infra/db/repositories/branch/index.js";

// TODO: once transactional repository support is added, wrap the Branch and
// BranchManager creation below in a single prisma.$transaction so a failure
// creating the BranchManager rolls back the Branch too.
export const CreateBranchUseCase = async (req, payload) => {
  const { userId, ...branchData } = payload;

  const branch = await BranchRepository.CreateBranch({
    ...branchData,
    createdBy: req.user.id,
  });

  await BranchRepository.CreateBranchManager({
    branchId: branch.id,
    managerId: userId,
    businessId: branch.businessId,
    createdBy: req.user.id,
  });

  return branch;
};
