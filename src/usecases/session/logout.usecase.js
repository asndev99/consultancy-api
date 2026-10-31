import { revokeSession } from "./auth.session.js";

export const LogoutUseCase = async (req) => {
  await revokeSession(req.user.sessionId);
  return { sessionId: req.user.sessionId };
};
