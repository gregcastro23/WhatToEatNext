// jest.setup.js

import React, { act } from "react";
import "@testing-library/jest-dom";
import { TextEncoder } from "util";

global.TextEncoder = TextEncoder;

const originalConsoleError = console.error.bind(console);
const ignoredConsoleErrorPatterns = [
  "The current testing environment is not configured to support act(...)",
  "inside a test was not wrapped in act(...)",
];

// Act warnings print by DEFAULT. Set JEST_SILENCE_ACT_WARNINGS=1 to suppress.
//
// This suppression used to be unconditional, which concealed a live instance of
// the very bug class it looks like noise: an un-awaited state update in
// `src/hooks/useFoodDiary.ts` landing outside act(), i.e. React work outliving
// the test. That reaches the same post-teardown microtask path that produced the
// `_location` masking flake. Silencing it by default hides the next one too.
const silenceActWarnings = process.env.JEST_SILENCE_ACT_WARNINGS === "1";

console.error = (...args: Parameters<typeof console.error>) => {
  const [message] = args;
  if (
    silenceActWarnings &&
    typeof message === "string" &&
    ignoredConsoleErrorPatterns.some((pattern) => message.includes(pattern))
  ) {
    return;
  }

  originalConsoleError(...args);
};

// In React 19, act should be imported from 'react', but some utilities still expect React.act
if (typeof React.act === "undefined") {
  (React as any).act = act;
}

// Unmask late-microtask failures.
//
// jsdom wraps `window.queueMicrotask` in a try/catch whose handler reports the
// error via `reportException(window, e, window.location.href)`. Once Jest has
// torn the environment down, `window._document` is gone — so the REPORTING path
// itself throws `TypeError: Cannot read properties of null (reading
// '_location')`. That escapes as an uncaughtException and Jest blames whichever
// test is mid-flight in the worker: an innocent suite goes red and the real
// error is never printed.
//
// Wrapping the callback before jsdom sees it means our catch runs first, so the
// real error is printed with the suite that queued it and the mask never forms.
// In a live window we rethrow, leaving jsdom's normal behaviour untouched.
//
// A `process.on("uncaughtException")` handler does NOT work here: jest-util's
// `createProcessObject()` deep-copies `process` per environment, so a listener
// registered from a setup file attaches to a copy and never fires.
if (typeof window !== "undefined" && typeof window.queueMicrotask === "function") {
  const queueMicrotaskImpl = window.queueMicrotask.bind(window);
  const captureQueueSite = process.env.JEST_TRACE_MICROTASKS === "1";
  let ownerSuite = "<unknown suite>";
  try {
    ownerSuite = expect.getState().testPath ?? ownerSuite;
  } catch {
    /* expect state unavailable — keep the placeholder */
  }

  // Probe the exact expression jsdom's reporter dereferences, so this cannot
  // disagree with the thing it is protecting.
  const environmentIsTornDown = () => {
    try {
      void window.location.href;
      return false;
    } catch {
      return true;
    }
  };

  // A torn-down realm can no longer lazily materialise `.stack`, so read
  // defensively and fall through to `name: message`.
  const describeError = (error: unknown): string => {
    for (const read of [
      () => (error as Error).stack,
      () => `${(error as Error).name}: ${(error as Error).message}`,
      () => (error as Error).message,
      () => String(error),
    ]) {
      try {
        const value = read();
        if (typeof value === "string" && value.trim() !== "") return value;
      } catch {
        /* try the next accessor */
      }
    }
    return "<error object unreadable after teardown>";
  };

  window.queueMicrotask = (callback: VoidFunction) => {
    // The queue call itself can happen post-teardown (a socket/timer handler
    // outliving the suite), in which case no stack is recoverable at all.
    const queuedAfterTeardown = environmentIsTornDown();
    let queuedAt: string | null = null;
    if (captureQueueSite && !queuedAfterTeardown) {
      try {
        queuedAt = new Error("microtask queued here").stack ?? null;
      } catch {
        /* stack unavailable */
      }
    }
    queueMicrotaskImpl(() => {
      try {
        callback();
      } catch (error) {
        if (!environmentIsTornDown()) {
          throw error; // live window — let jsdom report it exactly as before
        }
        // console is already gone by now; write straight to stderr.
        process.stderr.write(
          "\n[jest] A microtask threw AFTER its test environment was torn down.\n" +
            `  owner suite: ${ownerSuite}\n` +
            `  real error:  ${describeError(error)}\n` +
            (queuedAfterTeardown
              ? "  queued at:   also after teardown — an event handler (socket, timer,\n" +
                "               stream) outlived the suite; no stack is recoverable.\n"
              : queuedAt
                ? `  queued at:\n${queuedAt.split("\n").slice(1).join("\n")}\n`
                : "  queued at:   set JEST_TRACE_MICROTASKS=1 to capture the queue site.\n") +
            "  Something in that suite outlived it. Swallowing here only stops it\n" +
            "  corrupting an unrelated test — fix the leak in the owner suite.\n\n",
        );
      }
    });
  };
}

// Mock window.matchMedia
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};

beforeAll(() => {
  jest.setTimeout(10000);
});

afterAll(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

// Add global error handler for unhandled rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection in tests:", error);
});

// Add custom matchers if needed
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
