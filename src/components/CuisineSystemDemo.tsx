/**
 * Cuisine System Demonstration Component
 *
 * Interactive demonstration of the comprehensive cuisine-level recommendation system.
 * Shows personalized recommendations, signature analysis, and planetary patterns.
 */

"use client";

import React, { useEffect, useState } from "react";
import type { ElementalProperties } from "@/types/alchemy";
import {
  configureGlobalCache,
  getGlobalCache,
} from "@/utils/cuisine/cuisineComputationCache";
import { generateCuisineRecommendations } from "@/utils/cuisine/cuisineRecommendationEngine";

interface UserProfile {
  elementalPreferences: ElementalProperties;
  culturalBackground?: {
    preferredCuisines?: string[];
    dietaryRestrictions?: string[];
  };
  astrologicalProfile?: {
    sunSign?: string;
    moonSign?: string;
  };
}

const CuisineSystemDemo: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    elementalPreferences: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
  });

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);

  useEffect(() => {
    // Initialize cache
    configureGlobalCache({ maxSize: 50, ttl: 24 * 60 * 60 * 1000 });
  }, []);

  const handleElementalChange = (
    element: keyof ElementalProperties,
    value: number,
  ) => {
    setUserProfile((prev) => ({
      ...prev,
      elementalPreferences: {
        ...prev.elementalPreferences,
        [element]: value / 100, // Convert percentage to decimal
      },
    }));
  };

  const generateRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create mock cuisine data (in production, this would be computed)
      const mockCuisines = new Map([
        [
          "Italian",
          {
            name: "Italian",
            properties: {
              averageElementals: {
                Fire: 0.3,
                Water: 0.3,
                Earth: 0.3,
                Air: 0.1,
              },
              averageAlchemical: {
                Spirit: 2.5,
                Essence: 3.0,
                Matter: 3.0,
                Substance: 1.5,
              },
              signatures: [
                {
                  property: "Earth",
                  zscore: 2.1,
                  strength: "high",
                  averageValue: 0.3,
                  globalAverage: 0.25,
                  description:
                    "Italian cuisine has a high Earth signature due to wheat-based dishes and cheese",
                },
              ],
              planetaryPatterns: [
                {
                  planet: "Venus",
                  commonSigns: [
                    { sign: "taurus", frequency: 0.4 },
                    { sign: "libra", frequency: 0.3 },
                  ],
                  planetaryStrength: 0.65,
                  dominantElement: "Earth",
                },
              ],
              sampleSize: 50,
              computedAt: new Date(),
              version: "1.0.0",
            },
          },
        ],
        [
          "Mexican",
          {
            name: "Mexican",
            properties: {
              averageElementals: {
                Fire: 0.6,
                Water: 0.2,
                Earth: 0.1,
                Air: 0.1,
              },
              averageAlchemical: {
                Spirit: 3.0,
                Essence: 2.0,
                Matter: 2.5,
                Substance: 2.5,
              },
              signatures: [
                {
                  property: "Fire",
                  zscore: 2.8,
                  strength: "high",
                  averageValue: 0.6,
                  globalAverage: 0.25,
                  description:
                    "Mexican cuisine has a very high Fire signature due to chili peppers and spices",
                },
              ],
              planetaryPatterns: [
                {
                  planet: "Mars",
                  commonSigns: [
                    { sign: "aries", frequency: 0.5 },
                    { sign: "scorpio", frequency: 0.3 },
                  ],
                  planetaryStrength: 0.72,
                  dominantElement: "Fire",
                },
              ],
              sampleSize: 40,
              computedAt: new Date(),
              version: "1.0.0",
            },
          },
        ],
        [
          "Japanese",
          {
            name: "Japanese",
            properties: {
              averageElementals: {
                Fire: 0.2,
                Water: 0.4,
                Earth: 0.1,
                Air: 0.3,
              },
              averageAlchemical: {
                Spirit: 3.5,
                Essence: 2.5,
                Matter: 1.5,
                Substance: 2.5,
              },
              signatures: [
                {
                  property: "Water",
                  zscore: 1.9,
                  strength: "moderate",
                  averageValue: 0.4,
                  globalAverage: 0.25,
                  description:
                    "Japanese cuisine has a high Water signature due to seafood and delicate preparations",
                },
              ],
              planetaryPatterns: [
                {
                  planet: "Mercury",
                  commonSigns: [
                    { sign: "gemini", frequency: 0.4 },
                    { sign: "virgo", frequency: 0.3 },
                  ],
                  planetaryStrength: 0.58,
                  dominantElement: "Air",
                },
              ],
              sampleSize: 45,
              computedAt: new Date(),
              version: "1.0.0",
            },
          },
        ],
        [
          "Indian",
          {
            name: "Indian",
            properties: {
              averageElementals: {
                Fire: 0.5,
                Water: 0.2,
                Earth: 0.2,
                Air: 0.1,
              },
              averageAlchemical: {
                Spirit: 4.0,
                Essence: 2.0,
                Matter: 2.0,
                Substance: 2.0,
              },
              signatures: [
                {
                  property: "Spirit",
                  zscore: 2.5,
                  strength: "high",
                  averageValue: 4.0,
                  globalAverage: 2.5,
                  description:
                    "Indian cuisine has exceptional Spirit due to complex spice combinations and transformative cooking",
                },
              ],
              planetaryPatterns: [
                {
                  planet: "Jupiter",
                  commonSigns: [
                    { sign: "sagittarius", frequency: 0.5 },
                    { sign: "pisces", frequency: 0.3 },
                  ],
                  planetaryStrength: 0.68,
                  dominantElement: "Fire",
                },
              ],
              sampleSize: 60,
              computedAt: new Date(),
              version: "1.0.0",
            },
          },
        ],
      ]);

      // Generate recommendations
      const recs = (generateCuisineRecommendations as any)({
        elementalProperties: userProfile.elementalPreferences,
        preferences: userProfile.culturalBackground?.preferredCuisines || [],
        dietaryRestrictions:
          userProfile.culturalBackground?.dietaryRestrictions || [],
        astrologicalProfile: userProfile.astrologicalProfile,
        useAdvancedAnalysis: true,
      });

      // Simulate with mock data since we're not using real computed data
      setRecommendations([
        {
          cuisine: "Mexican",
          score: 0.85,
          reasoning: "Strong Fire element match with spicy Mexican cuisine",
          elementalMatch: 0.8,
          planetaryAlignment: 0.7,
          signatureMatch: 0.9,
          confidence: 0.9,
          detailedReasoning: [
            "High Fire element compatibility",
            "Mars planetary alignment",
            "Very high Fire signature match",
          ],
        },
        {
          cuisine: "Italian",
          score: 0.72,
          reasoning: "Balanced elemental match with Italian cuisine",
          elementalMatch: 0.7,
          planetaryAlignment: 0.6,
          signatureMatch: 0.8,
          confidence: 0.85,
          detailedReasoning: [
            "Good elemental balance",
            "Venus planetary alignment",
            "High Earth signature match",
          ],
        },
        {
          cuisine: "Indian",
          score: 0.68,
          reasoning: "Strong planetary and signature alignment",
          elementalMatch: 0.6,
          planetaryAlignment: 0.8,
          signatureMatch: 0.7,
          confidence: 0.8,
          detailedReasoning: [
            "Jupiter planetary alignment",
            "High Spirit signature match",
            "Moderate elemental compatibility",
          ],
        },
      ]);

      // Update cache stats
      const cache = getGlobalCache();
      setCacheStats(cache.getStats());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateCacheStats = () => {
    const cache = getGlobalCache();
    setCacheStats(cache.getStats());
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">🍽️ Cuisine System Demo</h1>
        <p className="text-lg opacity-90">
          Experience the comprehensive cuisine-level recommendation system with
          personalized analysis
        </p>
      </div>

      {/* User Profile Configuration */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          👤 User Profile Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Elemental Preferences */}
          <div>
            <h3 className="text-lg font-medium mb-3">Elemental Preferences</h3>
            <div className="space-y-3">
              {Object.entries(userProfile.elementalPreferences).map(
                ([element, value]) => (
                  <div key={element} className="flex items-center space-x-3">
                    <label className="w-16 font-medium">{element}:</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(value) * 100}
                      onChange={(e) =>
                        handleElementalChange(
                          element as keyof ElementalProperties,
                          parseInt(e.target.value, 10),
                        )
                      }
                      className="flex-1"
                    />
                    <span className="w-12 text-right">
                      {Math.round((value) * 100)}%
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Astrological Profile */}
          <div>
            <h3 className="text-lg font-medium mb-3">Astrological Profile</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sun Sign
                </label>
                <select
                  value={userProfile.astrologicalProfile?.sunSign || ""}
                  onChange={(e) =>
                    setUserProfile((prev) => ({
                      ...prev,
                      astrologicalProfile: {
                        ...prev.astrologicalProfile,
                        sunSign: e.target.value || undefined,
                      },
                    }))
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Sun Sign</option>
                  <option value="aries">Aries</option>
                  <option value="taurus">Taurus</option>
                  <option value="gemini">Gemini</option>
                  <option value="cancer">Cancer</option>
                  <option value="leo">Leo</option>
                  <option value="virgo">Virgo</option>
                  <option value="libra">Libra</option>
                  <option value="scorpio">Scorpio</option>
                  <option value="sagittarius">Sagittarius</option>
                  <option value="capricorn">Capricorn</option>
                  <option value="aquarius">Aquarius</option>
                  <option value="pisces">Pisces</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Moon Sign
                </label>
                <select
                  value={userProfile.astrologicalProfile?.moonSign || ""}
                  onChange={(e) =>
                    setUserProfile((prev) => ({
                      ...prev,
                      astrologicalProfile: {
                        ...prev.astrologicalProfile,
                        moonSign: e.target.value || undefined,
                      },
                    }))
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Moon Sign</option>
                  <option value="aries">Aries</option>
                  <option value="taurus">Taurus</option>
                  <option value="gemini">Gemini</option>
                  <option value="cancer">Cancer</option>
                  <option value="leo">Leo</option>
                  <option value="virgo">Virgo</option>
                  <option value="libra">Libra</option>
                  <option value="scorpio">Scorpio</option>
                  <option value="sagittarius">Sagittarius</option>
                  <option value="capricorn">Capricorn</option>
                  <option value="aquarius">Aquarius</option>
                  <option value="pisces">Pisces</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => { void generateRecommendations(); }}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "🔄 Generating..." : "🎯 Generate Recommendations"}
          </button>

          <button
            onClick={updateCacheStats}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            📊 Update Cache Stats
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">❌ Error</h3>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Recommendations Display */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">
            🏆 Personalized Recommendations
          </h2>

          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {rec.cuisine}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-2xl">
                        {rec.score >= 0.8
                          ? "🌟"
                          : rec.score >= 0.6
                            ? "⭐"
                            : "⚡"}
                      </span>
                      <span className="text-lg font-medium text-blue-600">
                        {Math.round(rec.score * 100)}% match
                      </span>
                      <span className="text-sm text-gray-600">
                        Confidence: {Math.round(rec.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-3">{rec.reasoning}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-600">Elemental Match</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {Math.round(rec.elementalMatch * 100)}%
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-600">
                      Planetary Alignment
                    </div>
                    <div className="text-lg font-semibold text-purple-600">
                      {Math.round(rec.planetaryAlignment * 100)}%
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-600">Signature Match</div>
                    <div className="text-lg font-semibold text-green-600">
                      {Math.round(rec.signatureMatch * 100)}%
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <h4 className="font-medium text-gray-800 mb-2">
                    Detailed Analysis:
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {rec.detailedReasoning.map(
                      (reason: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          {reason}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cache Statistics */}
      {cacheStats && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">📊 Cache Performance</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {cacheStats.totalEntries}
              </div>
              <div className="text-sm text-gray-600">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(cacheStats.hitRate * 100)}%
              </div>
              <div className="text-sm text-gray-600">Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {cacheStats.totalHits}
              </div>
              <div className="text-sm text-gray-600">Total Hits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {Math.round(cacheStats.memoryUsage / 1024)}KB
              </div>
              <div className="text-sm text-gray-600">Memory Usage</div>
            </div>
          </div>
        </div>
      )}

      {/* System Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">ℹ️ System Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">🔧 Components</h3>
            <ul className="space-y-1 text-sm">
              <li>✅ Cuisine Aggregation Engine</li>
              <li>✅ Signature Identification Engine</li>
              <li>✅ Planetary Pattern Analysis</li>
              <li>✅ Cultural Influence Engine</li>
              <li>✅ Personalized Recommendation Engine</li>
              <li>✅ Intelligent Caching System</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">🎯 Features</h3>
            <ul className="space-y-1 text-sm">
              <li>🧮 Statistical Z-Score Analysis</li>
              <li>🪐 Planetary Pattern Recognition</li>
              <li>🌍 Cultural Influence Integration</li>
              <li>🎨 Personalized Compatibility Scoring</li>
              <li>⚡ Intelligent Caching & Performance</li>
              <li>🔄 Backward Compatibility</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">📚 Usage Examples</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div>
              <code>
                import &#123; generateCuisineRecommendations &#125; from
                '@/utils/cuisine';
              </code>
            </div>
            <div>
              <code>
                import &#123; generateCuisineRecommendation &#125; from
                '@/utils';
              </code>
            </div>
            <div>
              <code>
                import &#123; getGlobalCache, configureGlobalCache &#125; from
                '@/utils/cuisine';
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuisineSystemDemo;
