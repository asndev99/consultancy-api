import SessionRepository from "../../Infra/db/repositories/session/index.js";
import { UnauthorizedException } from "../../shared/error.js";
import {
  generateAccessToken,
  generateRefreshTokenValue,
  hashToken,
  refreshTokenExpiresAt,
} from "../../shared/utils.js";
import {
  cacheSessionState,
  isUserAllowedToSignIn,
  loadUserAuthContext,
  revokeSession,
  revokeUserSessions,
} from "./auth.session.js";

// Exchanges a refresh token for a new access + refresh token pair. The
// presented token is rotated out; presenting it again later revokes the
// session, since only a stolen copy would still be in use.
export const RefreshSessionUseCase = async (refreshToken) => {
  const presentedHash = hashToken(refreshToken);

  const session =
    await SessionRepository.FindSessionByRefreshTokenHash(presentedHash);

  if (!session) {
    const reusedSession =
      await SessionRepository.FindSessionByPreviousRefreshTokenHash(
        presentedHash,
      );
    if (reusedSession && reusedSession.revokedAt == null) {
      await revokeSession(reusedSession.id);
    }
    throw new UnauthorizedException("Invalid refresh token");
  }

  if (session.revokedAt != null || session.expiresAt <= new Date()) {
    throw new UnauthorizedException("Session has expired or been revoked");
  }

  const user = await loadUserAuthContext(session.userId);
  if (!isUserAllowedToSignIn(user)) {
    await revokeUserSessions(session.userId);
    throw new UnauthorizedException("Account is not active");
  }

  const newRefreshToken = generateRefreshTokenValue();
  const expiresAt = refreshTokenExpiresAt();
  const { count } = await SessionRepository.RotateSessionRefreshToken(
    session.id,
    presentedHash,
    hashToken(newRefreshToken),
    expiresAt,
  );

  // Another request rotated this token first.
  if (count === 0) {
    throw new UnauthorizedException("Invalid refresh token");
  }

  await cacheSessionState(session.id, {
    userId: session.userId,
    expiresAt,
  });

  return {
    accessToken: generateAccessToken({
      userId: session.userId,
      sessionId: session.id,
    }),
    refreshToken: newRefreshToken,
  };
};
