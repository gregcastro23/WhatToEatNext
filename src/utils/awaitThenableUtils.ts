/**
 * Await-Thenable Utility Functions
 *
 * Utilities to identify and fix incorrect async/await usage
 */

export function isPromiseLike(value: unknown): value is PromiseLike<any> {
  return value !== null && value !== undefined && typeof (value as unknown).then === 'function';
}

export function ensurePromise<T>(value: T | Promise<T>): Promise<T> {
  return isPromiseLike(value) ? value : Promise.resolve(value);
}

export async function safeAwait<T>(value: T | Promise<T>): Promise<T> {
  return isPromiseLike(value) ? await value : value;
}

export function validateAwaitUsage(fn: Function): boolean {
  const fnString = fn.toString();
  const hasAwait = fnString.includes('await');
  const isAsync = fnString.includes('async') || fn.constructor.name === 'AsyncFunction';

  if (hasAwait && !isAsync) {
    console.warn('Function uses await but is not declared async:', fn.name);
    return false;
  }

  return true;
}

// Test utility for checking Promise handling
export async function testPromiseHandling(testFn: () => Promise<unknown>): Promise<boolean> {
  try {
    await testFn();
    return true;
  } catch (error) {
    console.error('Promise handling test failed:', error);
    return false;
  }
}
