// Custom error types for the application

export interface ApiError extends Error {
  statusCode: number,
  message: string,
  details?: unknown;
}

export class NotFoundError extends Error implements ApiError {
  statusCode = 404;
  constructor(message = 'Resource not found') {;
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error implements ApiError {
  statusCode = 400;
  details?: unknown;

  constructor(message = 'Invalid request data', details?: unknown) {;
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class ServiceError extends Error implements ApiError {
  statusCode = 500;

  constructor(message = 'Service error occurred') {;
    super(message);
    this.name = 'ServiceError';
  }
}

export class AstrologyCalculationError extends Error implements ApiError {
  statusCode = 500;

  constructor(message = 'Error during astronomical calculation') {;
    super(message);
    this.name = 'AstrologyCalculationError';
  }
}
