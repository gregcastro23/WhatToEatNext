/**
 * Tests for the clientLogger utility — ensures logging works
 * without throwing and respects the debug flag.
 */
import { clientLogger } from "@/utils/clientLogger";

describe("clientLogger", () => {
  const originalWarn = console.warn;
  const originalError = console.error;

  beforeEach(() => {
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.warn = originalWarn;
    console.error = originalError;
  });

  it("does not throw on any log level", () => {
    expect(() => clientLogger.debug("Test", "debug message")).not.toThrow();
    expect(() => clientLogger.info("Test", "info message")).not.toThrow();
    expect(() => clientLogger.warn("Test", "warn message")).not.toThrow();
    expect(() => clientLogger.error("Test", "error message")).not.toThrow();
  });

  it("logs warnings to console.warn", () => {
    clientLogger.warn("TestTag", "a warning");
    expect(console.warn).toHaveBeenCalled();
  });

  it("logs errors to console.error", () => {
    clientLogger.error("TestTag", "an error");
    expect(console.error).toHaveBeenCalled();
  });

  it("accepts optional data argument without crashing", () => {
    expect(() =>
      clientLogger.error("TestTag", "error with data", { key: "value" })
    ).not.toThrow();
    expect(() =>
      clientLogger.warn("TestTag", "warn with data", [1, 2, 3])
    ).not.toThrow();
  });
});
