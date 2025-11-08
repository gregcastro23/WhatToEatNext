/**
 * Energy Visualization Component - Minimal Recovery Version
 *
 * Displays elemental energy levels with real-time updates and historical data.
 */

"use client";

import React from "react";

interface ElementalLevels {
  Fire: number;
  Water: number;
  Air: number;
  Earth: number;
}

interface EnergyReading extends ElementalLevels {
  timestamp: number;
}

interface EnergyVisualizationProps {
  elementalLevels?: ElementalLevels;
  showDetails?: boolean;
  showHistory?: boolean;
  className?: string;
}

const ELEMENT_COLORS = {
  Fire: "#FF4500",
  Water: "#1E90FF",
  Air: "#87CEEB",
  Earth: "#8B4513",
} as const;

const ELEMENT_SYMBOLS = {
  Fire: "🔥",
  Water: "💧",
  Air: "💨",
  Earth: "🌍",
} as const;

export function EnergyVisualization({
  elementalLevels,
  showDetails = true,
  showHistory = false,
  className = "",
}: EnergyVisualizationProps) {
  const [energyHistory, setEnergyHistory] = React.useState<EnergyReading[]>([]);
  const [currentLevels, setCurrentLevels] = React.useState<ElementalLevels>({
    Fire: 0.25,
    Water: 0.25,
    Air: 0.25,
    Earth: 0.25,
  });

  // Mock WebSocket hook
  const useAlchmWebSocket = () => ({
    isConnected: false,
    lastEnergyUpdate: null,
  });

  const { isConnected, lastEnergyUpdate } = useAlchmWebSocket();
  const maxHistoryLength = 20;

  React.useEffect(() => {
    if (elementalLevels) {
      setCurrentLevels(elementalLevels);
    }
  }, [elementalLevels]);

  React.useEffect(() => {
    if (lastEnergyUpdate) {
      const newReading: EnergyReading = {
        timestamp: Date.now(),
        ...(lastEnergyUpdate as any),
      };

      setEnergyHistory((prev) => {
        const updated = [...prev, newReading];
        return updated.slice(-maxHistoryLength);
      });

      setCurrentLevels(lastEnergyUpdate);
    }
  }, [lastEnergyUpdate]);

  const getMaxElement = () => {
    const entries = Object.entries(currentLevels) as Array<
      [keyof ElementalLevels, number]
    >;
    return entries.reduce(
      (max, [element, level]) => (level > max.level ? { element, level } : max),
      { element: "Fire" as keyof ElementalLevels, level: 0 },
    );
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const renderElementBar = (element: keyof ElementalLevels, level: number) => (
    <div key={element} style={{ marginBottom: "12px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "4px",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          <span style={{ fontSize: "18px" }}>{ELEMENT_SYMBOLS[element]}</span>
          {element}
        </span>
        <span
          style={{
            fontSize: "12px",
            color: ELEMENT_COLORS[element],
            fontWeight: "600",
          }}
        >
          {formatPercentage(level)}
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: "8px",
          backgroundColor: "#f0f0f0",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${level * 100}%`,
            height: "100%",
            backgroundColor: ELEMENT_COLORS[element],
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );

  const renderHistoryChart = () => {
    if (!showHistory || energyHistory.length === 0) return null;

    const maxPoints = 10;
    const displayHistory = energyHistory.slice(-maxPoints);

    return (
      <div style={{ marginTop: "20px" }}>
        <h4
          style={{
            margin: "0 0 12px 0",
            fontSize: "14px",
            fontWeight: "600",
            color: "#333",
          }}
        >
          Energy History
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(60px, 1fr))",
            gap: "8px",
            padding: "12px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          {displayHistory.map((reading, index) => {
            const dominant = getMaxElement();
            return (
              <div
                key={reading.timestamp}
                style={{
                  textAlign: "center",
                  fontSize: "10px",
                  color: "#666",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "40px",
                    display: "flex",
                    alignItems: "end",
                    justifyContent: "center",
                    marginBottom: "4px",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: `${reading[dominant.element] * 40}px`,
                      backgroundColor: ELEMENT_COLORS[dominant.element],
                      borderRadius: "2px 2px 0 0",
                    }}
                  />
                </div>
                <div>
                  {new Date(reading.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const dominant = getMaxElement();

  return (
    <div
      className={`energy-visualization ${className}`}
      style={{
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        border: "1px solid #e0e0e0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "600",
            color: "#333",
          }}
        >
          ⚡ Elemental Energy
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: isConnected ? "#22c55e" : "#ef4444",
            }}
          />
          <span style={{ fontSize: "12px", color: "#666" }}>
            {isConnected ? "Live" : "Offline"}
          </span>
        </div>
      </div>

      {showDetails && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: `${ELEMENT_COLORS[dominant.element]}10`,
            borderRadius: "8px",
            border: `1px solid ${ELEMENT_COLORS[dominant.element]}30`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              color: ELEMENT_COLORS[dominant.element],
              fontWeight: "600",
            }}
          >
            <span style={{ fontSize: "20px" }}>
              {ELEMENT_SYMBOLS[dominant.element]}
            </span>
            Dominant: {dominant.element} ({formatPercentage(dominant.level)})
          </div>
        </div>
      )}

      <div style={{ marginBottom: "16px" }}>
        {Object.entries(currentLevels).map(([element, level]) =>
          renderElementBar(element as keyof ElementalLevels, level),
        )}
      </div>

      {showDetails && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              padding: "8px",
              backgroundColor: "#f8f9fa",
              borderRadius: "6px",
              textAlign: "center",
            }}
          >
            <div
              style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}
            >
              Balance Score
            </div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>
              {(
                (Math.min(...Object.values(currentLevels)) /
                  Math.max(...Object.values(currentLevels))) *
                100
              ).toFixed(0)}
              %
            </div>
          </div>
          <div
            style={{
              padding: "8px",
              backgroundColor: "#f8f9fa",
              borderRadius: "6px",
              textAlign: "center",
            }}
          >
            <div
              style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}
            >
              Total Energy
            </div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>
              {Object.values(currentLevels)
                .reduce((sum, level) => sum + level, 0)
                .toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {renderHistoryChart()}

      <div
        style={{
          fontSize: "11px",
          color: "#999",
          textAlign: "center",
          marginTop: "12px",
          padding: "8px",
          borderTop: "1px solid #eee",
        }}
      >
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

export default EnergyVisualization;
