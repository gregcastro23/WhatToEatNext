/**
 * Tests for the provider chain to ensure mounting does not crash.
 * Validates that the full provider hierarchy renders without errors.
 */
import React from "react";
import { render, screen, act } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AlchemicalProvider } from "@/contexts/AlchemicalContext/provider";

describe("AlchemicalProvider", () => {
  it("renders children without crashing", () => {
    const { container } = render(
      <AlchemicalProvider>
        <div data-testid="child">Hello</div>
      </AlchemicalProvider>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(container).toBeTruthy();
  });

  it("provides default state values to children", () => {
    function TestConsumer() {
      const { useAlchemical } = require("@/contexts/AlchemicalContext/hooks");
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

    expect(screen.getByTestId("season")).toHaveTextContent("spring");
    expect(screen.getByTestId("dominant")).toHaveTextContent("Fire");
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
    function ThrowingComponent(): React.ReactElement {
      throw new Error("Detailed crash info");
    }

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Error Details")).toBeInTheDocument();
    expect(screen.getByText(/Detailed crash info/)).toBeInTheDocument();
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
