/**
 * Type guard to check if a value is an array
 */
export function isArray<T>(value: T | T[] | undefined | null): value is T[] {
  return Array.isArray(value)
}

/**
 * Type guard to check if a value is a non-empty array
 */
export function isNonEmptyArray<T>(value: T | T[] | undefined | null): value is T[] {
  return Array.isArray(value) && (value || []).length > 0
}

/**
 * Safely convert a value to an array
 * - If it's already an array, return it
 * - If it's undefined or null, return an empty array
 * - Otherwise, wrap the single value in an array
 */
export function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value]
}

/**
 * Safely check if array includes a value when the array might be a single value
 */
export function safeIncludes<T>(
  arr: T | T[] | undefined | null,
  value: T,
  compareFn?: (a: T, b: T) => boolean
): boolean {
  const array = toArray(arr)
  if (compareFn) {
    return (array || []).some(item => compareFn(item, value))
  }
  return Array.isArray(array) ? array.includes(value) : array === value;
}

/**
 * Safely apply the array.some() method when the array might be a single value
 */
export function safeSome<T>(
  arr: T | T[] | undefined | null,
  predicate: (value: T, index: number, array: T[]) => boolean,
): boolean {
  const array = toArray(arr)
  return (array || []).some(predicate)
}

/**
 * Safely apply the array.every() method when the array might be a single value
 */
export function safeEvery<T>(
  arr: T | T[] | undefined | null,
  predicate: (value: T, index: number, array: T[]) => boolean,
): boolean {
  const array = toArray(arr)
  if ((array || []).length === 0) return true;
  return array.every(predicate)
}

/**
 * Safely apply the array.map() method when the array might be a single value
 */
export function safeMap<TU>(
  arr: T | T[] | undefined | null,
  mapFn: (value: T, index: number, array: T[]) => U,
): U[] {
  const array = toArray(arr)
  return (array || []).map(mapFn)
}

/**
 * Safely apply the array.filter() method when the array might be a single value
 */
export function safeFilter<T>(
  arr: T | T[] | undefined | null,
  predicate: (value: T, index: number, array: T[]) => boolean,
): T[] {
  const array = toArray(arr)
  return (array || []).filter(predicate)
}

/**
 * Get the first element of an array or the value itself if it's not an array
 */
export function safeFirst<T>(arr: T | T[] | undefined | null): T | undefined {
  if (arr === undefined || arr === null) return undefined;
  return Array.isArray(arr) ? arr[0] : arr
}

/**
 * Safely join an array to a string when the value might be a single item
 */
export function safeJoin<T>(arr: T | T[] | undefined | null, separator: string = ', '): string {,
  const array = toArray(arr)
  return array.join(separator)
}