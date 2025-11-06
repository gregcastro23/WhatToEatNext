'use client';

export const dynamic = 'force-dynamic';

import React, { Suspense } from 'react';
import {
  LazyPlanetaryHourDisplay,
  LazyEnhancedRecommendationEngine,
  LazyEnergyVisualization,
  LazyCelestialEventNotifications,
  ComponentLoader,
  LazyComponentErrorBoundary
} from '@/components/lazy';
import type { Recipe } from '@/lib/api/alchm-client';
import { logger } from '@/lib/logger';

export default function DemoOptimizedPage() {
  const [selectedRecipe, setSelectedRecipe] = React.useState<Recipe | null>(null)
  const [visibleSections, setVisibleSections] = React.useState({
    planetary: true,
    energy: true,
    notifications: true,
    recommendations: true
})

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    logger.debug('DemoOptimizedPage recipe selected', recipe)
  }

  const toggleSection = (section: keyof typeof visibleSections) => {
    setVisibleSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

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
            ⚡ Optimized Features Demo
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            margin: '0 0 20px 0'
}}>
            Code-split components with lazy loading and error boundaries
          </p>

          {/* Section Toggles */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap'
}}>
            {Object.entries(visibleSections).map(([key, visible]) => (
              <button
                key={key}
                onClick={() => toggleSection(key as keyof typeof visibleSections)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: visible ? '#007bff' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textTransform: 'capitalize'
}}
              >
                {visible ? '👁️' : '👁️‍🗨️'} {key}
              </button>))}
          </div>
        </div>

        {/* Planetary Hour Display */}
        {visibleSections.planetary && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '16px',
              textAlign: 'center'
}}>
              🪐 Real-time Planetary Hours
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <LazyComponentErrorBoundary>
                <Suspense fallback={<ComponentLoader message="Loading planetary hour display..." />}>
                  <LazyPlanetaryHourDisplay showDetails />
                </Suspense>
              </LazyComponentErrorBoundary>
            </div>
          </div>)}

        {/* Energy Visualization */}
        {visibleSections.energy && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '16px',
              textAlign: 'center'
}}>
              ⚡ Elemental Energy Visualization
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <LazyComponentErrorBoundary>
                <Suspense fallback={<ComponentLoader message="Loading energy visualization..." />}>
                  <LazyEnergyVisualization showDetails showHistory />
                </Suspense>
              </LazyComponentErrorBoundary>
            </div>
          </div>)}

        {/* Celestial Notifications */}
        {visibleSections.notifications && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '16px',
              textAlign: 'center'
}}>
              🌌 Celestial Event Notifications
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <LazyComponentErrorBoundary>
                <Suspense fallback={<ComponentLoader message="Loading notifications system..." />}>
                  <LazyCelestialEventNotifications
                    maxNotifications={5}
                    autoHide
                    autoHideDelay={12000}
                  />
                </Suspense>
              </LazyComponentErrorBoundary>
            </div>
          </div>)}

        {/* Recommendation Engine */}
        {visibleSections.recommendations && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '16px',
              textAlign: 'center'
}}>
              🔮 Enhanced Recommendation Engine
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <LazyComponentErrorBoundary>
                <Suspense fallback={<ComponentLoader message="Loading recommendation engine..." />}>
                  <LazyEnhancedRecommendationEngine
                    onRecipeSelect={handleRecipeSelect}
                  />
                </Suspense>
              </LazyComponentErrorBoundary>
            </div>
          </div>)}

        {/* Selected Recipe Display */}
        {selectedRecipe && (
          <div style={{
            border: '2px solid #28a745',
            borderRadius: '12px',
            padding: '20px',
            backgroundColor: '#fff',
            maxWidth: '600px',
            margin: '0 auto 30px auto',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            animation: 'slideIn 0.3s ease'
}}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#28a745'
}}>
              ✨ Selected Recipe
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
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedRecipe.url && (
                  <a
                    href={selectedRecipe.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
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
                <button
                  onClick={() => setSelectedRecipe(null)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
}}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>)}

        {/* Performance Info */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#d1ecf1',
          borderRadius: '8px',
          border: '1px solid #bee5eb'
}}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '18px',
            color: '#0c5460'
}}>
            ⚡ Performance Optimizations
          </h3>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            color: '#0c5460'
}}>
            <li><strong>Code Splitting:</strong> Each component loads only when needed</li>
            <li><strong>Lazy Loading:</strong> React.lazy() with Suspense for async loading</li>
            <li><strong>Error Boundaries: </strong> Graceful fallbacks for component failures</li>
            <li><strong>Toggle Sections:</strong> Load/unload components dynamically</li>
            <li><strong>Loading States:</strong> User feedback during component loading</li>
            <li><strong>Bundle Optimization:</strong> Smaller initial bundle size</li>
          </ul>
        </div>

        {/* Bundle Size Info */}
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
            <strong>Bundle Strategy:</strong> Main components are code-split into separate chunks
          </p>
          <p style={{ margin: 0 }}>
            <strong>Loading Strategy:</strong> Progressive enhancement with fallback states
          </p>
        </div>

        {/* Animation Styles */}
        <style jsx>{`
          @keyframes slideIn {
            from {
              opacity: 0,
              transform: translateY(20px)
            }
            to {
              opacity: 1,
              transform: translateY(0)
            }
          }
        `}</style>
      </div>
    </div>
  )
}