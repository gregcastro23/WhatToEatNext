'use client';

import React, { useState, useEffect, useRef, memo, useCallback } from 'react';

import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { useDebugSettings } from '@/hooks/useDebugSettings';
import { useDraggable } from '@/hooks/useDraggable';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { performanceMonitor } from '@/services/PerformanceMonitoringService';

interface DebugInfoProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right';
  collapsible?: boolean;
  showPerformanceMetrics?: boolean;
  showAstrologicalData?: boolean;
  showComponentStates?: boolean;
}

interface ComponentState {
  loading: boolean;
  error: string | null;
  data: unknown;
  lastUpdated: Date;
}

const ConsolidatedDebugInfo = memo(function ConsolidatedDebugInfo({
  position: propPosition = 'bottom-right',
  collapsible = true,
  showPerformanceMetrics: propShowPerformanceMetrics = true,
  showAstrologicalData: propShowAstrologicalData = true,
  showComponentStates: propShowComponentStates = true
}: DebugInfoProps) {
  const [systemData, setSystemData] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const { planetaryPositions, state, isDaytime } = useAlchemical();
  const { metrics } = usePerformanceMetrics('ConsolidatedDebugInfo');
  const { 
    settings, 
    toggleCollapsed, 
    toggleVisibility,
    setCustomPosition,
    togglePerformanceMetrics,
    toggleAstrologicalData,
    toggleComponentStates,
    setOpacity,
    resetSettings
  } = useDebugSettings();

  // Use settings values, fallback to props
  const isVisible = settings.isVisible;
  const isCollapsed = settings.isCollapsed;
  const position = settings.position || propPosition;
  const showPerformanceMetrics = settings.showPerformanceMetrics ?? propShowPerformanceMetrics;
  const showAstrologicalData = settings.showAstrologicalData ?? propShowAstrologicalData;
  const showComponentStates = settings.showComponentStates ?? propShowComponentStates;

  // Set up draggable functionality
  const { ref: draggableRef, setPosition: setDragPosition } = useDraggable({
    handle: '.debug-panel-header',
    onDragEnd: (x, y) => {
      setCustomPosition(x, y);
    },
    bounds: {
      left: 0,
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight
    }
  });

  // Subscribe to performance monitor updates
  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe((data) => {
      setSystemData(data);
    });

    return unsubscribe;
  }, []);

  // Apply custom position if set
  useEffect(() => {
    if (settings.customPosition && draggableRef.current) {
      setDragPosition(settings.customPosition.x, settings.customPosition.y);
    }
  }, [settings.customPosition, setDragPosition, draggableRef]);

  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50 bg-black bg-opacity-90 text-white text-xs rounded-lg shadow-lg max-w-sm';
    
    switch (position) {
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'bottom-right':
      default:
        return `${baseClasses} bottom-4 right-4`;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const toggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Show Debug Panel"
      >
        🐛
      </button>
    );
  }

  return (
    <div 
      ref={draggableRef as React.Ref<HTMLDivElement>}
      className={getPositionClasses()}
      style={{ 
        opacity: settings.opacity,
        ...(settings.customPosition && {
          position: 'fixed',
          left: settings.customPosition.x,
          top: settings.customPosition.y,
          bottom: 'auto',
          right: 'auto'
        })
      }}
    >
      {/* Header with toggle */}
      <div 
        className="debug-panel-header flex items-center justify-between p-2 bg-gray-800 rounded-t-lg cursor-move select-none"
      >
        <h3 className="font-semibold text-sm">Debug Panel</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleSettings}
            className="text-gray-400 hover:text-white transition-colors"
            title="Settings"
          >
            ⚙️
          </button>
          <button
            onClick={toggleVisibility}
            className="text-gray-400 hover:text-white transition-colors"
            title="Hide Panel"
          >
            ✕
          </button>
          <span className="text-xs text-gray-400">
            {formatTime(metrics.lastUpdated)}
          </span>
          {collapsible &amp;&amp; (
            <button
              onClick={toggleCollapsed}
              className="text-gray-400 hover:text-white transition-colors"
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? '▼' : '▲'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
          {/* Performance Metrics */}
          {showPerformanceMetrics && (
            <div>
              <h4 className="font-medium text-yellow-400 mb-1">Performance</h4>
              <div className="space-y-1 text-xs">
                <div>Renders: {metrics.componentRenderCount}</div>
                <div>Render Time: {metrics.renderTime.toFixed(1)}ms</div>
                <div>Avg Render: {metrics.averageRenderTime.toFixed(1)}ms</div>
                {metrics.memoryUsage > 0 && (
                  <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
                )}
                <div className={`${metrics.errorCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  Errors: {metrics.errorCount}
                </div>
                {systemData?.summary && (
                  <div className="mt-2 pt-1 border-t border-gray-600">
                    <div>Health Score: {systemData.summary.healthScore.toFixed(0)}%</div>
                    <div>Total Components: {systemData.summary.totalComponents}</div>
                    <div>System Memory: {systemData.summary.memoryUsage.toFixed(1)}MB</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Astrological Data */}
          {showAstrologicalData && (
            <div>
              <h4 className="font-medium text-blue-400 mb-1">Astrological State</h4>
              <div className="space-y-1 text-xs">
                <div>Sun Sign: {(planetaryPositions.sun as any)?.sign || 'Unknown&apos;}</div>
                <div>Lunar Phase: {state.lunarPhase || 'Unknown'}</div>
                <div>Planetary Hour: {state.planetaryHour || 'Unknown'}</div>
                <div>Time of Day: {isDaytime ? 'Day' : 'Night'}</div>
                <div>Dominant Element: {state.dominantElement || 'Unknown'}</div>
              </div>
            </div>
          )}

          {/* Elemental Balance */}
          {showAstrologicalData && state.elementalState && (
            <div>
              <h4 className="font-medium text-green-400 mb-1">Elemental Balance</h4>
              <div className="space-y-1 text-xs">
                {Object.entries(state.elementalState).map(([element, value]) => (
                  <div key={element} className="flex justify-between">
                    <span>{element}:</span>
                    <span>{((value ) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alchemical Values */}
          {showAstrologicalData && state.alchemicalValues && (
            <div>
              <h4 className="font-medium text-purple-400 mb-1">Alchemical Tokens</h4>
              <div className="space-y-1 text-xs">
                {Object.entries(state.alchemicalValues).map(([token, value]) => (
                  <div key={token} className="flex justify-between">
                    <span>⦿ {token}:</span>
                    <span>{(value ).toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Component States */}
          {showComponentStates && (
            <div>
              <h4 className="font-medium text-orange-400 mb-1">Component Status</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Context:</span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Loading:</span>
                  <span className={state.error ? 'text-red-400' : 'text-green-400'}>
                    {state.error ? 'Error&apos; : 'OK&apos;}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last Update:</span>
                  <span>{formatTime(state.lastUpdated || new Date())}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {state.errors && state.errors.length > 0 && (
            <div>
              <h4 className="font-medium text-red-400 mb-1">Recent Errors</h4>
              <div className="space-y-1 text-xs max-h-20 overflow-y-auto">
                {state.errors.slice(-3).map((error, index) => (
                  <div key={index} className="text-red-300 break-words">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Panel */}
          {showSettings && (
            <div className="border-t border-gray-600 pt-3">
              <h4 className="font-medium text-cyan-400 mb-2">Settings</h4>
              <div className="space-y-2 text-xs">
                {/* Display Options */}
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPerformanceMetrics}
                      onChange={togglePerformanceMetrics}
                      className="w-3 h-3"
                    />
                    <span>Performance Metrics</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAstrologicalData}
                      onChange={toggleAstrologicalData}
                      className="w-3 h-3"
                    />
                    <span>Astrological Data</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showComponentStates}
                      onChange={toggleComponentStates}
                      className="w-3 h-3"
                    />
                    <span>Component States</span>
                  </label>
                </div>

                {/* Opacity Control */}
                <div>
                  <label className="block mb-1">Opacity: {(settings.opacity * 100).toFixed(0)}%</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={settings.opacity * 100}
                    onChange={(e) => setOpacity(parseInt(e.target.value) / 100)}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer&quot;
                  />
                </div>

                {/* Reset Button */}
                <div className="pt-2">
                  <button
                    onClick={resetSettings}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded text-xs transition-colors"
                  >
                    Reset Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default ConsolidatedDebugInfo;