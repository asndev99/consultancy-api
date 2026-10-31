import { prisma } from "../../prisma.client.js";

const sessionStateSelect = {
  id: true,
  userId: true,
  expiresAt: true,
  revokedAt: true,
};

export async function CreateSession(payload) {
  return prisma.session.create({
    data: payload,
    select: sessionStateSelect,
  });
}

export async function FindSessionById(sessionId) {
  return prisma.session.findUnique({
    where: { id: sessionId },
    select: sessionStateSelect,
  });
}

export async function FindSessionByRefreshTokenHash(refreshTokenHash) {
  return prisma.session.findUnique({
    where: { refreshTokenHash },
    select: sessionStateSelect,
  });
}

export async function FindSessionByPreviousRefreshTokenHash(refreshTokenHash) {
  return prisma.session.findUnique({
    where: { previousRefreshTokenHash: refreshTokenHash },
    select: sessionStateSelect,
  });
}

// Conditional on the presented hash so two concurrent refreshes with the same
// token can't both succeed: the loser updates 0 rows.
export async function RotateSessionRefreshToken(
  sessionId,
  currentRefreshTokenHash,
  newRefreshTokenHash,
  expiresAt,
) {
  return prisma.session.updateMany({
    where: {
      id: sessionId,
      refreshTokenHash: currentRefreshTokenHash,
      revokedAt: null,
    },
    data: {
      refreshTokenHash: newRefreshTokenHash,
      previousRefreshTokenHash: currentRefreshTokenHash,
      expiresAt,
      lastUsedAt: new Date(),
    },
  });
}

export async function FindActiveSessionsByUser(userId) {
  return prisma.session.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    select: {
      id: true,
      userAgent: true,
      ipAddress: true,
      createdAt: true,
      lastUsedAt: true,
      expiresAt: true,
    },
    orderBy: { lastUsedAt: "desc" },
  });
}

export async function FindActiveSessionIdsByUser(userId) {
  const sessions = await prisma.session.findMany({
    where: { userId, revokedAt: null },
    select: { id: true },
  });
  return sessions.map(({ id }) => id);
}

export async function RevokeSessions(sessionIds) {
  return prisma.session.updateMany({
    where: { id: { in: sessionIds }, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
