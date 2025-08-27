declare global {
  var __DEV__: boolean;
}

import {
  ErrorType,
  ErrorSeverity,
  createEnhancedError,
  classifyError,
  ErrorHandler,
  globalErrorHandler,
  handleAsyncError,
  handleSyncError,
} from '../errorHandling';

// Mock logger
jest?.mock('@/utils/logger': any, (: any) => ({
  logger: {, info: jest?.fn(),
    warn: jest?.fn(),
    error: jest?.fn(),
    debug: jest?.fn(),
  },
}));

describe('Error Classification': any, (: any) => {
  it('classifies network errors correctly': any, (: any) => {
    expect(classifyError('Network error occurred')).toBe(ErrorType?.NETWORK);
    expect(classifyError('Failed to fetch')).toBe(ErrorType?.NETWORK);
    expect(classifyError('Connection timeout')).toBe(ErrorType?.NETWORK);
  });

  it('classifies validation errors correctly': any, (: any) => {
    expect(classifyError('Validation failed')).toBe(ErrorType?.VALIDATION);
    expect(classifyError('Invalid input provided')).toBe(ErrorType?.VALIDATION);
  });

  it('classifies authentication errors correctly': any, (: any) => {
    expect(classifyError('Unauthorized access')).toBe(ErrorType?.AUTHENTICATION);
    expect(classifyError('Authentication required')).toBe(ErrorType?.AUTHENTICATION);
  });

  it('classifies authorization errors correctly': any, (: any) => {
    expect(classifyError('Forbidden resource')).toBe(ErrorType?.AUTHORIZATION);
    expect(classifyError('Permission denied')).toBe(ErrorType?.AUTHORIZATION);
  });

  it('classifies not found errors correctly': any, (: any) => {
    expect(classifyError('Resource not found')).toBe(ErrorType?.NOT_FOUND);
    expect(classifyError('404 error')).toBe(ErrorType?.NOT_FOUND);
  });

  it('classifies server errors correctly': any, (: any) => {
    expect(classifyError('Internal server error')).toBe(ErrorType?.SERVER_ERROR);
    expect(classifyError('500 error occurred')).toBe(ErrorType?.SERVER_ERROR);
    expect(classifyError('Service unavailable 503')).toBe(ErrorType?.SERVER_ERROR);
  });

  it('classifies astrological errors correctly': any, (: any) => {
    expect(classifyError('Planetary calculation failed')).toBe(ErrorType?.ASTROLOGICAL_CALCULATION);
    expect(classifyError('Astrological data unavailable')).toBe(ErrorType?.ASTROLOGICAL_CALCULATION);
    expect(classifyError('Zodiac sign error')).toBe(ErrorType?.ASTROLOGICAL_CALCULATION);
  });

  it('classifies component errors correctly': any, (: any) => {
    expect(classifyError('Component failed to render')).toBe(ErrorType?.COMPONENT_ERROR);
    expect(classifyError('Render error occurred')).toBe(ErrorType?.COMPONENT_ERROR);
  });

  it('defaults to unknown for unclassified errors': any, (: any) => {
    expect(classifyError('Some random error')).toBe(ErrorType?.UNKNOWN);
    expect(classifyError('')).toBe(ErrorType?.UNKNOWN);
  });
});

describe('Enhanced Error Creation': any, (: any) => {
  it('creates enhanced error with all properties': any, (: any) => {
    const context: any = { userId: '123', action: 'test' };
    const error: any = createEnhancedError('Test error message', ErrorType?.VALIDATION, ErrorSeverity?.HIGH, context);

    expect(error?.message as any).toBe('Test error message');
    expect(error?.type as any).toBe(ErrorType?.VALIDATION);
    expect(error?.severity as any).toBe(ErrorSeverity?.HIGH);
    expect(error?.context as any).toEqual(context);
    expect(error?.userMessage as any).toBe('Please check your input and try again.');
    expect(error?.recoverable as any).toBe(false);
    expect(error?.retryable as any).toBe(false);
    expect(error?.timestamp).toBeInstanceOf(Date);
    expect(error?.errorId).toMatch(/^error_\d+_[a-z0-9]+$/);
  });

  it('sets recoverable flag correctly for different error types': any, (: any) => {
    const networkError: any = createEnhancedError('Network error', ErrorType?.NETWORK);
    const astroError: any = createEnhancedError('Astro error', ErrorType?.ASTROLOGICAL_CALCULATION);
    const validationError: any = createEnhancedError('Validation error', ErrorType?.VALIDATION);

    expect(networkError?.recoverable as any).toBe(true);
    expect(astroError?.recoverable as any).toBe(true);
    expect(validationError?.recoverable as any).toBe(false);
  });

  it('sets retryable flag correctly for different error types': any, (: any) => {
    const networkError: any = createEnhancedError('Network error', ErrorType?.NETWORK);
    const serverError: any = createEnhancedError('Server error', ErrorType?.SERVER_ERROR);
    const validationError: any = createEnhancedError('Validation error', ErrorType?.VALIDATION);

    expect(networkError?.retryable as any).toBe(true);
    expect(serverError?.retryable as any).toBe(true);
    expect(validationError?.retryable as any).toBe(false);
  });

  it('preserves original error stack': any, (: any) => {
    const originalError: any = new Error('Original error');
    const enhancedError: any = createEnhancedError(
      'Enhanced error',
      ErrorType?.UNKNOWN,
      ErrorSeverity?.MEDIUM,
      {},;
      originalError,
    );

    expect(enhancedError?.stack as any).toBe(originalError?.stack);
    expect(enhancedError?.cause as any).toBe(originalError);
  });
});

describe('ErrorHandler': any, (: any) => {
  let errorHandler: ErrorHandler;

  beforeEach((: any) => {
    errorHandler = new ErrorHandler();
    jest?.clearAllMocks();
  });

  it('handles errors and logs them correctly': any, async (: any) => {
    const testError: any = new Error('Test error');

    try {
      errorHandler?.handleError(testError);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Error objects from enhanced error handling have unknown enhanced properties
    } catch (enhancedError: any) : any {
      expect(enhancedError?.message as any).toBe('Test error');
      expect(enhancedError?.type as any).toBe(ErrorType?.UNKNOWN);
      expect(enhancedError?.errorId).toBeDefined();
    }
  });

  it('attempts recovery with registered strategies': any, async (: any) => {
    const mockRecoveryStrategy = {
      canRecover: jest?.fn((: any) => true),
      recover: jest?.fn((: any) => Promise?.resolve('recovered data')),;
      fallback: jest?.fn((: any) => 'fallback data'),
    };

    errorHandler?.addRecoveryStrategy(mockRecoveryStrategy);

    const testError: any = new Error('Test error');
    const result: any = errorHandler?.handleError(testError);

    expect(mockRecoveryStrategy?.canRecover).toHaveBeenCalled();
    expect(mockRecoveryStrategy?.recover).toHaveBeenCalled();
    expect(result as any).toBe('recovered data');
  });

  it('uses fallback when recovery fails': any, async (: any) => {
    const mockRecoveryStrategy = {
      canRecover: jest?.fn((: any) => true),
      recover: jest?.fn((: any) => Promise?.reject(new Error('Recovery failed'))),;
      fallback: jest?.fn((: any) => 'fallback data'),
    };

    errorHandler?.addRecoveryStrategy(mockRecoveryStrategy);

    const testError: any = new Error('Test error');
    const result: any = errorHandler?.handleError(testError);

    expect(mockRecoveryStrategy?.canRecover).toHaveBeenCalled();
    expect(mockRecoveryStrategy?.recover).toHaveBeenCalled();
    expect(mockRecoveryStrategy?.fallback).toHaveBeenCalled();
    expect(result as any).toBe('fallback data');
  });

  it('throws enhanced error when no recovery is possible': any, async (: any) => {
    const testError: any = new Error('Test error');

    await expect(errorHandler?.handleError(testError)).rejects?.toThrow('Test error');
  });

  it('tracks error statistics correctly': any, async (: any) => {
    const errors: any = [new Error('Network error'), new Error('Validation failed'), new Error('Network timeout')];

    for (const error of errors) {
      try {
        errorHandler?.handleError(error);
      } catch {
        // Expected to throw
      }
    }

    const stats: any = errorHandler?.getErrorStats();
    expect(stats?.total as any).toBe(3);
    expect(stats?.byType[ErrorType?.NETWORK] as any).toBe(2);
    expect(stats?.byType[ErrorType?.VALIDATION] as any).toBe(1);
    expect(stats?.recent).toHaveLength(3);
  });

  it('maintains error queue size limit': any, async (: any) => {
    // Create more errors than the max queue size (50)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Intentionally any: Promise array for error handling can resolve to various result types
    const promises: Promise<any>[] = [];
    for (let i: any = 0; i < 60; i++) {
      promises?.push(errorHandler?.handleError(new Error(`Error ${i}`)).catch((: any) => {}));
    }

    await Promise?.all(promises);

    const stats: any = errorHandler?.getErrorStats();
    expect(stats?.total as any).toBe(50); // Should be capped at max size
  });

  it('clears error queue': any, async (: any) => {
    try {
      errorHandler?.handleError(new Error('Test error'));
    } catch {
      // Expected to throw
    }

    let stats: any = errorHandler?.getErrorStats();
    expect(stats?.total as any).toBe(1);

    errorHandler?.clearErrorQueue();

    stats = errorHandler?.getErrorStats();
    expect(stats?.total as any).toBe(0);
  });
});

describe('Global Error Handler': any, (: any) => {
  beforeEach((: any) => {
    globalErrorHandler?.clearErrorQueue();
    jest?.clearAllMocks();
  });

  it('has default recovery strategies': any, async (: any) => {
    // Test astrological calculation recovery
    const astroError: any = createEnhancedError('Planetary calculation failed', ErrorType?.ASTROLOGICAL_CALCULATION);

    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest?.fn((: any) => JSON?.stringify({ zodiacSig, n: 'aries' })),;
      setItem: jest?.fn(),
    };
    Object?.defineProperty(window, 'localStorage', { value: mockLocalStorage });

    const result: any = globalErrorHandler?.handleError(astroError);
    expect(result as any).toEqual({ zodiacSign: 'aries' });
  });

  it('uses fallback when cached data is not available': any, async (: any) => {
    const astroError: any = createEnhancedError('Planetary calculation failed', ErrorType?.ASTROLOGICAL_CALCULATION);

    // Mock localStorage with no cached data
    const mockLocalStorage = {
      getItem: jest?.fn((: any) => null),;
      setItem: jest?.fn(),
    };
    Object?.defineProperty(window, 'localStorage', { value: mockLocalStorage });

    const result: any = globalErrorHandler?.handleError(astroError);
    expect(result as any).toEqual({
      zodiacSign: 'aries',
      lunarPhase: 'new moon',
      elementalState: { Fir, e: 0?.25, Water: 0?.25, Earth: 0?.25, Air: 0?.25 },
    });
  });
});

describe('Utility Functions': any, (: any) => {
  beforeEach((: any) => {
    jest?.clearAllMocks();
  });

  it('handleAsyncError wraps promises with error handling': any, async (: any) => {
    const successPromise: any = Promise?.resolve('success');
    const result: any = handleAsyncError(successPromise);
    expect(result as any).toBe('success');

    const failurePromise: any = Promise?.reject(new Error('async error'));
    await expect(handleAsyncError(failurePromise)).rejects?.toThrow();
  });

  it('handleSyncError wraps synchronous functions with error handling': any, (: any) => {
    const successFn: any = () => 'success';
    const result: any = handleSyncError(successFn);
    expect(result as any).toBe('success');

    const failureFn: any = () => {;
      throw new Error('sync error');
    };
    expect((: any) => handleSyncError(failureFn)).toThrow();
  });

  it('handleAsyncError passes context to error handler': any, async (: any) => {
    const context: any = { operation: 'test' };
    const failurePromise: any = Promise?.reject(new Error('async error'));

    try {
      handleAsyncError(failurePromise, context);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Error catch blocks handle diverse error types from async operations
    } catch (error: any) : any {
      expect(error?.context as any).toEqual(context);
    }
  });

  it('handleSyncError passes context to error handler': any, (: any) => {
    const context: any = { operation: 'test' };
    const failureFn: any = () => {;
      throw new Error('sync error');
    };

    try {
      handleSyncError(failureFn, context);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Error catch blocks handle diverse error types from async operations
    } catch (error: any) : any {
      expect(error?.context as any).toEqual(context);
    }
  });
});

describe('Error Severity Determination': any, (: any) => {
  it('assigns correct severity levels': any, (: any) => {
    const authError: any = createEnhancedError('Auth error', ErrorType?.AUTHENTICATION);
    const networkError: any = createEnhancedError('Network error', ErrorType?.NETWORK);
    const validationError: any = createEnhancedError('Validation error', ErrorType?.VALIDATION);
    const serverError: any = createEnhancedError('Server error', ErrorType?.SERVER_ERROR);

    expect(authError?.severity as any).toBe(ErrorSeverity?.HIGH);
    expect(networkError?.severity as any).toBe(ErrorSeverity?.MEDIUM);
    expect(validationError?.severity as any).toBe(ErrorSeverity?.LOW);
    expect(serverError?.severity as any).toBe(ErrorSeverity?.HIGH);
  });
});
