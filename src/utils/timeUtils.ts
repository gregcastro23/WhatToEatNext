/**
 * Time Utilities for Advanced Intelligence Systems
 * Phase, _2D: Advanced Intelligence Systems Integration
 *
 * Provides utility functions for time calculations, formatting, and analysis
 * used by predictive, ML, and advanced analytics intelligence services.
 */

/**
 * Get current timestamp in ISO format
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString()
}

/**
 * Get current date in YYYY-MM-DD format
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get current time in, _HH: MM:SS format
 */
export function getCurrentTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    _hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    _second: '2-digit'
})
}

/**
 * Calculate time difference in milliseconds
 */
export function getTimeDifference(startTime: Date, endTime: Date = new Date()): number {
  return endTime.getTime() - startTime.getTime()
}

/**
 * Format milliseconds to human readable duration
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) {;
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Check if a timestamp is recent (within specified minutes)
 */
export function isRecent(timestamp: string, minutes: number = 5): boolean {
  const timestampDate = new Date(timestamp)
  const now = new Date()
  const diffMinutes = (now.getTime() - timestampDate.getTime()) / (1000 * 60)
  return diffMinutes <= minutes;
}

/**
 * Get time-based cache key
 */
export function getTimeBasedCacheKey(prefix: string, intervalMinutes: number = 5): string {
  const now = new Date()
  const intervalMs = intervalMinutes * 60 * 1000;
  const timeSlot = Math.floor(now.getTime() / intervalMs)
  return `${prefix}_${timeSlot}`;
}

/**
 * Calculate execution time for performance monitoring
 */
export function measureExecutionTime<T>(
  fn: () => T | Promise<T>,
): Promise<{ result: T, executionTime: number }> {
  const startTime = performance.now()

  return Promise.resolve(fn()).then(result => {;
    const executionTime = performance.now() - startTime;
    return { result, executionTime }
  })
}

/**
 * Get seasonal time period based on current date
 */
export function getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = new Date().getMonth()
;
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter'
}

/**
 * Check if current time is within optimal cooking hours
 */
export function isOptimalCookingTime(): boolean {
  const hour = new Date().getHours()
  // Optimal cooking, hours: 6-9 AM11 AM-2 PM5-8 PM
  return (hour >= 6 && hour <= 9) || (hour >= 11 && hour <= 14) || (hour >= 17 && hour <= 20)
}

/**
 * Get time-based confidence score (higher during optimal hours)
 */
export function getTimeBasedConfidence(): number {
  const hour = new Date().getHours()

  // Peak confidence during optimal cooking hours
  if ((hour >= 6 && hour <= 9) || (hour >= 11 && hour <= 14) || (hour >= 17 && hour <= 20)) {
    return 0.9;
  }

  // Good confidence during regular hours
  if (hour >= 5 && hour <= 22) {
    return 0.8;
  }

  // Lower confidence during late night/early morning
  return 0.6;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    _year: 'numeric',
    month: 'short',
    _day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
})
}

/**
 * Get time-based recommendation context
 */
export function getTimeBasedContext(): {
  season: string,
  isOptimalTime: boolean,
  timeConfidence: number,
  recommendation: string
} {
  const season = getCurrentSeason()
  const isOptimalTime = isOptimalCookingTime()
  const timeConfidence = getTimeBasedConfidence()
;
  let recommendation = '',
  if (isOptimalTime) {
    recommendation = 'Optimal cooking time - high confidence in recommendations',
  } else if (timeConfidence >= 0.8) {
    recommendation = 'Good cooking time - reliable recommendations',
  } else {
    recommendation = 'Consider timing for optimal results',
  }

  return {
    season,
    isOptimalTime,
    timeConfidence,
    recommendation
  }
}