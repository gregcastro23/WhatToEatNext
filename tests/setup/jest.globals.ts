import { TextDecoder, TextEncoder } from "node:util";
import { ReadableStream, TransformStream, WritableStream } from "node:stream/web";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT?: boolean;
    ReadableStream?: typeof ReadableStream;
    TextDecoder?: typeof TextDecoder;
    TextEncoder?: typeof TextEncoder;
    TransformStream?: typeof TransformStream;
    WritableStream?: typeof WritableStream;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

if (typeof globalThis.ReadableStream === "undefined") {
  globalThis.ReadableStream = ReadableStream;
}

if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder = TextEncoder;
}

if (typeof globalThis.TextDecoder === "undefined") {
  globalThis.TextDecoder = TextDecoder;
}

if (typeof globalThis.TransformStream === "undefined") {
  globalThis.TransformStream = TransformStream;
}

if (typeof globalThis.WritableStream === "undefined") {
  globalThis.WritableStream = WritableStream;
}

const edgeFetchPrimitives = require("next/dist/compiled/@edge-runtime/primitives/fetch");

// Note `fetch` is deliberately absent from this list — see below.
for (const key of ["Request", "Response", "Headers", "FormData", "Blob", "File"] as const) {
  if (typeof globalThis[key] === "undefined") {
    (globalThis as any)[key] = edgeFetchPrimitives[key];
  }
}

// No real sockets in unit tests.
//
// This used to install Next's bundled undici as the global `fetch`, which meant
// any unmocked code path could open a real TCP connection. It did — ~34 per
// full-suite run, mostly to http://localhost:8000/health via
// `isBackendAvailable`, reached through fire-and-forget calls like
// `recognizeTableJoin` (`void import(...).then(...)`) that a test can neither
// await nor cancel.
//
// Nothing listens on that port during tests, so the connection is refused and
// the suites pass anyway — but the refusal lands ASYNCHRONOUSLY, often after the
// owning suite's environment has been torn down. undici's socket error handler
// then calls `queueMicrotask(clearConnectTimeout)` on a dead jsdom window;
// `clearConnectTimeout` calls `clearImmediate`, which Jest removed from the
// jsdom environment in v27 — so it throws `ReferenceError: clearImmediate is
// not defined`. jsdom catches that and tries to report it via
// `window.location.href`, but the window is gone, so the REPORTER throws
// `TypeError: Cannot read properties of null (reading '_location')`. Jest blames
// whichever suite happens to be mid-flight in that worker, turning an unrelated
// test red ~8% of full-suite runs. The original error is never printed.
//
// A rejecting stub is behaviourally equivalent for every current caller (they
// only ever saw a connection refusal) and turns the next unmocked network call
// into a self-explaining failure instead of a silent leak. The assignment is
// UNCONDITIONAL on purpose: under `@jest-environment node`, Node 22 supplies a
// native global `fetch`, so a `typeof === "undefined"` guard would skip the stub
// and leave those suites opening real sockets.
(globalThis as { fetch?: unknown }).fetch = (input: unknown): Promise<never> => {
  const target =
    typeof input === "string" ? input : ((input as { url?: string } | null)?.url ?? String(input));
  const error = new TypeError("fetch failed");
  (error as { cause?: unknown }).cause = new Error(
    `Real network requests are disabled in tests (attempted: ${target}). ` +
      "Mock fetch in this suite, e.g. `global.fetch = jest.fn()`.",
  );
  return Promise.reject(error);
};
