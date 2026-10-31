import UserRepository from "../../Infra/db/repositories/user/index.js";
import { UserStatus } from "../../shared/application.constants.js";
import { findSubAgentProfile } from "./find.sub.agent.profile.js";
import {
  invalidateUserAuthContext,
  revokeUserSessions,
} from "../session/auth.session.js";

// Status lives on the User, so it applies to the sub agent across all branches.
export const UpdateSubAgentStatusUseCase = async (req, subAgentId, status) => {
  const profile = await findSubAgentProfile(req, subAgentId);

  const updatedUser = await UserRepository.updateUserById(
    profile.branch.User.id,
    {
      status: status ? UserStatus.Active : UserStatus.InActive,
      updatedBy: req.user.id,
    },
  );

  // Deactivating signs the sub agent out everywhere; reactivating only needs
  // the cached status refreshed.
  if (updatedUser.status !== UserStatus.Active) {
    await revokeUserSessions(updatedUser.id);
  } else {
    await invalidateUserAuthContext(updatedUser.id);
  }

  return {
    id: profile.id,
    userId: updatedUser.id,
    status: updatedUser.status,
  };
};
