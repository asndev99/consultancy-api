import crypto from "node:crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30);
const REFRESH_TOKEN_TTL_MS = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
const INVITE_TOKEN_EXPIRES_IN = process.env.INVITE_TOKEN_EXPIRES_IN || "24h";

export function generateToken(payload) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Access tokens identify a session, not a user snapshot: authMiddleware loads
// the user's current role/business/branches on every request. `type` keeps
// invite tokens (same secret) from being accepted as access tokens.
export function generateAccessToken({ userId, sessionId }) {
  return generateToken({ sub: String(userId), sid: sessionId, type: "access" });
}

export function verifyAccessToken(token) {
  const payload = verifyToken(token);
  if (payload.type !== "access" || !payload.sid || !payload.sub) {
    throw new Error("Invalid token");
  }
  return { userId: Number(payload.sub), sessionId: payload.sid };
}

// Refresh tokens are opaque random strings, never JWTs; only their hash is
// stored, so a database leak doesn't hand out usable tokens.
export function generateRefreshTokenValue() {
  return crypto.randomBytes(48).toString("base64url");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function refreshTokenExpiresAt(from = new Date()) {
  return new Date(from.getTime() + REFRESH_TOKEN_TTL_MS);
}

export function generateInviteToken(payload) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: INVITE_TOKEN_EXPIRES_IN });
}

export function verifyToken(token) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    }
    throw new Error("Invalid token");
  }
}

export function generateBranchCode(businessName) {
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `${businessName.replace(/\s+/g, "").toUpperCase()}-${randomNumber}`;
}

export function generateBusinessCode(businessName) {
  const prefix = businessName.replace(/\s+/g, "").slice(0, 2).toUpperCase();
  const randomNumber = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}${randomNumber}`;
}

export function generateEmployeeCode(businessName, number) {
  const cleaned = businessName.replace(/\s+/g, "");
  const prefix = (cleaned.slice(0, 2) || "XX").toUpperCase();

  const paddedNumber = String(number).padStart(5, "0");

  return `${prefix}-${paddedNumber}`;
}

export function generateStudentCode(businessCode, sequence) {
  const paddedNumber = String(sequence).padStart(5, "0");
  return `${businessCode}-STU-${paddedNumber}`;
}

// Derives a numeric tracking id from businessId/branchId/studentId plus a
// random suffix. Not guaranteed unique on its own — callers must retry on a
// unique constraint violation (Prisma error code P2002).
// Path is derived at runtime from BACKEND_DOMAIN rather than stored, so
// only fileKey needs to live in the database.
export function buildFileUrl(fileKey) {
  const backendDomain = process.env.BACKEND_DOMAIN || "";
  return `${backendDomain}/public/${fileKey}`;
}

export function generateApplicationId(businessId, branchId, studentId) {
  const pad = (value, length) =>
    String(Math.abs(Number(value) || 0) % 10 ** length).padStart(length, "0");
  const randomSuffix = Math.floor(10 + Math.random() * 90);

  return Number(
    `${pad(businessId, 2)}${pad(branchId, 2)}${pad(studentId, 3)}${randomSuffix}`,
  );
}
