import React, { useState, useEffect } from "react";

interface AlchmKitchenTabProps {
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  showHeader?: boolean;
  allowFullscreen?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

const AlchmKitchenTab: React.FC<AlchmKitchenTabProps> = ({
  title = "Alchm Kitchen",
  className = "",
  style = {},
  showHeader = true,
  allowFullscreen = true,
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const alchmKitchenUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3003"
      : "https://v0-alchm-kitchen.vercel.app";

  const handleIframeLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.(new Error("Failed to load Alchm Kitchen"));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: isFullscreen ? "100vh" : "600px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    overflow: "hidden",
    position: isFullscreen ? "fixed" : "relative",
    top: isFullscreen ? "0" : "auto",
    left: isFullscreen ? "0" : "auto",
    zIndex: isFullscreen ? 9999 : "auto",
    backgroundColor: "#fff",
    ...style,
  };

  const iframeStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    border: "none",
    display: isLoading ? "none" : "block",
  };

  const loadingStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    backgroundColor: "#f8fafc",
    color: "#64748b",
  };

  const errorStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    padding: "20px",
    textAlign: "center",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    borderBottom: "1px solid #334155",
  };

  const buttonStyle: React.CSSProperties = {
    background: "none",
    border: "1px solid #64748b",
    color: "#f8fafc",
    padding: "4px 8px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    transition: "all 0.2s",
  };

  return (
    <div className={`alchm-kitchen-tab ${className}`} style={containerStyle}>
      {showHeader && (
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: "500" }}>🍳</span>
            <span style={{ fontSize: "14px", fontWeight: "500" }}>{title}</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {allowFullscreen && (
              <button
                onClick={toggleFullscreen}
                style={buttonStyle}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? "⤓" : "⤢"}
              </button>
            )}
            {isFullscreen && (
              <button
                onClick={toggleFullscreen}
                style={{ ...buttonStyle, backgroundColor: "#dc2626" }}
                title="Close"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {isLoading && (
        <div style={loadingStyle}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>🍳</div>
            <div>Loading Alchm Kitchen...</div>
            <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.7 }}>
              Astrological Food Recommendations
            </div>
          </div>
        </div>
      )}

      {hasError && (
        <div style={errorStyle}>
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>⚠️</div>
          <div style={{ fontWeight: "500", marginBottom: "8px" }}>
            Failed to load Alchm Kitchen
          </div>
          <div style={{ fontSize: "12px", marginBottom: "16px" }}>
            Please check your connection and try again
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: "#dc2626",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      <iframe
        src={alchmKitchenUrl}
        style={iframeStyle}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title={title}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        allow="fullscreen"
      />
    </div>
  );
};

export default AlchmKitchenTab;
