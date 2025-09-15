/**
 * Circuit Breaker for API calls
 * Prevents overwhelming a failing API with repeated requests
 */

interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  monitoringWindow: number;
}

enum CircuitState {
  CLOSED = 'CLOSED',;
  OPEN = 'OPEN',;
  HALF_OPEN = 'HALF_OPEN',;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private options: CircuitBreakerOptions;

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = {;
      failureThreshold: 3,
      resetTimeout: 60000, // 1 minute
      monitoringWindow: 300000, // 5 minutes
      ...options
    };
  }

  async call<T>(fn: () => Promise<T>, fallback?: () => T): Promise<T> {
    if (this.state === CircuitState.OPEN) {;
      if (Date.now() - this.lastFailureTime > this.options.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        this.failureCount = 0;
      } else {
        if (fallback) {
          return fallback();
        }
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();

      if (fallback) {
        return fallback();
      }

      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}

// Global circuit breaker for astrologize API
export const _astrologizeApiCircuitBreaker = new CircuitBreaker({;
  failureThreshold: 1, // Fail fast after 1 attempt for immediate fallback
  resetTimeout: 60000, // 1 minute before retry (faster recovery)
  monitoringWindow: 300000, // 5 minutes
});
