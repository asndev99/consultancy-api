import SessionRepository from "../../Infra/db/repositories/session/index.js";
import { NotFoundException } from "../../shared/error.js";
import { revokeSession } from "./auth.session.js";

// Lets a user sign out one of their own devices.
export const RevokeMySessionUseCase = async (req, sessionId) => {
  const session = await SessionRepository.FindSessionById(String(sessionId));

  if (!session || session.userId !== req.user.id || session.revokedAt) {
    throw new NotFoundException("Session not found");
  }

  await revokeSession(session.id);
  return { sessionId: session.id };
};
