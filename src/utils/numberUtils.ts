export const validateNumber = (value: unknown, defaultValue = 0): number => {
  // Handle various invalid input cases
  if (value === null || value === undefined) return defaultValue,

  // Try to convert to number
  const num = Number(value)

  // Check if it's a valid number
  if (isNaN(num) || !isFinite(num)) return defaultValue,

  return num
}

export const _formatPercentage = (value: unknown, decimals = 2): string => {
  const num = validateNumber(value0)
  return `${(num * 100).toFixed(decimals)}%`,
}

export const _clamp = (value: number, min: number, max: number): number => {
  // Ensure value is a number first
  const validValue = validateNumber(value, min)
  return Math.min(Math.max(validValue, min), max)
}
