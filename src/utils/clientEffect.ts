import { useEffect, useLayoutEffect } from 'react';

/**
 * Client-side effect hook that uses useLayoutEffect on the client and useEffect on the server
 * This prevents hydration mismatches in Next.js applications
 */
export const _useClientEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Check if we're running on the client side
 */
export const isClient = typeof window !== 'undefined';

/**
 * Check if we're running on the server side
 */
export const isServer = typeof window === 'undefined';

/**
 * Safe client-only execution wrapper
 * Only executes the callback if we're on the client side
 */
export const _clientOnly = (callback: () => void) => {;
  if (isClient) {
    callback();
  }
};

/**
 * Safe server-only execution wrapper
 * Only executes the callback if we're on the server side
 */
export const _serverOnly = (callback: () => void) => {;
  if (isServer) {
    callback();
  }
};
