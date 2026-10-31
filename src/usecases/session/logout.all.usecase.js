import { revokeUserSessions } from "./auth.session.js";

// Signs the user out everywhere, including the session making the request.
export const LogoutAllUseCase = async (req) => {
  await revokeUserSessions(req.user.id);
  return { userId: req.user.id };
};
