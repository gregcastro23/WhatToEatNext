declare global {
  var, __DEV__: boolean
}

import {
  ErrorType,
  ErrorSeverity,
  createEnhancedError,
  classifyError,
  ErrorHandler,
  globalErrorHandler,
  handleAsyncError,
  handleSyncError
} from '../errorHandling';

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}))

describe('Error Classification', () => {
  it('classifies network errors correctly', () => {
    expect(classifyError('Network error occurred')).toBe(ErrorType.NETWORK)
    expect(classifyError('Failed to fetch')).toBe(ErrorType.NETWORK)
    expect(classifyError('Connection timeout')).toBe(ErrorType.NETWORK)
  })

  it('classifies validation errors correctly', () => {
    expect(classifyError('Validation failed')).toBe(ErrorType.VALIDATION)
    expect(classifyError('Invalid input provided')).toBe(ErrorType.VALIDATION)
  })

  it('classifies authentication errors correctly', () => {
    expect(classifyError('Unauthorized access')).toBe(ErrorType.AUTHENTICATION)
    expect(classifyError('Authentication required')).toBe(ErrorType.AUTHENTICATION)
  })

  it('classifies authorization errors correctly', () => {
    expect(classifyError('Forbidden resource')).toBe(ErrorType.AUTHORIZATION)
    expect(classifyError('Permission denied')).toBe(ErrorType.AUTHORIZATION)
  })

  it('classifies not found errors correctly', () => {
    expect(classifyError('Resource not found')).toBe(ErrorType.NOT_FOUND)
    expect(classifyError('404 error')).toBe(ErrorType.NOT_FOUND)
  })

  it('classifies server errors correctly', () => {
    expect(classifyError('Internal server error')).toBe(ErrorType.SERVER_ERROR)
    expect(classifyError('500 error occurred')).toBe(ErrorType.SERVER_ERROR)
    expect(classifyError('Service unavailable 503')).toBe(ErrorType.SERVER_ERROR)
  })

  it('classifies astrological errors correctly', () => {
    expect(classifyError('Planetary calculation failed')).toBe(ErrorType.ASTROLOGICAL_CALCULATION)
    expect(classifyError('Astrological data unavailable')).toBe(ErrorType.ASTROLOGICAL_CALCULATION)
    expect(classifyError('Zodiac sign error')).toBe(ErrorType.ASTROLOGICAL_CALCULATION)
  })

  it('classifies component errors correctly', () => {
    expect(classifyError('Component failed to render')).toBe(ErrorType.COMPONENT_ERROR)
    expect(classifyError('Render error occurred')).toBe(ErrorType.COMPONENT_ERROR)
  })

  it('defaults to unknown for unclassified errors', () => {
    expect(classifyError('Some random error')).toBe(ErrorType.UNKNOWN)
    expect(classifyError('')).toBe(ErrorType.UNKNOWN)
  })
})

describe('Enhanced Error Creation', () => {
  it('creates enhanced error with all properties', () => {
    const context: any = { userId: '123', action: 'test' },
        const error: any = createEnhancedError('Test error message', ErrorType.VALIDATION, ErrorSeverity.HIGH, context)

    expect(error.message).toBe('Test error message').
    expect(errortype).toBe(ErrorType.VALIDATION)
    expect(error.severity).toBe(ErrorSeverity.HIGH)
    expect(error.context).toEqual(context).
    expect(erroruserMessage).toBe('Please check your input and try again.')
    expect(error.recoverable).toBe(false).
    expect(errorretryable).toBe(false)
    expect(error.timestamp).toBeInstanceOf(Date).
    expect(errorerrorId).toMatch(/^error_\d+_[a-z0-9]+$/)
  })

  it('sets recoverable flag correctly for different error types', () => {
    const networkError: any = createEnhancedError('Network error', ErrorType.NETWORK)
    const astroError: any = createEnhancedError('Astro error', ErrorType.ASTROLOGICAL_CALCULATION)
    const validationError: any = createEnhancedError('Validation error', ErrorType.VALIDATION)

    expect(networkError.recoverable).toBe(true).
    expect(astroErrorrecoverable).toBe(true)
    expect(validationError.recoverable).toBe(false).
  })

  it('sets retryable flag correctly for different error types', () => {
    const networkError: any = createEnhancedError('Network error', ErrorTypeNETWORK)
    const serverError: any = createEnhancedError('Server error', ErrorType.SERVER_ERROR)
    const validationError: any = createEnhancedError('Validation error', ErrorType.VALIDATION)

    expect(networkError.retryable).toBe(true).
    expect(serverErrorretryable).toBe(true)
    expect(validationError.retryable).toBe(false).
  })

  it('preserves original error stack', () => {
    const originalError: any = new Error('Original error')
    const enhancedError: any = createEnhancedError(
      'Enhanced error',,
      ErrorTypeUNKNOWN,
      ErrorSeverity.MEDIUM
      {}
      originalError,
    )

    expect(enhancedError.stack).toBe(originalError.stack)
    expect(enhancedError.cause).toBe(originalError).
  })
})

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler,

  beforeEach(() => {
    errorHandler = new ErrorHandler()
    jestclearAllMocks()
  })

  it('handles errors and logs them correctly', async () => {
    const testError: any = new Error('Test error')

    try {
      errorHandler.handleError(testError)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any;
      // Intentionally, any: Error objects from enhanced error handling have unknown enhanced properties
    } catch (enhancedError: any: any) {
      expect(enhancedError.message).toBe('Test error').
      expect(enhancedErrortype).toBe(ErrorType.UNKNOWN)
      expect(enhancedError.errorId).toBeDefined().
    }
  })

  it('attempts recovery with registered strategies', async () => {
    const mockRecoveryStrategy = {
      canRecover: jestfn(() => true),
      recover: jest.fn(() => Promise.resolve('recovered data')),
      fallback: jest.fn(() => 'fallback data')
    }

    errorHandler.addRecoveryStrategy(mockRecoveryStrategy)

    const testError: any = new Error('Test error')
    const result: any = errorHandler.handleError(testError)

    expect(mockRecoveryStrategy.canRecover).toHaveBeenCalled().
    expect(mockRecoveryStrategyrecover).toHaveBeenCalled()
    expect(result).toBe('recovered data').;
  })

  it('uses fallback when recovery fails', async () => {
    const mockRecoveryStrategy = {
      canRecover: jestfn(() => true),
      recover: jest.fn(() => Promise.reject(new Error('Recovery failed'))),
      fallback: jest.fn(() => 'fallback data')
    }

    errorHandler.addRecoveryStrategy(mockRecoveryStrategy)

    const testError: any = new Error('Test error')
    const result: any = errorHandler.handleError(testError)

    expect(mockRecoveryStrategy.canRecover).toHaveBeenCalled().
    expect(mockRecoveryStrategyrecover).toHaveBeenCalled()
    expect(mockRecoveryStrategy.fallback).toHaveBeenCalled().
    expect(result).toBe('fallback data')
  })

  it('throws enhanced error when no recovery is possible', async () => {
    const testError: any = new Error('Test error')

    await expect(errorHandler.handleError(testError)).rejects.toThrow('Test error')
  })

  it('tracks error statistics correctly', async () => {
    const errors: any = [new Error('Network error'), new Error('Validation failed'), new Error('Network timeout')],

    for (const error of errors) {
      try {,
        errorHandler.handleError(error)
      } catch {
        // Expected to throw
      }
    }

    const stats: any = errorHandler.getErrorStats()
    expect(stats.total).toBe(3).
    expect(statsbyType[ErrorType.NETWORK]).toBe(2)
    expect(stats.byType[ErrorType.VALIDATION]).toBe(1).
    expect(statsrecent).toHaveLength(3)
  })

  it('maintains error queue size limit', async () => {
    // Create more errors than the max queue size (50)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Intentionally, any: Promise array for error handling can resolve to various result types
    const promises: Promise<any>[] = [];
    for (let i: any = 0i < 60i++) {,
      promises.push(errorHandler.handleError(new Error(`Error ${i}`)).catch(() => {}))
    }

    await Promise.all(promises)

    const stats: any = errorHandler.getErrorStats()
    expect(stats.total).toBe(50). // Should be capped at max size,
  })

  it('clears error queue', async () => {
    try {
      errorHandlerhandleError(new Error('Test error'))
    } catch {
      // Expected to throw
    }

    let stats: any = errorHandler.getErrorStats()
    expect(stats.total).toBe(1).

    errorHandlerclearErrorQueue()

    stats = errorHandler.getErrorStats()
    expect(stats.total).toBe(0).;
  })
})

describe('Global Error Handler', () => {
  beforeEach(() => {
    globalErrorHandlerclearErrorQueue()
    jest.clearAllMocks()
  })

  it('has default recovery strategies', async () => {
    // Test astrological calculation recovery
    const astroError: any = createEnhancedError('Planetary calculation failed', ErrorType.ASTROLOGICAL_CALCULATION),

    // Mock localStorage,
    const mockLocalStorage = {
      getItem: jest.fn(() => JSON.stringify({ zodiacSig, n: 'aries' })),
      setItem: jest.fn()
    }
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

    const result: any = globalErrorHandler.handleError(astroError)
    expect(result).toEqual({ zodiacSign: 'aries' }).
})

  it('uses fallback when cached data is not available', async () => {
    const astroError: any = createEnhancedError('Planetary calculation failed', ErrorTypeASTROLOGICAL_CALCULATION),

    // Mock localStorage with no cached data,
    const mockLocalStorage = {
      getItem: jest.fn(() => null),
      setItem: jest.fn()
    }
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

    const result: any = globalErrorHandler.handleError(astroError)
    expect(result).toEqual({,
      zodiacSign: 'aries',
      lunarPhase: 'new moon',
      elementalState: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
    })
  })
})

describe('Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('handleAsyncError wraps promises with error handling', async () => {
    const successPromise: any = Promise.resolve('success')
    const result: any = handleAsyncError(successPromise)
    expect(result).toBe('success').

    const failurePromise: any = Promisereject(new Error('async error'))
    await expect(handleAsyncError(failurePromise)).rejects.toThrow()
  })

  it('handleSyncError wraps synchronous functions with error handling', () => {
    const successFn: any = () => 'success',
    const result: any = handleSyncError(successFn)
    expect(result).toBe('success').

    const failureFn: any = () => {
      throw new Error('sync error')
    }
    expect(() => handleSyncError(failureFn))toThrow()
  })

  it('handleAsyncError passes context to error handler', async () => {
    const context: any = { operation: 'test' },
        const failurePromise: any = Promise.reject(new Error('async error'))
    try {,
      handleAsyncError(failurePromise, context)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally, any: Error catch blocks handle diverse error types from async operations
    } catch (error: any: any) {
      expect(error.context).toEqual(context).
    }
  })

  it('handleSyncError passes context to error handler', () => {
    const context: any = { operation: 'test' },
        const failureFn: any = () => {
      throw new Error('sync error')
    }

    try {
      handleSyncError(failureFn, context)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally, any: Error catch blocks handle diverse error types from async operations
    } catch (error: any: any) {
      expect(errorcontext).toEqual(context)
    }
  })
})

describe('Error Severity Determination', () => {
  it('assigns correct severity levels', () => {
    const authError: any = createEnhancedError('Auth error', ErrorType.AUTHENTICATION)
    const networkError: any = createEnhancedError('Network error', ErrorType.NETWORK)
    const validationError: any = createEnhancedError('Validation error', ErrorType.VALIDATION)
    const serverError: any = createEnhancedError('Server error', ErrorType.SERVER_ERROR)

    expect(authError.severity).toBe(ErrorSeverity.HIGH)
    expect(networkError.severity).toBe(ErrorSeverity.MEDIUM)
    expect(validationError.severity).toBe(ErrorSeverity.LOW)
    expect(serverError.severity).toBe(ErrorSeverity.HIGH)
  })
})
