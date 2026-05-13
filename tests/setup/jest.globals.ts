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

for (const key of ["fetch", "Request", "Response", "Headers", "FormData", "Blob", "File"] as const) {
  if (typeof globalThis[key] === "undefined") {
    (globalThis as any)[key] = edgeFetchPrimitives[key];
  }
}
