export class HttpException extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestException extends HttpException {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

export class NotFoundException extends HttpException {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}
