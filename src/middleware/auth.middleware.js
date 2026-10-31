import { verifyAccessToken } from "../shared/utils.js";
import {
  getSessionState,
  isSessionUsable,
  isUserAllowedToSignIn,
  loadUserAuthContext,
} from "../usecases/session/auth.session.js";

// The access token only identifies a session. Each request checks that the
// session is still live and loads the user's current role, business and
// branches, so logouts, deactivation and role changes apply immediately.
export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  let claims;
  try {
    claims = verifyAccessToken(token);
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }

  try {
    const session = await getSessionState(claims.sessionId);
    if (!isSessionUsable(session, claims.userId)) {
      return res
        .status(401)
        .json({ message: "Session has expired or been revoked" });
    }

    const user = await loadUserAuthContext(claims.userId);
    if (!isUserAllowedToSignIn(user)) {
      return res.status(401).json({ message: "Account is not active" });
    }

    const { status, isDeleted, ...currentUser } = user;
    req.user = { ...currentUser, sessionId: claims.sessionId };
    next();
  } catch (error) {
    next(error);
  }
}
