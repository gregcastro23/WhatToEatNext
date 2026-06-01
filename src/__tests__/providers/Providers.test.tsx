/**
 * Tests for the provider chain to ensure mounting does not crash.
 * Validates that the full provider hierarchy renders without errors.
 */
import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AlchemicalProvider } from "@/contexts/AlchemicalContext/provider";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";

describe("AlchemicalProvider", () => {
  it("renders children without crashing", async () => {
    const { container } = render(
      <AlchemicalProvider>
        <div data-testid="child">Hello</div>
      </AlchemicalProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(container).toBeTruthy();
  });

  it("provides default state values to children", async () => {
    function TestConsumer() {
      const ctx = useAlchemical();
      return (
        <div>
          <span data-testid="season">{ctx.state.currentSeason}</span>
          <span data-testid="loading">{String(ctx.isLoading)}</span>
          <span data-testid="dominant">{ctx.getDominantElement()}</span>
        </div>
      );
    }

    render(
      <AlchemicalProvider>
        <TestConsumer />
      </AlchemicalProvider>
    );

    // currentSeason + dominant element are derived from the live date/sky (the
    // provider overrides the static "spring"/"Fire" defaults on mount), so assert
    // they're VALID values rather than hard-coding them — otherwise this test
    // breaks every time the real-world season rolls over (it was red from June 1
    // when spring → summer).
    const SEASON = /^(spring|summer|autumn|fall|winter)$/i;
    const ELEMENT = /^(Fire|Water|Earth|Air)$/;

    await waitFor(() => {
      expect(screen.getByTestId("season")).toHaveTextContent(SEASON);
    });

    expect(screen.getByTestId("season")).toHaveTextContent(SEASON);
    expect(screen.getByTestId("dominant")).toHaveTextContent(ELEMENT);
  });
});

describe("ErrorBoundary", () => {
  // Suppress console.error for expected error boundary catches
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div data-testid="safe-child">Safe content</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId("safe-child")).toBeInTheDocument();
  });

  it("catches errors and shows fallback UI", () => {
    function ThrowingComponent(): React.ReactElement {
      throw new Error("Test crash");
    }

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("displays error details when expanded", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    function ThrowingComponent(): React.ReactElement {
      throw new Error("Detailed crash info");
    }

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Developer Details")).toBeInTheDocument();
    expect(screen.getByText(/Detailed crash info/)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it("recovers when Try Again is clicked", () => {
    let shouldThrow = true;

    function ConditionalThrow() {
      if (shouldThrow) {
        throw new Error("Recoverable error");
      }
      return <div data-testid="recovered">Recovered!</div>;
    }

    render(
      <ErrorBoundary>
        <ConditionalThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Fix the component before clicking retry
    shouldThrow = false;
    act(() => {
      screen.getByText("Try Again").click();
    });

    expect(screen.getByTestId("recovered")).toBeInTheDocument();
  });
});
