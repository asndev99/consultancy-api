import SessionRepository from "../../Infra/db/repositories/session/index.js";
import UserRepository from "../../Infra/db/repositories/user/index.js";
import BranchRepository from "../../Infra/db/repositories/branch/index.js";
import {
  cacheDelete,
  cacheGetJson,
  cacheSetJson,
} from "../../Infra/redis/redis.service.js";
import {
  UserRoles,
  UserStatus,
} from "../../shared/application.constants.js";
import {
  generateAccessToken,
  generateRefreshTokenValue,
  hashToken,
  refreshTokenExpiresAt,
} from "../../shared/utils.js";

// Every change to a session or to what req.user carries deletes the affected
// keys (see the revoke*/invalidate* helpers below), so the TTLs are only a
// backstop for an invalidation lost while Redis was unreachable.
const SESSION_CACHE_TTL_SECONDS = Number(
  process.env.SESSION_CACHE_TTL_SECONDS || 24 * 60 * 60,
);
const USER_CONTEXT_CACHE_TTL_SECONDS = Number(
  process.env.USER_CONTEXT_CACHE_TTL_SECONDS || 24 * 60 * 60,
);

const sessionCacheKey = (sessionId) => `auth:session:${sessionId}`;
const userContextCacheKey = (userId) => `auth:user:${userId}`;

const branchAssignedRoles = [
  UserRoles.Counselor,
  UserRoles.Manager,
  UserRoles["Admission Team"],
];

// Single source of assignedBranches for login, req.user and whoami.
// Deactivated branches are hidden from everyone except Business Admins, who
// still see (and can reactivate) every non-deleted branch of their business.
export async function resolveAssignedBranches(user) {
  if (branchAssignedRoles.includes(user.role)) {
    return UserRepository.FindActiveAssignedBranchesByUserId(user.id);
  }

  if (user.businessId == null) {
    return [];
  }

  if (user.role === UserRoles["Business Admin"]) {
    return BranchRepository.FindBranchesByBusinessId(user.businessId);
  }

  return BranchRepository.FindBranchesByBusinessId(user.businessId, {
    isActive: true,
  });
}

// Stores the user as authMiddleware exposes it on req.user. Login calls this
// directly since it has already loaded the user and their branches.
export async function cacheUserAuthContext(user, assignedBranches) {
  const context = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    businessId: user.businessId,
    status: user.status,
    isDeleted: user.isDeleted,
    assignedBranches,
  };

  await cacheSetJson(
    userContextCacheKey(user.id),
    context,
    USER_CONTEXT_CACHE_TTL_SECONDS,
  );
  return context;
}

// Cached until something about the user changes and invalidates it, so role,
// business and branch changes still apply on the next request.
export async function loadUserAuthContext(userId) {
  const cached = await cacheGetJson(userContextCacheKey(userId));
  if (cached) {
    return cached;
  }

  const user = await UserRepository.findUserById(userId);
  if (!user) {
    return null;
  }

  return cacheUserAuthContext(user, await resolveAssignedBranches(user));
}

export const isUserAllowedToSignIn = (context) =>
  context != null &&
  !context.isDeleted &&
  context.status === UserStatus.Active;

export async function getSessionState(sessionId) {
  const cached = await cacheGetJson(sessionCacheKey(sessionId));
  if (cached) {
    return cached;
  }

  const session = await SessionRepository.FindSessionById(sessionId);
  if (!session) {
    return null;
  }

  const state = {
    userId: session.userId,
    expiresAt: session.expiresAt.toISOString(),
    revokedAt: session.revokedAt?.toISOString() ?? null,
  };

  if (state.revokedAt == null) {
    await cacheSessionState(sessionId, state);
  }
  return state;
}

// Also called after login and every refresh (which moves expiresAt), so the
// cached copy never holds an outdated expiry.
export async function cacheSessionState(sessionId, { userId, expiresAt }) {
  await cacheSetJson(
    sessionCacheKey(sessionId),
    {
      userId,
      expiresAt: new Date(expiresAt).toISOString(),
      revokedAt: null,
    },
    SESSION_CACHE_TTL_SECONDS,
  );
}

export const isSessionUsable = (state, userId) =>
  state != null &&
  state.revokedAt == null &&
  state.userId === userId &&
  new Date(state.expiresAt) > new Date();

export async function createSession(userId, { userAgent, ipAddress } = {}) {
  const refreshToken = generateRefreshTokenValue();

  const session = await SessionRepository.CreateSession({
    userId,
    refreshTokenHash: hashToken(refreshToken),
    userAgent: userAgent?.slice(0, 500) ?? null,
    ipAddress: ipAddress ?? null,
    expiresAt: refreshTokenExpiresAt(),
  });

  await cacheSessionState(session.id, session);

  return {
    sessionId: session.id,
    accessToken: generateAccessToken({ userId, sessionId: session.id }),
    refreshToken,
  };
}

export async function revokeSession(sessionId) {
  await SessionRepository.RevokeSessions([sessionId]);
  await cacheDelete(sessionCacheKey(sessionId));
}

// Call whenever a user's access must end now: deletion, deactivation,
// password change (with exceptSessionId = the session that changed it).
export async function revokeUserSessions(userId, { exceptSessionId } = {}) {
  const sessionIds = (
    await SessionRepository.FindActiveSessionIdsByUser(userId)
  ).filter((id) => id !== exceptSessionId);

  if (sessionIds.length > 0) {
    await SessionRepository.RevokeSessions(sessionIds);
  }

  await cacheDelete(
    ...sessionIds.map(sessionCacheKey),
    userContextCacheKey(userId),
  );
}

// Call after changing anything req.user carries (role, email, name, business,
// branch assignments) so the next request sees it.
export async function invalidateUserAuthContext(userId) {
  await cacheDelete(userContextCacheKey(userId));
}

export async function invalidateUserAuthContexts(userIds) {
  await cacheDelete(...userIds.map(userContextCacheKey));
}

// For branch changes, which show up in many users' assignedBranches at once.
export async function invalidateBusinessAuthContexts(
  businessId,
  { excludeRoles = [] } = {},
) {
  if (businessId == null) {
    return;
  }
  const userIds = await UserRepository.FindUserIdsByBusiness(businessId, {
    excludeRoles,
  });
  await invalidateUserAuthContexts(userIds);
}
