import SessionRepository from "../../Infra/db/repositories/session/index.js";

export const GetMySessionsUseCase = async (req) => {
  const sessions = await SessionRepository.FindActiveSessionsByUser(
    req.user.id,
  );

  return sessions.map((session) => ({
    ...session,
    isCurrent: session.id === req.user.sessionId,
  }));
};
