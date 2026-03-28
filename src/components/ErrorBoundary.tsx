"use client";

import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

const MAX_AUTO_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

export class ErrorBoundary extends Component<Props, State> {
  private retryTimer: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      "%c[ErrorBoundary] Uncaught error in React tree",
      "color: #f44336; font-weight: bold; font-size: 14px",
      "\n\nError:", error.message,
      "\n\nStack:", error.stack,
      "\n\nComponent Stack:", errorInfo.componentStack,
    );
    this.setState({ error, errorInfo });

    // Auto-retry for transient errors (network, chunk loading)
    const isTransient =
      error.message.includes("ChunkLoadError") ||
      error.message.includes("Loading chunk") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError");

    if (isTransient && this.state.retryCount < MAX_AUTO_RETRIES) {
      this.retryTimer = setTimeout(() => {
        this.setState((prev) => ({
          hasError: false,
          error: null,
          errorInfo: null,
          retryCount: prev.retryCount + 1,
        }));
      }, RETRY_DELAY_MS * (this.state.retryCount + 1));
    }
  }

  componentWillUnmount() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isChunkError =
        this.state.error?.message.includes("ChunkLoadError") ||
        this.state.error?.message.includes("Loading chunk");

      return (
        <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
            {isChunkError ? "Connection Issue" : "Something went wrong"}
          </div>
          <p style={{ opacity: 0.7, marginBottom: "1.5rem", lineHeight: 1.6 }}>
            {isChunkError
              ? "A newer version of the app is available, or your connection was interrupted. Please refresh the page."
              : "An unexpected error occurred. You can try again or refresh the page."}
          </p>

          {this.state.retryCount > 0 && this.state.retryCount < MAX_AUTO_RETRIES && (
            <p style={{ fontSize: "0.85rem", opacity: 0.5, marginBottom: "1rem" }}>
              Auto-retrying... (attempt {this.state.retryCount}/{MAX_AUTO_RETRIES})
            </p>
          )}

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: "0.625rem 1.5rem",
                background: "#7c3aed",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Try Again
            </button>
            <button
              onClick={this.handleRefresh}
              style={{
                padding: "0.625rem 1.5rem",
                background: "transparent",
                color: "inherit",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "0.5rem",
                cursor: "pointer",
              }}
            >
              Refresh Page
            </button>
            <a
              href="/"
              style={{
                padding: "0.625rem 1.5rem",
                background: "transparent",
                color: "inherit",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "0.5rem",
                textDecoration: "none",
              }}
            >
              Go Home
            </a>
          </div>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <details style={{ whiteSpace: "pre-wrap", marginTop: "1.5rem", textAlign: "left" }}>
              <summary style={{ cursor: "pointer", fontWeight: "bold", fontSize: "0.85rem" }}>
                Developer Details
              </summary>
              <div
                style={{
                  marginTop: "0.5rem",
                  padding: "0.75rem",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "0.5rem",
                  fontSize: "0.8rem",
                  fontFamily: "monospace",
                }}
              >
                {this.state.error.toString()}
                {this.state.errorInfo && (
                  <pre style={{ marginTop: "0.5rem", overflow: "auto" }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
