import SubAgentRepository from "../../Infra/db/repositories/sub-agent/index.js";
import { BadRequestException } from "../../shared/error.js";
import { formatSubAgentProfile } from "./find.sub.agent.profile.js";

export const GetSubAgentsByBranchUseCase = async (req, branchId) => {
  const parsedBranchId = Number(branchId);
  if (!Number.isInteger(parsedBranchId) || parsedBranchId <= 0) {
    throw new BadRequestException("Invalid branchId");
  }

  const profiles = await SubAgentRepository.FindSubAgentsByBranch(
    req.user.businessId || null,
    parsedBranchId,
  );

  return profiles.map(formatSubAgentProfile);
};
