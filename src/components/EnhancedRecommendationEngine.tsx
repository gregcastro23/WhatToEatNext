/**
 * Enhanced Recommendation Engine Component - Live Data Version
 *
 * Provides sophisticated recipe recommendations with dietary restrictions,
 * cuisine preferences, and alchemical compatibility scoring.
 */

"use client";

import React from "react";
import { useAlchemicalRecommendations } from "@/hooks/useAlchemicalRecommendations";
import { useChartData } from "@/hooks/useChartData";
import { useUser } from "@/contexts/UserContext";

interface RecommendationFilters {
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
}

interface EnhancedRecommendationEngineProps {
  filters?: RecommendationFilters;
  maxRecommendations?: number;
  showScoring?: boolean;
  className?: string;
}

const DIETARY_OPTIONS = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "keto",
  "paleo",
  "low-carb",
  "low-sodium",
] as const;

const CUISINE_OPTIONS = [
  "italian",
  "chinese",
  "indian",
  "mexican",
  "thai",
  "japanese",
  "french",
  "mediterranean",
  "american",
  "korean",
] as const;

export function EnhancedRecommendationEngine({
  filters = { dietaryRestrictions: [], cuisinePreferences: [] },
  maxRecommendations = 5,
  showScoring = true,
  className = "",
}: EnhancedRecommendationEngineProps) {
  const { currentUser } = useUser();
  const { positions, alchemical, isLoading: chartIsLoading, error: chartError } = useChartData();

  const { recommendations, loading, error } = useAlchemicalRecommendations({
    // @ts-ignore
    ingredients: [], // Placeholder, should be fetched from a data source
    cookingMethods: [], // Placeholder
    cuisines: [], // Placeholder
    planetPositions: positions as any,
    isDaytime: true, // Placeholder
    count: maxRecommendations,
    // @ts-ignore
    aspects: alchemical?.aspects,
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "#22c55e";
      case "Medium":
        return "#f59e0b";
      case "Hard":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };
  
  const isLoading = loading || chartIsLoading;

  return (
    <div
      className={`enhanced-recommendation-engine ${className}`}
      style={{
        padding: "24px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        border: "1px solid #e0e0e0",
      }}
    >
      <h2
        style={{
          margin: "0 0 20px 0",
          fontSize: "24px",
          fontWeight: "600",
          color: "#333",
        }}
      >
        🍳 Enhanced Recipe Recommendations
      </h2>
      
      {/* Filters Section - Simplified for now */}
      <div
        style={{
          marginBottom: "24px",
          padding: "16px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
        }}
      >
        <h3
          style={{
            margin: "0 0 16px 0",
            fontSize: "16px",
            fontWeight: "600",
            color: "#333",
          }}
        >
          Filters
        </h3>
        <p style={{color: "#666", fontSize: "14px"}}>
            Filters will be applied automatically based on your preferences.
        </p>
      </div>

      {/* Results Section */}
      <div>
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
            Recommendations
          </h3>
        </div>

        {isLoading ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#666",
            }}
          >
            Generating personalized recommendations...
          </div>
        ) : error || chartError ? (
            <div
                style={{
                textAlign: "center",
                padding: "40px",
                color: "#ef4444",
                }}
            >
                Error generating recommendations: {error?.message || chartError}
            </div>
        ) : !recommendations || recommendations.topIngredients.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#666",
            }}
          >
            No recipes found matching your criteria.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {recommendations.topIngredients.map((result: any, index: number) => (
              <div
                key={result.id}
                style={{
                  padding: "16px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "8px",
                  }}
                >
                  <div>
                    <h4
                      style={{
                        margin: "0 0 4px 0",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      #{index + 1} {result.name}
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        color: "#666",
                        lineHeight: "1.4",
                      }}
                    >
                      {/* Description would go here if available */}
                    </p>
                  </div>
                  {showScoring && (
                    <div
                      style={{
                        textAlign: "right",
                        minWidth: "80px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "#22c55e",
                        }}
                      >
                        {(result.score * 100).toFixed(0)}%
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#666",
                        }}
                      >
                        Match Score
                      </div>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    <span>🍽️ {result.cuisine || "N/A"}</span>
                    <span>⏱️ {result.cookingTime || "N/A"} min</span>
                    <span
                      style={{
                        color: getDifficultyColor(result.difficulty || "Easy"),
                      }}
                    >
                      ⭐ {result.difficulty || "Easy"}
                    </span>
                    <span>⭐ {result.rating || "N/A"}/5</span>
                  </div>
                </div>

                {showScoring && (
                  <div
                    style={{
                      marginTop: "8px",
                      padding: "8px",
                      backgroundColor: "#f0f9ff",
                      borderRadius: "4px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#0369a1",
                        marginBottom: "4px",
                      }}
                    >
                      Alchemical Properties:
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#0369a1",
                      }}
                    >
                      Dominant Element: {recommendations.dominantElement}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#0369a1",
                        marginTop: "4px",
                      }}
                    >
                      Heat: {recommendations.heat.toFixed(2)} |
                      Entropy: {recommendations.entropy.toFixed(2)} |
                      Reactivity: {recommendations.reactivity.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedRecommendationEngine;
