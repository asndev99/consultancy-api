import SubAgentRepository from "../../Infra/db/repositories/sub-agent/index.js";
import { UserRoles } from "../../shared/application.constants.js";
import { NotFoundException } from "../../shared/error.js";

// Loads a sub agent's branch profile within the actor's business.
export const findSubAgentProfile = async (req, subAgentId) => {
  const parsedId = Number(subAgentId);
  const profile = Number.isInteger(parsedId)
    ? await SubAgentRepository.FindSubAgentProfileById(
        parsedId,
        req.user.businessId || null,
      )
    : null;

  if (!profile || profile.branch.User.role !== UserRoles["Sub Agent"]) {
    throw new NotFoundException("Sub agent not found");
  }

  return profile;
};

export const formatSubAgentProfile = ({ branch, ...profile }) => ({
  id: profile.id,
  userId: branch.User.id,
  name: branch.User.name,
  email: branch.User.email,
  phoneNumber: branch.User.phoneNumber,
  status: branch.User.status,
  inviteAcceptedAt: branch.User.inviteAcceptedAt,
  isEmailVerified: branch.User.isEmailVerified,
  companyName: profile.companyName,
  commissionRate: profile.commissionRate,
  targetCountries: profile.targetCountries,
  referredStudents: profile.referredStudents,
  branchName: branch.Branch.name,
});
