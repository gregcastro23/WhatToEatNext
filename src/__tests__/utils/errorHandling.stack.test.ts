/**
 * @jest-environment node
 */

import { createEnhancedError, ErrorType, ErrorSeverity } from "@/utils/errorHandling";

describe("createEnhancedError context and stack handling", () => {
  it("omits context when not provided", () => {
    const err = createEnhancedError("test error", ErrorType.VALIDATION, ErrorSeverity.LOW);
    expect("context" in err).toBe(false);
    expect(err.context).toBeUndefined();
  });

  it("assigns context when provided", () => {
    const ctx = { foo: "bar" };
    const err = createEnhancedError("test error", ErrorType.VALIDATION, ErrorSeverity.LOW, ctx);
    expect("context" in err).toBe(true);
    expect(err.context).toEqual(ctx);
  });

  it("preserves originalError stack and cause when provided", () => {
    const original = new Error("original failure");
    const err = createEnhancedError("wrapped failure", ErrorType.NETWORK, ErrorSeverity.HIGH, undefined, original);
    expect(err.cause).toBe(original);
    expect(err.stack).toBe(original.stack);
  });

  it("retains wrapper stack when originalError.stack is undefined", () => {
    const original = new Error("original failure without stack");
    original.stack = undefined;
    const err = createEnhancedError("wrapped failure", ErrorType.NETWORK, ErrorSeverity.HIGH, undefined, original);
    expect(err.cause).toBe(original);
    expect(err.stack).toBeDefined();
    expect(err.stack).toContain("wrapped failure");
  });
});
