"use client";

import React, { useState, useEffect } from "react";

// Define the structure for a recommendation
interface TransmutationRecommendation {
  date: string;
  time_range: string;
  ruling_planet: string;
  imbalance_to_address: string;
  recommendation_text: string;
  total_potency_score_multiplier: number;
}

interface CelestialEquilibriumProps {
  alchemicalQuantities: {
    spirit_score: number;
    essence_score: number;
    matter_score: number;
    substance_score: number;
  } | null;
}

export default function CelestialEquilibrium({
  alchemicalQuantities,
}: CelestialEquilibriumProps) {
  const [recommendations, setRecommendations] = useState<
    TransmutationRecommendation[]
  >([]);
  const [loadingRecommendations, setLoadingRecommendations] =
    useState<boolean>(true);
  const [errorRecommendations, setErrorRecommendations] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoadingRecommendations(true);
        setErrorRecommendations(null);
        // This is a placeholder API call. The actual endpoint needs to be implemented on the backend.
        // It should ideally receive the current imbalance state from the alchemicalQuantities
        // or re-calculate it on the backend. For simplicity, we'll assume the backend
        // determines the imbalance type.
        const response = await fetch("/api/transmutation_recommendations"); // TODO: Implement this API endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: TransmutationRecommendation[] = await response.json();
        setRecommendations(data);
      } catch (error: any) {
        setErrorRecommendations(error.message);
        console.error("Failed to fetch transmutation recommendations:", error);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    // Only fetch if alchemicalQuantities is available, as imbalance depends on it.
    // In a real scenario, the API call might implicitly derive imbalance or take it as a parameter.
    if (alchemicalQuantities) {
      fetchRecommendations();
    } else {
      setLoadingRecommendations(false); // No data, so no recommendations to fetch
    }
  }, [alchemicalQuantities]); // Re-fetch if alchemicalQuantities changes

  if (!alchemicalQuantities) {
    return (
      <div className="text-gray-500 text-sm text-center py-4">
        No alchemical quantities data available.
      </div>
    );
  }

  const data = [
    { name: "Spirit", value: alchemicalQuantities.spirit_score },
    { name: "Essence", value: alchemicalQuantities.essence_score },
    { name: "Matter", value: alchemicalQuantities.matter_score },
    { name: "Substance", value: alchemicalQuantities.substance_score },
  ];

  // Basic SVG for a radar chart-like visualization
  const size = 150;
  const center = size / 2;
  const spokeLength = center * 0.8; // Max radius for data points
  const maxValue = 1.0; // Max possible score

  const getCoordinates = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const length = (value / maxValue) * spokeLength;
    return {
      x: center + length * Math.cos(angle),
      y: center + length * Math.sin(angle),
    };
  };

  const points = data.map((item, i) =>
    getCoordinates(item.value, i, data.length),
  );
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="w-full flex flex-col items-center py-4">
      {" "}
      {/* Changed to flex-col for stacking */}
      {/* Existing SVG radar chart */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform scale-y-[-1]"
      >
        {/* Radar grid lines */}
        {[0.25, 0.5, 0.75, 1.0].map((level) => {
          const r = level * spokeLength;
          return (
            <circle
              key={level}
              cx={center}
              cy={center}
              r={r}
              stroke="rgba(128, 128, 128, 0.3)"
              strokeWidth="0.5"
              fill="none"
            />
          );
        })}

        {/* Spokes */}
        {data.map((_, i) => {
          const coord = getCoordinates(maxValue, i, data.length);
          return (
            <line
              key={`spoke-${i}`}
              x1={center}
              y1={center}
              x2={coord.x}
              y2={coord.y}
              stroke="rgba(128, 128, 128, 0.3)"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(139, 92, 246, 0.4)"
          stroke="#8B5CF6"
          strokeWidth="1.5"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={`point-${i}`} cx={p.x} cy={p.y} r="3" fill="#8B5CF6" />
        ))}
      </svg>
      {/* New: Oracle's Path Section */}
      <div className="mt-8 w-full max-w-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Oracle's Path: Predictive Transmutation Windows
        </h3>
        {loadingRecommendations && (
          <p className="text-gray-600 text-center">
            Loading recommendations...
          </p>
        )}
        {errorRecommendations && (
          <p className="text-red-500 text-center">
            Error: {errorRecommendations}
          </p>
        )}
        {!loadingRecommendations &&
          !errorRecommendations &&
          (recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="bg-purple-50 p-4 rounded-lg shadow-md border border-purple-200"
                >
                  <p className="font-medium text-gray-800">
                    <span className="text-purple-700">
                      {rec.ruling_planet} Hour:
                    </span>{" "}
                    {rec.time_range}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {rec.recommendation_text}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Total Potency Score Multiplier:{" "}
                    <span className="font-bold text-purple-600">
                      x{rec.total_potency_score_multiplier.toFixed(2)}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center">
              No specific transmutation windows found for the next 3 days.
            </p>
          ))}
      </div>
    </div>
  );
}
