import BranchRepository from "../../Infra/db/repositories/branch/index.js";
import {
  BadRequestException,
  ForBiddenException,
  NotFoundException,
} from "../../shared/error.js";
import { UserRoles } from "../../shared/application.constants.js";

const branchAssignedRoles = [UserRoles.Counselor, UserRoles.Manager];

// Validates branchId and that the actor may view it; returns the parsed id.
export async function resolveDashboardBranchId(req, branchId) {
  const parsedBranchId = Number(branchId);
  if (!Number.isInteger(parsedBranchId) || parsedBranchId <= 0) {
    throw new BadRequestException("Invalid branchId");
  }

  if (branchAssignedRoles.includes(req.user.role)) {
    const isAssigned = (req.user.assignedBranches ?? []).some(
      (branch) => branch?.id === parsedBranchId,
    );
    if (!isAssigned) {
      throw new ForBiddenException("You are not assigned to this branch");
    }
  }

  const branch = await BranchRepository.FindBranchById(
    parsedBranchId,
    req.user.businessId,
  );
  if (!branch) {
    throw new NotFoundException("Branch not found");
  }

  return parsedBranchId;
}
