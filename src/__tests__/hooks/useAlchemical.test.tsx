/**
 * Tests for useAlchemical hook — verifies it does NOT crash when used
 * outside of the AlchemicalProvider (the primary crash vector identified).
 */
import React from "react";
import { renderHook } from "@testing-library/react";
import { useAlchemical, useAlchemicalSafe } from "@/contexts/AlchemicalContext/hooks";
import { AlchemicalProvider } from "@/contexts/AlchemicalContext/provider";

describe("useAlchemical hook", () => {
  it("returns context value when inside AlchemicalProvider", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AlchemicalProvider>{children}</AlchemicalProvider>
    );

    const { result } = renderHook(() => useAlchemical(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.state).toBeDefined();
    expect(result.current.isLoading).toBeDefined();
    expect(typeof result.current.getDominantElement).toBe("function");
    expect(typeof result.current.getCurrentElementalBalance).toBe("function");
    expect(typeof result.current.getAlchemicalHarmony).toBe("function");
  });

  it("does NOT throw when used outside AlchemicalProvider", () => {
    // This is the critical test — before the fix, this would throw
    // "useAlchemical must be used within an AlchemicalProvider"
    // and crash the entire React tree
    expect(() => {
      renderHook(() => useAlchemical());
    }).not.toThrow();
  });

  it("returns default context values when outside provider", () => {
    const { result } = renderHook(() => useAlchemical());

    // Should return the default context values from createContext()
    expect(result.current).toBeDefined();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isDaytime).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("provides working helper functions from default context", () => {
    const { result } = renderHook(() => useAlchemical());

    // Default helper functions should work without crashing
    expect(result.current.getDominantElement()).toBe("Fire");
    expect(result.current.getAlchemicalHarmony()).toBe(0.5);
    expect(result.current.calculateSeasonalInfluence()).toBe(0.5);

    const balance = result.current.getCurrentElementalBalance();
    expect(balance).toEqual({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    });
  });
});

describe("useAlchemicalSafe hook", () => {
  it("returns context when inside provider", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AlchemicalProvider>{children}</AlchemicalProvider>
    );

    const { result } = renderHook(() => useAlchemicalSafe(), { wrapper });
    expect(result.current).not.toBeNull();
    expect(result.current?.state).toBeDefined();
  });

  it("returns null-ish safely when outside provider", () => {
    const { result } = renderHook(() => useAlchemicalSafe());
    // With default context value, it returns the default (not null).
    // The hook still never throws.
    expect(result.current).toBeDefined();
  });
});
