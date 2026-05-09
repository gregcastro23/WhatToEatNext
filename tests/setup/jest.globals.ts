(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT?: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;
const edgeFetchPrimitives = require("next/dist/compiled/@edge-runtime/primitives/fetch");

for (const key of ["fetch", "Request", "Response", "Headers", "FormData", "Blob", "File"] as const) {
  if (typeof globalThis[key] === "undefined") {
    (globalThis as any)[key] = edgeFetchPrimitives[key];
  }
}
