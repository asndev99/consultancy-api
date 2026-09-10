import BranchRepository from "../../Infra/db/repositories/branch/index.js";

export const GetBranchesByBusinessUseCase = async (
  businessId,
  page = 1,
  pageSize = 10,
  filters = {},
) => {
  const parsedBusinessId = Number(businessId);
  const skip = (page - 1) * pageSize;

  const [total, branches] = await Promise.all([
    BranchRepository.CountBranchesByBusinessId(parsedBusinessId, filters),
    BranchRepository.FindBranchesByBusinessId(parsedBusinessId, {
      ...filters,
      skip,
      take: pageSize,
      includeManagers: true,
    }),
  ]);

  return {
    data: branches,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};
