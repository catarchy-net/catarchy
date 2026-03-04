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
  constructor(message: string, data?: unknown) {
    super(message, 400, data);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, data?: unknown) {
    super(message, 401, data);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, data?: unknown) {
    super(message, 403, data);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, data?: unknown) {
    super(message, 404, data);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, data?: unknown) {
    super(message, 409, data);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string, data?: unknown) {
    super(message, 429, data);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string, data?: unknown) {
    super(message, 500, data);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, data?: unknown) {
    super(message, 502, data);
  }
}
