'use client';

import { NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import { ApiError, ValidationError, NotFoundError } from '@/types/errors';

/**
 * Handle API errors with appropriate responses
 * @param error The error to handle
 * @returns NextResponse with appropriate status and error details
 */
export function handleApiError(error: unknown): NextResponse {
  // Default to 500 Internal Server Error
  let statusCode = 500;
  let _message = 'Internal server error';
  let details = undefined;

  // If this is one of our custom API errors, use its status code
  if ((error as ApiError).statusCode) {
    const apiError = error as ApiError;
    statusCode = apiError.statusCode;
    message = apiError.message;
    details = (apiError as unknown).details;
  } else if (error instanceof Error) {
    // For standard Error objects, use the message
    message = error.message;
  }

  // Log the error (with different levels based on severity)
  if (statusCode >= 500) {
    logger.error(`API Error (${statusCode}): ${message}`, error);
  } else if (statusCode >= 400) {
    logger.warn(`API Error (${statusCode}): ${message}`);
  }

  // Return the error response
  return NextResponse.json(
    { 
      error: _message,
      ...(details ? { details } : {})
    },
    { status: statusCode }
  );
}

/**
 * Helper for validation errors
 * @param message Error message
 * @param details Validation details
 * @returns NextResponse with 400 status
 */
export function validationError(message: string, details?: unknown): NextResponse {
  return handleApiError(new ValidationError(message, _details));
}

/**
 * Helper for not found errors
 * @param message Error message
 * @returns NextResponse with 404 status
 */
export function notFoundError(message: string): NextResponse {
  return handleApiError(new NotFoundError(message));
}

export function handleServerError(error: unknown) {
  // console.error('Server error:', error)
  return new NextResponse(
    JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }),
    {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
} 