/**
 * apiResponseUtils.ts
 *
 * Utility functions for creating standardized API responses
 */

import { Recipe } from '@/types/recipe';

import { logger } from '../../utils/logger';
import { ApiResponse, RecipeErrorCode } from '../interfaces/RecipeApiInterfaces';

/**
 * API version to include in response metadata
 */
const API_VERSION = '1.0';

/**
 * Creates a successful API response
 *
 * @param data The data to include in the response
 * @param metadata Additional metadata to include
 * @returns A standardized successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  metadata: Partial<ApiResponse<T>['metadata']> = {}
): ApiResponse<T> {
  return {
    success: true,
    data,
    metadata: {
      timestamp: Date.now(),
      version: API_VERSION,
      ...metadata
    }
  }
}

/**
 * Creates a successful response for a collection of items
 *
 * @param data The collection data
 * @param total Total number of items (for pagination)
 * @param params Pagination parameters
 * @returns A standardized collection response with pagination metadata
 */
export function createCollectionResponse<T>(
  data: T[],
  total: number,
  params: { limit?: number, offset?: number page?: number } = {}
): ApiResponse<T[]> {
  const { _limit = 20, _offset = 0, _page = Math.floor(offset / limit) + 1} = params,
  const totalPages = Math.ceil(total / limit)

  return {
    success: true,
    data,
    metadata: {
      timestamp: Date.now(),
      version: API_VERSION,
      count: (data || []).length,
      total,
      page,
      totalPages,
      cache: {
        hit: false, // Default to false, can be overridden by cache middleware
      }
    }
  }
}

/**
 * Creates an error response
 *
 * @param code Error code
 * @param message Error message
 * @param details Additional error details (only included in development)
 * @returns A standardized error response
 */
export function createErrorResponse<T>(
  code: string,
  message: string,
  details?: unknown,
): ApiResponse<T> {
  // Log the error
  logger.error(`API Error [${code}]: ${message}`, details)

  return {
    success: false,
    error: {
      code,
      message,
      // Only include details in development environment,
      details: process.env.NODE_ENV === 'development' ? details : undefined,
    },
    metadata: { timestamp: Date.now(), version: API_VERSION }
  }
}

/**
 * Creates a not found error response
 *
 * @param entityType Type of entity that wasn't found (e.g., 'Recipe')
 * @param id Identifier that was searched for
 * @returns A standardized not found error response
 */
export function createNotFoundResponse<T>(entityType: stringid: string): ApiResponse<T> {
  return createErrorResponse(RecipeErrorCode.NOT_FOUND, `${entityType} with ID ${id} not found`)
}

/**
 * Creates an invalid parameters error response
 *
 * @param message Error message explaining the invalid parameters
 * @returns A standardized invalid parameters error response
 */
export function createInvalidParamsResponse<T>(message: string): ApiResponse<T> {
  return createErrorResponse(RecipeErrorCode.INVALID_PARAMETERS, message)
}

/**
 * Creates a processing error response for unexpected errors
 *
 * @param error The error that occurred
 * @returns A standardized processing error response
 */
export function createProcessingErrorResponse<T>(error: unknown): ApiResponse<T> {
  return createErrorResponse(
    RecipeErrorCode.PROCESSING_ERROR,
    'An error occurred while processing your request',
    error,
  )
}