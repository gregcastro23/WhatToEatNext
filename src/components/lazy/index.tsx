"use client";

import dynamic from "next/dynamic";
import React from "react";

// Simple logger fallback
const _logger = {
  error: (message: string, ...args: any[]) =>
    console.error(`[ERROR] ${message}`, ...args),
};

// Lazy-loaded components for code splitting - use Next.js dynamic instead of React.lazy
export const LazyPlanetaryHourDisplay = dynamic(
  () =>
    import("../PlanetaryHourDisplay").then(
      (module) => module.PlanetaryHourDisplay,
    ),
  { ssr: false },
);

export const LazyEnhancedRecommendationEngine = dynamic(
  () =>
    import("../EnhancedRecommendationEngine").then(
      (module) => module.EnhancedRecommendationEngine,
    ),
  { ssr: false },
);

export const LazyEnergyVisualization = dynamic(
  () =>
    import("../EnergyVisualization").then(
      (module) => module.EnergyVisualization,
    ),
  { ssr: false },
);

export const LazyCelestialEventNotifications = dynamic(
  () =>
    import("../CelestialEventNotifications").then(
      (module) => module.CelestialEventNotifications,
    ),
  { ssr: false },
);

// Loading component for Suspense fallbacks
export const ComponentLoader: React.FC<{ message?: string }> = ({
  message = "Loading component...",
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "40px",
      backgroundColor: "#f8f9fa",
      borderRadius: "8px",
      border: "1px dashed #ddd",
    }}
  >
    <div
      style={{
        textAlign: "center",
        color: "#666",
      }}
    >
      <div
        style={{
          fontSize: "24px",
          marginBottom: "8px",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      >
        ⏳
      </div>
      <div style={{ fontSize: "14px" }}>{message}</div>
    </div>
  </div>
);

// Error boundary for lazy components
export class LazyComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    _logger.error("LazyComponent Error: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              padding: "20px",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              border: "1px solid #f5c6cb",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "20px", marginBottom: "8px" }}>⚠️</div>
            <div style={{ fontWeight: "600", marginBottom: "4px" }}>
              Component Failed to Load
            </div>
            <div style={{ fontSize: "14px" }}>
              {this.state.error?.message || "An unexpected error occurred"}
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
