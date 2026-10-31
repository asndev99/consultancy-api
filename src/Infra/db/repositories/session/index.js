import {
  CreateSession,
  FindSessionById,
  FindSessionByRefreshTokenHash,
  FindSessionByPreviousRefreshTokenHash,
  RotateSessionRefreshToken,
  FindActiveSessionsByUser,
  FindActiveSessionIdsByUser,
  RevokeSessions,
} from "./repo.js";

const SessionRawRepository = {
  CreateSession,
  FindSessionById,
  FindSessionByRefreshTokenHash,
  FindSessionByPreviousRefreshTokenHash,
  RotateSessionRefreshToken,
  FindActiveSessionsByUser,
  FindActiveSessionIdsByUser,
  RevokeSessions,
};

const SessionRepository = new Proxy(SessionRawRepository, {
  get(target, methodName) {
    const originalMethod = target[methodName];

    if (typeof originalMethod !== "function") {
      return originalMethod;
    }

    return function (...args) {
      console.log(
        `[Session Repository] calling "${String(methodName)}" with:`,
        args,
      );
      return originalMethod.apply(this, args);
    };
  },
});

export default SessionRepository;
