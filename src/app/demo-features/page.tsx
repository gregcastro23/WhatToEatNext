'use client';

import React from 'react';
import { PlanetaryHourDisplay } from '@/components/PlanetaryHourDisplay';
import { EnhancedRecommendationEngine } from '@/components/EnhancedRecommendationEngine';
import { EnergyVisualization } from '@/components/EnergyVisualization';
import { CelestialEventNotifications } from '@/components/CelestialEventNotifications';
import type { Recipe } from '@/lib/api/alchm-client';
import { logger } from '@/lib/logger';

export default function DemoFeaturesPage() {
  const [selectedRecipe, setSelectedRecipe] = React.useState<Recipe | null>(null)

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    logger.info('DemoFeaturesPage recipe selected', recipe)
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#333',
            marginBottom: '8px'
          }}>
            🔮 WhatToEatNext Advanced Features
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            margin: 0
          }}>
            Real-time WebSocket integration and enhanced API-driven recommendations
          </p>
        </div>

        {/* Top Row - Real-time displays */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <PlanetaryHourDisplay showDetails={true} />
          <EnergyVisualization showDetails={true} showHistory={true} />
        </div>

        {/* Middle Row - Notifications */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '30px'
        }}>
          <CelestialEventNotifications
            maxNotifications={3}
            autoHide={true}
            autoHideDelay={15000}
          />
        </div>

        {/* Bottom Row - Recommendation Engine */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '30px'
        }}>
          <EnhancedRecommendationEngine
            onRecipeSelect={handleRecipeSelect}
          />
        </div>

        {/* Selected Recipe Display */}
        {selectedRecipe && (
          <div style={{
            border: '2px solid #007bff',
            borderRadius: '12px',
            padding: '20px',
            backgroundColor: '#fff',
            maxWidth: '600px',
            margin: '0 auto',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#007bff'
            }}>
              🍽️ Selected Recipe
            </h3>
            <div>
              <h4 style={{
                margin: '0 0 8px 0',
                fontSize: '18px',
                color: '#333'
              }}>
                {selectedRecipe.name}
              </h4>
              <p style={{
                margin: '0 0 12px 0',
                fontSize: '14px',
                color: '#666'
              }}>
                Recipe ID: {selectedRecipe.id}
              </p>
              {selectedRecipe.url && (
                <a
                  href={selectedRecipe.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  View Recipe →
                </a>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#e7f3ff',
          borderRadius: '8px',
          border: '1px solid #b8daff'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '18px',
            color: '#004085'
          }}>
            🚀 Feature Highlights
          </h3>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            color: '#004085'
          }}>
            <li><strong>Real-time Planetary Hours:</strong> Live WebSocket updates with visual countdown</li>
            <li><strong>Energy Visualization:</strong> Dynamic elemental energy charts with history tracking</li>
            <li><strong>Celestial Notifications:</strong> Auto-updating event system with categorized alerts</li>
            <li><strong>Enhanced Recommendations:</strong> API-driven recipe suggestions with dietary preferences</li>
            <li><strong>Structured Logging:</strong> All interactions logged for debugging and analytics</li>
            <li><strong>Type Safety:</strong> Full TypeScript integration with centralized API client</li>
          </ul>
        </div>

        {/* Development Info */}
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          border: '1px solid #dee2e6',
          fontSize: '14px',
          color: '#6c757d'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>Development Status:</strong> All components ready for backend integration
          </p>
          <p style={{ margin: 0 }}>
            <strong>WebSocket Status:</strong> <span id="ws-status">Checking connection...</span> |
            <strong> API Client:</strong> Ready for type generation when backends are available
          </p>
        </div>
      </div>
    </div>
  )
}