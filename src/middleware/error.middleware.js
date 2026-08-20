import logger from "../lib/application.logger.js";
import { HttpException } from "../shared/error.js";
import HTTP_STATUS from "../shared/error.constants.js";

export function errorMiddleware(err, req, res, next) {
  const statusCode =
    err instanceof HttpException
      ? err.statusCode
      : HTTP_STATUS.INTERNAL_SERVER_ERROR;

  logger.error(err.message, { stack: err.stack });

  res.status(statusCode).json({
    code: 0,
    data: null,
    message: err.message || "Internal Server Error",
  });
}
