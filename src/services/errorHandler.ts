import { logger } from '../utils/logger'

interface ErrorDetails {
  code?: string
  context?: Record<string, any>
  timestamp: number
  recovered?: boolean
}

class ErrorHandler {
  private errorLog: Map<string, ErrorDetails[]> = new Map()
  private readonly MAX_ERRORS_PER_TYPE = 10
  private readonly ERROR_RETENTION_MS = 1000 * 60 * 5 // 5 minutes

  handleError(error: unknown, context?: Record<string, any>): void {
    const errorMessage = this.getErrorMessage(error)
    const errorCode = this.getErrorCode(error)
    
    // Log the error
    logger.error(`Error [${errorCode}]:`, errorMessage, context)

    // Store error details
    this.storeError(errorCode, {
      code: errorCode,
      context,
      timestamp: Date.now()
    })

    // Clean up old errors
    this.cleanupOldErrors()
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    return String(error)
  }

  private getErrorCode(error: unknown): string {
    if (error instanceof Error) {
      return error.name || 'UnknownError'
    }
    return 'UnknownError'
  }

  private storeError(type: string, details: ErrorDetails): void {
    const errors = this.errorLog.get(type) || []
    errors.unshift(details)
    
    // Keep only recent errors
    if (errors.length > this.MAX_ERRORS_PER_TYPE) {
      errors.pop()
    }
    
    this.errorLog.set(type, errors)
  }

  private cleanupOldErrors(): void {
    const now = Date.now()
    this.errorLog.forEach((errors, type) => {
      const recentErrors = errors.filter(
        error => now - error.timestamp < this.ERROR_RETENTION_MS
      )
      if (recentErrors.length === 0) {
        this.errorLog.delete(type)
      } else {
        this.errorLog.set(type, recentErrors)
      }
    })
  }

  getRecentErrors(): Map<string, ErrorDetails[]> {
    this.cleanupOldErrors()
    return new Map(this.errorLog)
  }

  markErrorAsRecovered(type: string, timestamp: number): void {
    const errors = this.errorLog.get(type)
    if (errors) {
      const error = errors.find(e => e.timestamp === timestamp)
      if (error) {
        error.recovered = true
      }
    }
  }

  hasRepeatingErrors(type: string): boolean {
    const errors = this.errorLog.get(type)
    if (!errors) return false

    const recentErrors = errors.filter(
      error => Date.now() - error.timestamp < 60000 // Last minute
    )
    return recentErrors.length >= 3
  }

  clearErrors(): void {
    this.errorLog.clear()
  }
}

export const errorHandler = new ErrorHandler() 