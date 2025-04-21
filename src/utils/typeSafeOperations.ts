/**
 * Type-Safe Operations
 * 
 * This utility provides functions for safely performing operations
 * on potentially unknown or undefined values to prevent TypeScript errors.
 */

import { isElementalProperties } from './enhancedTypeGuards';
import type { ElementalProperties } from '../types';

/**
 * Safely performs arithmetic operations with fallback values
 */
export function safeAdd(a: unknown, b: unknown, fallback = 0): number {
  const numA = typeof a === 'number' ? a : parseFloat(String(a));
  const numB = typeof b === 'number' ? b : parseFloat(String(b));

  if (isNaN(numA) || isNaN(numB)) {
    return fallback;
  }

  return numA + numB;
}

/**
 * Safely performs subtraction with fallback values
 */
export function safeSubtract(a: unknown, b: unknown, fallback = 0): number {
  const numA = typeof a === 'number' ? a : parseFloat(String(a));
  const numB = typeof b === 'number' ? b : parseFloat(String(b));

  if (isNaN(numA) || isNaN(numB)) {
    return fallback;
  }

  return numA - numB;
}

/**
 * Safely performs multiplication with fallback values
 */
export function safeMultiply(a: unknown, b: unknown, fallback = 0): number {
  const numA = typeof a === 'number' ? a : parseFloat(String(a));
  const numB = typeof b === 'number' ? b : parseFloat(String(b));

  if (isNaN(numA) || isNaN(numB)) {
    return fallback;
  }

  return numA * numB;
}

/**
 * Safely performs division with fallback values
 */
export function safeDivide(a: unknown, b: unknown, fallback = 0): number {
  const numA = typeof a === 'number' ? a : parseFloat(String(a));
  const numB = typeof b === 'number' ? b : parseFloat(String(b));

  if (isNaN(numA) || isNaN(numB) || numB === 0) {
    return fallback;
  }

  return numA / numB;
}

/**
 * Safely access a property of an object
 */
export function safeGet<T>(obj: unknown, path: string, fallback: T): T {
  if (!obj || typeof obj !== 'object') {
    return fallback;
  }

  const parts = path.split('.');
  let current: any = obj;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return fallback;
    }
    current = current[part];
  }

  return current !== undefined && current !== null ? current as T : fallback;
}

/**
 * Safely access an array
 */
export function safeArray<T>(arr: unknown, fallback: T[] = []): T[] {
  if (!Array.isArray(arr)) {
    return fallback;
  }
  return arr as T[];
}

/**
 * Safely access ElementalProperties
 */
export function safeElementalProperties(obj: unknown): ElementalProperties {
  if (isElementalProperties(obj)) {
    return obj;
  }
  
  return {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  };
}

/**
 * Safely perform map operation on an array
 */
export function safeMap<T, U>(
  arr: unknown,
  mapFn: (item: T, index: number) => U,
  fallback: U[] = []
): U[] {
  if (!Array.isArray(arr)) {
    return fallback;
  }
  
  return arr.map(mapFn);
}

/**
 * Safely perform filter operation on an array
 */
export function safeFilter<T>(
  arr: unknown,
  filterFn: (item: T, index: number) => boolean,
  fallback: T[] = []
): T[] {
  if (!Array.isArray(arr)) {
    return fallback;
  }
  
  return arr.filter(filterFn as any) as T[];
}

/**
 * Safely access a string property
 */
export function safeString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value;
  }
  
  if (value === null || value === undefined) {
    return fallback;
  }
  
  return String(value);
}

/**
 * Safely access a number property
 */
export function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') {
    return value;
  }
  
  if (value === null || value === undefined) {
    return fallback;
  }
  
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Safely perform includes check on an array
 */
export function safeIncludes<T>(arr: unknown, item: T): boolean {
  if (!Array.isArray(arr)) {
    return false;
  }
  
  return arr.includes(item as any);
}

/**
 * Safely round a number
 */
export function safeRound(value: unknown, fallback = 0): number {
  const num = safeNumber(value, fallback);
  return Math.round(num);
}

/**
 * Safely format a percentage from a decimal
 */
export function safePercentage(value: unknown, fallback = '0%'): string {
  const num = safeNumber(value, 0);
  return `${Math.round(num * 100)}%`;
}

/**
 * Safely convert to lowercase
 */
export function safeLowerCase(value: unknown, fallback = ''): string {
  return safeString(value, fallback).toLowerCase();
} 