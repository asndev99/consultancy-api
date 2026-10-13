import SubAgentRepository from "../../Infra/db/repositories/sub-agent/index.js";
import { UserRoles } from "../../shared/application.constants.js";
import { BadRequestException } from "../../shared/error.js";
import { formatSubAgentProfile } from "./find.sub.agent.profile.js";

export const GetSubAgentsByBranchUseCase = async (req, branchId) => {
  const parsedBranchId = Number(branchId);
  if (!Number.isInteger(parsedBranchId) || parsedBranchId <= 0) {
    throw new BadRequestException("Invalid branchId");
  }

  // Managers only see the sub agent's branches they also manage.
  const managerUserId =
    req.user.role === UserRoles["Manager"] ? Number(req.user.id) : null;

  const profiles = await SubAgentRepository.FindSubAgentsByBranch(
    req.user.businessId || null,
    parsedBranchId,
    managerUserId,
  );

  return profiles.map((profile) => ({
    ...formatSubAgentProfile(profile),
    branches: profile.branch.User.userBranches.map(({ Branch }) => Branch),
  }));
};
