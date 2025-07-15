export * from './error';
export * from './globalErrorHandler';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode = 500,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

interface ErrorResponse {
  message: string;
  statusCode: number;
}

export function handleError(error: unknown): ErrorResponse {
  // Handle AppError instances
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode
    };
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      statusCode: 500
    };
  }

  // Handle unknown errors
  return {
    message: 'An unexpected error occurred',
    statusCode: 500
  };
}

export const errorMessages = {
  INVALID_REQUEST: 'Invalid request parameters',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  INTERNAL_ERROR: 'Internal server error',
  API_ERROR: 'API request failed',
  VALIDATION_ERROR: 'Validation failed',
  DATA_ERROR: 'Data processing error',
  NETWORK_ERROR: 'Network error',
  TIMEOUT_ERROR: 'Request timeout',
} as const;

export const errorCodes = {
  INVALID_REQUEST: 400,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INTERNAL_ERROR: 500,
  API_ERROR: 502,
  VALIDATION_ERROR: 422,
  DATA_ERROR: 422,
  NETWORK_ERROR: 503,
  TIMEOUT_ERROR: 504,
} as const;

export function createError(
  code: keyof typeof errorMessages,
  context?: Record<string, unknown>
): AppError {
  return new AppError(
    errorMessages[code],
    code,
    errorCodes[code],
    context
  );
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

export function getErrorCode(error: unknown): number {
  if (isAppError(error)) {
    return error.statusCode;
  }
  return 500;
} 