import HTTP_STATUS from "../shared/error.constants.js";

export const verifyRole = (...allowedRoles) => {
  const roles = allowedRoles.flat();
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        code: 0,
        data: null,
        message: "Forbidden: insufficient permissions",
      });
    }
    next();
  };
};
