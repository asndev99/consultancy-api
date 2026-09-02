import BusinessRepository from "../../Infra/db/repositories/business/index.js";
import { UserRoles } from "../../shared/application.constants.js";

const emptyResult = (page, pageSize) => ({
  data: [],
  pagination: { total: 0, page, pageSize, totalPages: 0 },
});

export const GetUsersByBusinessUseCase = async ({
  role,
  businessId,
  userId,
  name,
  branchId,
  page = 1,
  pageSize = 10,
}) => {
  const parsedBusinessId = Number(businessId);
  const parsedBranchId = branchId != null ? Number(branchId) : undefined;
  const skip = (page - 1) * pageSize;

  let branchIds;

  if (role === UserRoles["Manager"]) {
    const managerBranches =
      await BusinessRepository.FindAssignedBranchesToUserByUserId(
        Number(userId),
      );
    const managerBranchIds = managerBranches.map((ub) => ub.branchId);

    if (managerBranchIds.length === 0) {
      return emptyResult(page, pageSize);
    }

    if (parsedBranchId != null) {
      if (!managerBranchIds.includes(parsedBranchId)) {
        return emptyResult(page, pageSize);
      }
      branchIds = [parsedBranchId];
    } else {
      branchIds = managerBranchIds;
    }

    const managerBranchIdSet = new Set(managerBranchIds);

    const [total, users] = await Promise.all([
      BusinessRepository.countBusinessUsers({
        businessId: parsedBusinessId,
        name,
        branchIds,
      }),
      BusinessRepository.getUsersByBusinessId({
        businessId: parsedBusinessId,
        name,
        branchIds,
        skip,
        take: pageSize,
      }),
    ]);

    const data = users.map(({ userBranches, ...user }) => ({
      ...user,
      branches: userBranches
        .map((ub) => ub.Branch)
        .filter((branch) => managerBranchIdSet.has(branch.id)),
    }));

    return {
      data,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  // Business Admin
  branchIds = parsedBranchId != null ? [parsedBranchId] : undefined;

  const [total, users] = await Promise.all([
    BusinessRepository.countBusinessUsers({
      businessId: parsedBusinessId,
      name,
      branchIds,
    }),
    BusinessRepository.getUsersByBusinessId({
      businessId: parsedBusinessId,
      name,
      branchIds,
      skip,
      take: pageSize,
    }),
  ]);

  const data = users.map(({ userBranches, ...user }) => ({
    ...user,
    branches: userBranches.map((ub) => ub.Branch),
  }));

  return {
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};
