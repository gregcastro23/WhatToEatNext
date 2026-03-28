/**
 * Tests for apiCircuitBreaker.ts — circuit breaker pattern for API resilience.
 */
import { CircuitBreaker } from "@/utils/apiCircuitBreaker";

describe("CircuitBreaker", () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 100, // short for testing
    });
  });

  describe("CLOSED state (default)", () => {
    it("starts in CLOSED state", () => {
      expect(breaker.getState()).toBe("CLOSED");
    });

    it("passes through successful calls", async () => {
      const result = await breaker.call(() => Promise.resolve("ok"));
      expect(result).toBe("ok");
      expect(breaker.getState()).toBe("CLOSED");
    });

    it("propagates errors when no fallback", async () => {
      await expect(
        breaker.call(() => Promise.reject(new Error("fail")))
      ).rejects.toThrow("fail");
    });

    it("uses fallback on failure when provided", async () => {
      const result = await breaker.call(
        () => Promise.reject(new Error("fail")),
        () => "fallback-value"
      );
      expect(result).toBe("fallback-value");
    });
  });

  describe("CLOSED → OPEN transition", () => {
    it("opens after reaching failure threshold", async () => {
      for (let i = 0; i < 3; i++) {
        await breaker.call(
          () => Promise.reject(new Error("fail")),
          () => "fallback"
        );
      }
      expect(breaker.getState()).toBe("OPEN");
    });

    it("stays closed below threshold", async () => {
      await breaker.call(
        () => Promise.reject(new Error("fail")),
        () => "fallback"
      );
      await breaker.call(
        () => Promise.reject(new Error("fail")),
        () => "fallback"
      );
      expect(breaker.getState()).toBe("CLOSED");
    });
  });

  describe("OPEN state", () => {
    beforeEach(async () => {
      // Trip the breaker
      for (let i = 0; i < 3; i++) {
        await breaker.call(
          () => Promise.reject(new Error("fail")),
          () => "fallback"
        );
      }
    });

    it("rejects calls immediately when open (no fallback)", async () => {
      await expect(
        breaker.call(() => Promise.resolve("ok"))
      ).rejects.toThrow("Circuit breaker is OPEN");
    });

    it("uses fallback when open", async () => {
      const result = await breaker.call(
        () => Promise.resolve("ok"),
        () => "open-fallback"
      );
      expect(result).toBe("open-fallback");
    });
  });

  describe("OPEN → HALF_OPEN transition", () => {
    it("transitions to HALF_OPEN after resetTimeout", async () => {
      // Trip the breaker
      for (let i = 0; i < 3; i++) {
        await breaker.call(
          () => Promise.reject(new Error("fail")),
          () => "fallback"
        );
      }
      expect(breaker.getState()).toBe("OPEN");

      // Wait for resetTimeout
      await new Promise((r) => setTimeout(r, 150));

      // Next call should try (HALF_OPEN) and succeed → CLOSED
      const result = await breaker.call(() => Promise.resolve("recovered"));
      expect(result).toBe("recovered");
      expect(breaker.getState()).toBe("CLOSED");
    });
  });

  describe("reset()", () => {
    it("resets state to CLOSED", async () => {
      for (let i = 0; i < 3; i++) {
        await breaker.call(
          () => Promise.reject(new Error("fail")),
          () => "fallback"
        );
      }
      expect(breaker.getState()).toBe("OPEN");

      breaker.reset();
      expect(breaker.getState()).toBe("CLOSED");

      // Should work normally after reset
      const result = await breaker.call(() => Promise.resolve("after-reset"));
      expect(result).toBe("after-reset");
    });
  });
});
