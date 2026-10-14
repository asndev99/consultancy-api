import BranchRepository from "../../Infra/db/repositories/branch/index.js";
import { BadRequestException, NotFoundException } from "../../shared/error.js";
import { parseBranchId } from "./dashboard.params.js";

// Resolves the admin's business and an optional branch that must belong to it.
export async function resolveDashboardScope(req, rawBranchId) {
  if (req.user.businessId == null) {
    throw new BadRequestException("User is not associated with an organization");
  }
  const businessId = Number(req.user.businessId);
  const branchId = parseBranchId(rawBranchId);

  if (branchId !== undefined) {
    const branch = await BranchRepository.FindBranchById(branchId, businessId);
    if (!branch) {
      throw new NotFoundException("Branch not found");
    }
  }

  return { businessId, branchId };
}
