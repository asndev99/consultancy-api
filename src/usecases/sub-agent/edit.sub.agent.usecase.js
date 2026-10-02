import SubAgentRepository from "../../Infra/db/repositories/sub-agent/index.js";
import UserRepository from "../../Infra/db/repositories/user/index.js";
import { BadRequestException } from "../../shared/error.js";
import {
  findSubAgentProfile,
  formatSubAgentProfile,
} from "./find.sub.agent.profile.js";

export const EditSubAgentUseCase = async (req, subAgentId, payload) => {
  const profile = await findSubAgentProfile(req, subAgentId);
  const user = profile.branch.User;

  const userData = {
    ...(payload.name !== undefined ? { name: payload.name } : {}),
    ...(payload.phoneNumber !== undefined
      ? { phoneNumber: payload.phoneNumber }
      : {}),
    updatedBy: req.user.id,
  };

  if (payload.email !== undefined && payload.email !== user.email) {
    const emailTaken =
      await UserRepository.findUserByEmailAndBusinessIncludingBranches(
        payload.email,
        profile.branch.businessId,
      );
    if (emailTaken) {
      throw new BadRequestException("User with this email already exists");
    }

    userData.email = payload.email;
    userData.previousEmailAddress = user.email;
  }

  const profileData = {
    ...(payload.companyName !== undefined
      ? { companyName: payload.companyName }
      : {}),
    ...(payload.commissionRate !== undefined
      ? { commissionRate: payload.commissionRate }
      : {}),
    ...(payload.targetCountries !== undefined
      ? { targetCountries: payload.targetCountries }
      : {}),
    updatedBy: req.user.id,
  };

  const updated = await SubAgentRepository.UpdateSubAgent({
    userId: user.id,
    userData,
    profileId: profile.id,
    profileData,
  });

  return formatSubAgentProfile(updated);
};
