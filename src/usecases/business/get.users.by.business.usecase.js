import BusinessRepository from "../../Infra/db/repositories/business/index.js";
import { UserRoles } from "../../shared/application.constants.js";
import { BadRequestException } from "../../shared/error.js";

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
  filterRole,
  isActive,
}) => {
  if (branchId == null) {
    throw new BadRequestException("branchId is required");
  }

  if (filterRole && !Object.values(UserRoles).includes(filterRole)) {
    throw new BadRequestException("Invalid role filter");
  }

  const parsedBusinessId = Number(businessId);
  const parsedBranchId = Number(branchId);
  const skip = (page - 1) * pageSize;

  if (role === UserRoles["Manager"]) {
    const managerBranches =
      await BusinessRepository.FindAssignedBranchesToUserByUserId(
        Number(userId),
      );
    const isManagerOfBranch = managerBranches.some(
      (ub) => ub.branchId === parsedBranchId,
    );

    if (!isManagerOfBranch) {
      return emptyResult(page, pageSize);
    }
  }

  const [total, users] = await Promise.all([
    BusinessRepository.countBusinessUsers({
      businessId: parsedBusinessId,
      name,
      branchId: parsedBranchId,
      role: filterRole,
      isActive,
    }),
    BusinessRepository.getUsersByBusinessId({
      businessId: parsedBusinessId,
      name,
      branchId: parsedBranchId,
      role: filterRole,
      isActive,
      skip,
      take: pageSize,
    }),
  ]);

  return {
    data: users,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};
