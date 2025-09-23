import React, { lazy } from 'react';

// Simple logger fallback
const _logger = {
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args)
};

// Lazy-loaded components for code splitting
export const LazyPlanetaryHourDisplay = lazy(() =>
  import('../PlanetaryHourDisplay').then(module => ({
    default: module.PlanetaryHourDisplay
  }))
)

export const LazyEnhancedRecommendationEngine = lazy(() =>
  import('../EnhancedRecommendationEngine').then(module => ({
    default: module.EnhancedRecommendationEngine
  }))
)

export const LazyEnergyVisualization = lazy(() =>
  import('../EnergyVisualization').then(module => ({
    default: module.EnergyVisualization
  }))
)

export const LazyCelestialEventNotifications = lazy(() =>
  import('../CelestialEventNotifications').then(module => ({
    default: module.CelestialEventNotifications
  }))
)

// Loading component for Suspense fallbacks
export const ComponentLoader: React.FC<{ message?: string }> = ({ message = 'Loading component...' }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px dashed #ddd'
  }}>
    <div style={{
      textAlign: 'center',
      color: '#666'
    }}>
      <div style={{
        fontSize: '24px',
        marginBottom: '8px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>
        ⏳
      </div>
      <div style={{ fontSize: '14px' }}>
        {message}
      </div>
    </div>
  </div>)

// Error boundary for lazy components
export class LazyComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    _logger.error('LazyComponent Error: ', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: '20px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>⚠️</div>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            Component Failed to Load
          </div>
          <div style={{ fontSize: '14px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </div>
        </div>)
    }

    return this.props.children;
  }
}