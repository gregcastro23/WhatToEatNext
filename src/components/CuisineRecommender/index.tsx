import React, { useState, useEffect } from 'react';
import DirectRecipeService from '@/services/DirectRecipeService';
import { ScoredRecipe } from '@/types/recipe';
import type { CelestialAlignment } from '@/types/alchemy';
import { Element } from "@/types/alchemy";

interface CuisineRecommenderProps {
  cuisine?: string;
  mealType?: string;
  season?: string;
  limit?: number;
}

export const CuisineRecommender: React.FC<CuisineRecommenderProps> = ({
  cuisine,
  mealType,
  season,
  limit = 10
}) => {
  const [recommendations, setRecommendations] = useState<ScoredRecipe[]>([]);
  const [celestialData, setCelestialData] = useState<CelestialAlignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [cuisine, mealType, season, limit]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const recipeService = DirectRecipeService.getInstance();
      
      // Get current celestial influence data (placeholder for now)
      const celestialInfluence: CelestialAlignment = {
        date: new Date().toISOString(),
        currentZodiacSign: 'leo',
        dominantPlanets: [
          { name: 'Sun', influence: 0.8 },
          { name: 'Moon', influence: 0.6 }
        ],
        lunarPhase: 'full moon',
        aspectInfluences: [],
        astrologicalInfluences: ['Fire dominant', 'High energy']
      };
      setCelestialData(celestialInfluence);

      let results: ScoredRecipe[] = [];

      // Get recommendations based on available criteria
      if (cuisine) {
        results = await recipeService.getRecipesByCuisine(cuisine, limit, 0);
      } else if (mealType) {
        results = await recipeService.getRecipesByMealType(mealType, limit, 0);
      } else if (season) {
        results = await recipeService.getRecipesBySeason(season, limit, 0);
      } else {
        // Get best matches based on current astrological conditions
        results = await recipeService.getBestRecipeMatches({
          criteria: {
            // Use current celestial state as criteria
            elementalProperties: celestialInfluence.energyStateBalance || {}
          },
          limit
        });
      }

      setRecommendations(results);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Failed to load recipe recommendations');
    } finally {
      setLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    const recipeService = DirectRecipeService.getInstance();
    await recipeService.refreshAstrologicalData();
    await loadRecommendations();
  };

  if (loading) {
    return (
      <div className="cuisine-recommender loading">
        <div className="spinner">Loading astrologically-aligned recommendations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cuisine-recommender error">
        <p>{error}</p>
        <button onClick={loadRecommendations}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="cuisine-recommender">
      {/* Celestial Influence Display */}
      {celestialData && (
        <div className="celestial-influence-panel">
          <h3>Current Celestial Influences</h3>
          <div className="celestial-data">
            <div className="zodiac-info">
              <strong>Zodiac:</strong> {celestialData.currentZodiacSign}
            </div>
            <div className="lunar-info">
              <strong>Lunar Phase:</strong> {celestialData.lunarPhase}
            </div>
            <div className="dominant-planets">
              <strong>Dominant Planets:</strong>
              {(celestialData?.dominantPlanets || []).map(planet => (
                <span key={(planet as any).name} className="planet-tag">
                  {(planet as any).name} ({((planet as any).influence * 100)?.toFixed(0)}%)
                </span>
              ))}
            </div>
            <div className="elemental-balance">
              <strong>Elemental Balance:</strong>
              <div className="elements">
                {Object.entries((celestialData as any)?.elementalState || {}).map(([element, value]) => (
                  <div key={element} className="element-bar">
                    <span className="element-name">{element}:</span>
                    <div className="bar">
                      <div 
                        className={`fill ${element?.toLowerCase()}`}
                        style={{ width: `${(value as number) * 100}%` }}
                      />
                    </div>
                    <span className="percentage">{((value as number) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button onClick={refreshRecommendations} className="refresh-btn">
            Refresh Astrological Data
          </button>
        </div>
      )}

      {/* Recipe Recommendations */}
      <div className="recommendations-panel">
        <h3>
          Astrologically-Aligned Recipe Recommendations
          {cuisine && ` for ${cuisine} Cuisine`}
          {mealType && ` for ${mealType}`}
          {season && ` for ${season}`}
        </h3>
        
        {(recommendations || []).length === 0 ? (
          <p>No recipes found matching your criteria and current celestial influences.</p>
        ) : (
          <div className="recipe-list">
            {(recommendations || []).map((recipe, index) => (
              <div key={recipe.id} className="recipe-card">
                <div className="recipe-header">
                  <h4>{recipe.name}</h4>
                  <div className="compatibility-score">
                    <span className="score">{(recipe.score * 100).toFixed(0)}%</span>
                    <span className="label">Astrological Compatibility</span>
                  </div>
                </div>
                
                <div className="recipe-details">
                  <p className="description">{recipe.description}</p>
                  <div className="meta-info">
                    <span className="cuisine">Cuisine: {recipe.cuisine}</span>
                    <span className="time">Time: {recipe.timeToMake}</span>
                    <span className="servings">Serves: {recipe.servings}</span>
                  </div>
                </div>

                {/* Alchemical Score Breakdown */}
                {recipe.alchemicalScores && (
                  <div className="alchemical-breakdown">
                    <h5>Compatibility Breakdown:</h5>
                    <div className="score-details">
                      <div className="score-item">
                        <span>Elemental:</span>
                        <span>{(recipe.alchemicalScores.elementalScore * 100).toFixed(0)}%</span>
                      </div>
                      <div className="score-item">
                        <span>Zodiacal:</span>
                        <span>{(recipe.alchemicalScores.zodiacalScore * 100).toFixed(0)}%</span>
                      </div>
                      <div className="score-item">
                        <span>Lunar:</span>
                        <span>{(recipe.alchemicalScores.lunarScore * 100).toFixed(0)}%</span>
                      </div>
                      <div className="score-item">
                        <span>Planetary:</span>
                        <span>{(recipe.alchemicalScores.planetaryScore * 100).toFixed(0)}%</span>
                      </div>
                      <div className="score-item">
                        <span>Seasonal:</span>
                        <span>{(recipe.alchemicalScores.seasonalScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Elemental Properties */}
                {recipe.elementalState && (
                  <div className="elemental-properties">
                    <h5>Recipe Elements:</h5>
                    <div className="elements">
                      {Object.entries(recipe?.elementalState || {}).map(([element, value]) => (
                        <div key={element} className="element-indicator">
                          <span className={`element-dot ${element?.toLowerCase()}`} />
                          <span>{element}: {(Number(value) * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Astrological Influences */}
                <div className="astrological-influences">
                  {recipe.zodiacInfluences && (recipe.zodiacInfluences || []).length > 0 && (
                    <div className="influences-section">
                      <strong>Zodiac Influences:</strong>
                      {(recipe?.zodiacInfluences || []).map(sign => (
                        <span key={sign} className="influence-tag zodiac">{sign}</span>
                      ))}
                    </div>
                  )}
                  
                  {recipe.planetaryInfluences?.favorable && (recipe?.planetaryInfluences?.favorable || []).length > 0 && (
                    <div className="influences-section">
                      <strong>Favorable Planets:</strong>
                      {(recipe?.planetaryInfluences?.favorable || []).map(planet => (
                        <span key={planet} className="influence-tag planet favorable">{planet}</span>
                      ))}
                    </div>
                  )}
                  
                  {recipe.lunarPhaseInfluences && (recipe.lunarPhaseInfluences || []).length > 0 && (
                    <div className="influences-section">
                      <strong>Lunar Phases:</strong>
                      {(recipe?.lunarPhaseInfluences || []).map(phase => (
                        <span key={phase} className="influence-tag lunar">{phase}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ingredients Preview */}
                <div className="ingredients-preview">
                  <h5>Key Ingredients:</h5>
                  <div className="ingredients-list">
                    {(recipe.ingredients?.slice(0, 5) || []).map((ingredient, idx) => (
                      <span key={idx} className="ingredient-tag">
                        {ingredient.name}
                      </span>
                    ))}
                    {(recipe.ingredients || []).length > 5 && (
                      <span className="more-ingredients">
                        +{(recipe.ingredients || []).length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .cuisine-recommender {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .celestial-influence-panel {
          background: linear-gradient(135deg, #1a1a2e, #16213e);
          color: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .celestial-influence-panel h3 {
          margin: 0 0 15px 0;
          color: #ffd700;
        }

        .celestial-data {
          display: grid;
          gap: 15px;
        }

        .planet-tag {
          background: rgba(255, 215, 0, 0.2);
          color: #ffd700;
          padding: 4px 8px;
          border-radius: 4px;
          margin-right: 8px;
          font-size: 0.9em;
        }

        .element-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 5px 0;
        }

        .element-name {
          min-width: 60px;
          font-weight: 500;
        }

        .bar {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .fill.Fire { background: #ff4444; }
        .fill.Water { background: #4488ff; }
        .fill.Earth { background: #44aa44; }
        .fill.Air { background: #ffaa44; }

        .percentage {
          min-width: 40px;
          text-align: right;
          font-size: 0.9em;
        }

        .refresh-btn {
          background: #ffd700;
          color: #1a1a2e;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          margin-top: 15px;
        }

        .recipe-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
        }

        .recipe-header {
          display: flex;
          justify-content: between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .recipe-header h4 {
          margin: 0;
          color: #333;
          flex: 1;
        }

        .compatibility-score {
          text-align: center;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 10px;
          border-radius: 8px;
          min-width: 100px;
        }

        .score {
          display: block;
          font-size: 1.5em;
          font-weight: bold;
        }

        .label {
          font-size: 0.8em;
          opacity: 0.9;
        }

        .meta-info {
          display: flex;
          gap: 15px;
          margin: 10px 0;
          font-size: 0.9em;
          color: #666;
        }

        .alchemical-breakdown h5,
        .elemental-properties h5,
        .ingredients-preview h5 {
          margin: 15px 0 8px 0;
          color: #444;
          font-size: 1em;
        }

        .score-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px;
        }

        .score-item {
          display: flex;
          justify-content: space-between;
          padding: 4px 8px;
          background: #f5f5f5;
          border-radius: 4px;
          font-size: 0.9em;
        }

        .element-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-right: 15px;
          font-size: 0.9em;
        }

        .element-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .element-dot.Fire { background: #ff4444; }
        .element-dot.Water { background: #4488ff; }
        .element-dot.Earth { background: #44aa44; }
        .element-dot.Air { background: #ffaa44; }

        .influences-section {
          margin: 8px 0;
        }

        .influence-tag {
          display: inline-block;
          padding: 2px 6px;
          margin: 2px 4px;
          border-radius: 4px;
          font-size: 0.8em;
          font-weight: 500;
        }

        .influence-tag.zodiac { background: #e3f2fd; color: #1565c0; }
        .influence-tag.planet { background: #fff3e0; color: #ef6c00; }
        .influence-tag.planet.favorable { background: #e8f5e8; color: #2e7d32; }
        .influence-tag.lunar { background: #f3e5f5; color: #7b1fa2; }

        .ingredients-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .ingredient-tag {
          background: #f0f0f0;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85em;
          color: #555;
        }

        .more-ingredients {
          color: #888;
          font-style: italic;
          font-size: 0.85em;
        }

        .loading {
          text-align: center;
          padding: 40px;
        }

        .spinner {
          color: #667eea;
          font-size: 1.1em;
        }

        .error {
          text-align: center;
          padding: 40px;
          color: #d32f2f;
        }

        @media (max-width: 768px) {
          .recipe-header {
            flex-direction: column;
            gap: 10px;
          }

          .meta-info {
            flex-direction: column;
            gap: 5px;
          }

          .score-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CuisineRecommender; 