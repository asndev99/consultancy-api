import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";

export function generateToken(payload) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function generateRefreshToken(payload) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
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
