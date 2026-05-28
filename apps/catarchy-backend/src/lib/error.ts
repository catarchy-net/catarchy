export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message?: string, data?: unknown) {
    super(message ?? "Bad Request", 400, data);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message?: string, data?: unknown) {
    super(message ?? "Unauthorized", 401, data);
  }
}

export class ForbiddenError extends AppError {
  constructor(message?: string, data?: unknown) {
    super(message ?? "Forbidden", 403, data);
  }
}

export class NotFoundError extends AppError {
  constructor(message?: string, data?: unknown) {
    super(message ?? "Not Found", 404, data);
  }
}

export class PreconditionFailedError extends AppError {
  constructor(message?: string, data?: unknown) {
    super(message ?? "Precondition Failed", 412, data);
  }
}

export class ConflictError extends AppError {
  constructor(message?: string, data?: unknown) {
    super(message ?? "Conflict", 409, data);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message?: string, data?: unknown) {
    super(message ?? "Too Many Requests", 429, data);
  }
}

export class InternalServerError extends AppError {
  constructor(message?: string, data?: unknown) {
    super(message ?? "Internal Server Error", 500, data);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message?: string, data?: unknown) {
    super(message ?? "External Service Error", 502, data);
  }
}
