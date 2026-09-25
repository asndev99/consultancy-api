import BranchRepository from "../../Infra/db/repositories/branch/index.js";
import UserRepository from "../../Infra/db/repositories/user/index.js";
import { UserRoles } from "../../shared/application.constants.js";
import { BadRequestException, NotFoundException } from "../../shared/error.js";

// Roles that are assigned to branches and can be looked up per branch.
const BranchScopedRoles = [
  UserRoles.Manager,
  UserRoles.Counselor,
  UserRoles["Admission Team"],
  UserRoles["Sub Agent"],
];

export const GetUsersByBranchAndRoleUseCase = async (req, branchId, role) => {
  const businessId = req.user.businessId;

  if (businessId == null) {
    throw new BadRequestException("User is not associated with an organization");
  }

  if (branchId == null || branchId === "") {
    throw new BadRequestException("branchId is required");
  }

  const parsedBranchId = Number(branchId);
  if (!Number.isInteger(parsedBranchId) || parsedBranchId < 1) {
    throw new BadRequestException("branchId must be a positive integer");
  }

  if (!BranchScopedRoles.includes(role)) {
    throw new BadRequestException(
      `role must be one of: ${BranchScopedRoles.join(", ")}`,
    );
  }

  const branch = await BranchRepository.FindBranchById(
    parsedBranchId,
    businessId,
  );

  if (!branch) {
    throw new NotFoundException("Branch not found");
  }

  return UserRepository.FindUsersByBranchAndRole(
    businessId,
    parsedBranchId,
    role,
  );
};
