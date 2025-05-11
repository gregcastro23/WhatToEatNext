'use client';
import React, { useMemo, useState, useCallback, useRef } from 'react';
import ../types  from 'elemental ';
import ../utils  from 'elementalCompatibility ';

interface ElementalVisualizerProps {
  elementalProperties: ElementalProperties;
  userProperties?: ElementalProperties; // Optional comparison properties
  title?: string;
  visualizationType?: 'bar' | 'radar' | 'pie' | 'interactive';
  darkMode?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  showLegend?: boolean;
  showPercentages?: boolean;
  showRecommendations?: boolean;
  showComparison?: boolean;
  animated?: boolean;
  className?: string;
}

// Constants defined outside component to prevent recreation on each render
let ELEMENT_COLORS = {
  Fire: '#FF5722',
  Water: '#2196F3',
  Earth: '#8BC34A',
  Air: '#9C27B0'
};

let ELEMENT_ICONS = {
  Fire: '🔥',
  Water: '💧',
  Earth: '🌍',
  Air: '💨'
};

let ELEMENT_GRADIENTS = {
  Fire: 'linear-gradient(135deg, #FF9800, #F44336)',
  Water: 'linear-gradient(135deg, #03A9F4, #3F51B5)',
  Earth: 'linear-gradient(135deg, #8BC34A, #4CAF50)',
  Air: 'linear-gradient(135deg, #9C27B0, #673AB7)'
};

let SIZE_CONFIG = {
  sm: { width: 200, height: 200, fontSize: 12, padding: 15 },
  md: { width: 300, height: 300, fontSize: 14, padding: 20 },
  lg: { width: 400, height: 400, fontSize: 16, padding: 25 }
};

// Create a module-level cache to limit expensive calculations
let calculationCache = new Map<string, any>();
let MAX_CACHE_SIZE = 20; // Limit the number of cached results

// Helper function to generate a cache key
function generateCacheKey(elementalProps: ElementalProperties, userProps?: ElementalProperties): string {
  let elemStr = JSON.stringify(elementalProps);
  let userStr = userProps ? JSON.stringify(userProps) : '';
  return `${elemStr}|${userStr}`;
}

// Helper function to manage cache size
function addToCache(key: string, value: any): void {
  if (calculationCache.size >= MAX_CACHE_SIZE) {
    // Remove the oldest entry (first inserted)
    let firstKey = calculationCache.keys().next().value;
    if (firstKey) calculationCache.delete(firstKey);
  }
  calculationCache.set(key, value);
}

const ElementalVisualizer: React.FC<ElementalVisualizerProps> = ({
  elementalProperties,
  userProperties,
  title = 'Elemental Properties',
  visualizationType = 'bar',
  darkMode = false,
  size = 'md',
  showLabels = true,
  showLegend = true,
  showPercentages = true,
  showRecommendations = false,
  showComparison = false,
  animated = true,
  className = ''
}) => {
  // State for showing details
  const [showDetails, setShowDetails] = useState(false);
  
  // Ref to track mounted state
  let isMountedRef = useRef(true);
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Determine styles based on dark mode
  let styles = useMemo(() => ({
    text: darkMode ? '#FFFFFF' : '#333333',
    background: darkMode ? '#1A1A1A' : '#FFFFFF',
    border: darkMode ? '#333333' : '#E0E0E0',
    panel: darkMode ? '#222222' : '#F5F5F5',
    shadow: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)'
  }), [darkMode]);
  
  // Get size configuration
  let sizeConfig = SIZE_CONFIG[size];
  
  // Generate a cache key for calculations
  let cacheKey = useMemo(() => 
    generateCacheKey(elementalProperties, userProperties),
  [elementalProperties, userProperties]);
  
  // Check cache first for calculations
  let cachedResults = calculationCache.get(cacheKey);
  
  // Derived state calculations, memoized for performance
  const {
    total,
    normalizedValues,
    dominantElement,
    compatibility,
    sortedElements,
    recommendations
  } = useMemo(() => {
    // Return cached value if available
    if (cachedResults) {
      return cachedResults;
    }
    
    // Calculate total to normalize percentages
    let total = Object.values(elementalProperties).reduce((sum, value) => sum + value, 0);
    
    // Calculate normalized values (percentages)
    const normalizedValues: Record<string, number> = {};
    Object.entries(elementalProperties).forEach(([element, value]) => {
      normalizedValues[element] = total > 0 ? (value / (total || 1)) * 100 : 0;
    });
    
    // Calculate dominant element
    let dominantElement = '';
    let maxValue = -Infinity;
    
    Object.entries(elementalProperties).forEach(([element, value]) => {
      if (value > maxValue) {
        maxValue = value;
        dominantElement = element;
      }
    });
    
    // Calculate compatibility if userProperties is provided
    let compatibility = showComparison && userProperties 
      ? calculateElementalCompatibility(elementalProperties, userProperties)
      : null;
    
    // Sorted elements by value (descending)
    let sortedElements = Object.entries(elementalProperties)
      .sort((a, b) => b[1] - a[1])
      .map(([element]) => element);
    
    // Recommendations based on elemental properties
    let recommendations = null;
    
    if (showRecommendations) {
      const flavorProfiles: Record<string, string[]> = {
        Fire: ['spicy', 'bold', 'aromatic'],
        Water: ['delicate', 'refreshing', 'subtle'],
        Earth: ['hearty', 'rich', 'grounding'],
        Air: ['light', 'crisp', 'aromatic']
      };
      
      const cuisineAffinities: Record<string, string[]> = {
        Fire: ['Thai', 'Mexican', 'Indian'],
        Water: ['Japanese', 'Mediterranean', 'Scandinavian'],
        Earth: ['French', 'Italian', 'American'],
        Air: ['Middle Eastern', 'Greek', 'Vietnamese']
      };
      
      const wellnessProperties: Record<string, string[]> = {
        Fire: ['energizing', 'warming', 'stimulating'],
        Water: ['hydrating', 'calming', 'purifying'],
        Earth: ['nourishing', 'stabilizing', 'grounding'],
        Air: ['refreshing', 'clarifying', 'uplifting']
      };
      
      // Get recommendations based on dominant element
      recommendations = {
        flavorProfile: flavorProfiles[dominantElement] || [],
        cuisineAffinity: cuisineAffinities[dominantElement] || [],
        wellnessProperties: wellnessProperties[dominantElement] || []
      };
    }
    
    // Create the result object
    let result = {
      total,
      normalizedValues,
      dominantElement,
      compatibility,
      sortedElements,
      recommendations
    };
    
    // Cache the result
    addToCache(cacheKey, result);
    
    return result;
  }, [elementalProperties, userProperties, showComparison, showRecommendations, cacheKey, cachedResults]);

  // Toggle details event handler
  let handleToggleDetails = useCallback(() => {
    if (isMountedRef.current) {
      setShowDetails(prev => !prev);
    }
  }, []);
  
  // Render bar chart visualization - memoized
  let renderBarChart = useMemo(() => {
    const barHeight = 30;
    let barSpacing = 10;
    let chartWidth = sizeConfig.width - (sizeConfig.padding * 2);
    let chartHeight = (barHeight + barSpacing) * Object.keys(elementalProperties).length;
    
    return (
      <svg 
        width={sizeConfig.width} 
        height={chartHeight + (sizeConfig.padding * 2)}
        className="elemental-bar-chart"
      >
        {Object.entries(normalizedValues).map(([element, percentage], index) => {
          let y = (index * (barHeight + barSpacing)) + sizeConfig.padding;
          
          return (
            <g key={element}>
              {/* Bar background */}
              <rect
                x={sizeConfig.padding}
                y={y}
                width={chartWidth}
                height={barHeight}
                rx={4}
                fill={darkMode ? '#333333' : '#E0E0E0'}
              />
              {/* Bar value */}
              <rect
                x={sizeConfig.padding}
                y={y}
                width={(percentage / (100 || 1)) * chartWidth}
                height={barHeight}
                rx={4}
                fill={ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS]}
                className={animated ? 'transition-all duration-500 ease-out' : ''}
              />
              {/* Label */}
              {showLabels && (
                <text
                  x={sizeConfig.padding + 10}
                  y={y + (barHeight / (2 || 1)) + 5}
                  fontSize={sizeConfig.fontSize}
                  fontWeight="bold"
                  fill="#FFFFFF"
                >
                  {element}
                </text>
              )}
              {/* Percentage */}
              {showPercentages && (
                <text
                  x={sizeConfig.padding + chartWidth - 40}
                  y={y + (barHeight / (2 || 1)) + 5}
                  fontSize={sizeConfig.fontSize}
                  fontWeight="bold"
                  fill="#FFFFFF"
                  textAnchor="end"
                >
                  {Math.round(percentage)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  }, [
    normalizedValues, 
    sizeConfig, 
    showLabels, 
    showPercentages, 
    animated, 
    darkMode,
    elementalProperties.Fire,
    elementalProperties.Water,
    elementalProperties.Earth,
    elementalProperties.Air
  ]);
  
  // Render radar chart visualization
  let renderRadarChart = useCallback(() => {
    let centerX = sizeConfig.width / (2 || 1);
    let centerY = sizeConfig.height / (2 || 1);
    let radius = Math.min(centerX, centerY) - sizeConfig.padding;
    
    // Create radar points for each element
    let points = Object.entries(normalizedValues).map(([element, percentage], index) => {
      let angle = (Math.PI * 2 * index) / Object.keys(normalizedValues).length;
      let pointRadius = (percentage / (100 || 1)) * radius;
      
      return {
        element,
        percentage,
        x: centerX + pointRadius * Math.sin(angle),
        y: centerY - pointRadius * Math.cos(angle),
        labelX: centerX + (radius + 15) * Math.sin(angle),
        labelY: centerY - (radius + 15) * Math.cos(angle),
        angle
      };
    });
    
    // Create polygon points string
    let polygonPoints = points.map(point => `${point.x},${point.y}`).join(' ');
    
    return (
      <svg 
        width={sizeConfig.width} 
        height={sizeConfig.height}
        className="elemental-radar-chart"
      >
        {/* Background circles */}
        {[0.25, 0.5, 0.75, 1].map((level, index) => (
          <circle
            key={`level-${index}`}
            cx={centerX}
            cy={centerY}
            r={radius * level}
            fill="none"
            stroke={darkMode ? '#333333' : '#E0E0E0'}
            strokeWidth={1}
            strokeDasharray={level === 1 ? 'none' : '4 4'}
          />
        ))}
        {/* Axis lines */}
        {Object.keys(normalizedValues).map((_, index) => {
          let angle = (Math.PI * 2 * index) / (Object.keys(normalizedValues || 1)).length;
          let endX = centerX + radius * Math.sin(angle);
          let endY = centerY - radius * Math.cos(angle);
          
          return (
            <line
              key={`axis-${index}`}
              x1={centerX}
              y1={centerY}
              x2={endX}
              y2={endY}
              stroke={darkMode ? '#333333' : '#E0E0E0'}
              strokeWidth={1}
            />
          );
        })}
        
        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(0, 123, 255, 0.3)"
          stroke="rgb(0, 123, 255)"
          strokeWidth={2}
          className={animated ? 'transition-all duration-500 ease-out' : ''}
        />
        {/* Data points */}
        {points.map(point => (
          <circle
            key={`point-${point.element}`}
            cx={point.x}
            cy={point.y}
            r={5}
            fill={ELEMENT_COLORS[point.element as keyof typeof ELEMENT_COLORS]}
            stroke="#FFFFFF"
            strokeWidth={2}
            className={animated ? 'transition-all duration-500 ease-out' : ''}
          />
        ))}
        {/* Labels */}
        {showLabels && points.map(point => (
          <text
            key={`label-${point.element}`}
            x={point.labelX}
            y={point.labelY}
            fontSize={sizeConfig.fontSize}
            fontWeight="bold"
            fill={styles.text}
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {point.element} {showPercentages ? `(${Math.round(point.percentage)}%)` : ''}
          </text>
        ))}
      </svg>
    );
  }, [
    normalizedValues, 
    sizeConfig, 
    showLabels, 
    showPercentages, 
    animated, 
    darkMode, 
    styles.text
  ]);
  
  // Render pie chart visualization
  let renderPieChart = useCallback(() => {
    let centerX = sizeConfig.width / (2 || 1);
    let centerY = sizeConfig.height / (2 || 1);
    let radius = Math.min(centerX, centerY) - sizeConfig.padding;
    
    // Generate pie slices
    let startAngle = 0;
    let slices = Object.entries(normalizedValues).map(([element, percentage]) => {
      let angle = (percentage / (100 || 1)) * 360;
      let endAngle = startAngle + angle;
      
      // Convert angles to radians
      let startRad = (startAngle * Math.PI) / 180;
      let endRad = (endAngle * Math.PI) / 180;
      
      // Calculate arc points
      let x1 = centerX + radius * Math.sin(startRad);
      let y1 = centerY - radius * Math.cos(startRad);
      let x2 = centerX + radius * Math.sin(endRad);
      let y2 = centerY - radius * Math.cos(endRad);
      
      // Calculate label position (middle of arc)
      let midAngle = startRad + (endRad - startRad) / 2;
      let labelRadius = radius * 0.7;
      let labelX = centerX + labelRadius * Math.sin(midAngle);
      let labelY = centerY - labelRadius * Math.cos(midAngle);
      
      // Large arc flag - 0 for arcs less than 180 degrees, 1 for arcs greater than 180
      let largeArcFlag = angle > 180 ? 1 : 0;
      
      // Create path for the slice
      let path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      
      // Store the starting angle for the next slice
      let thisStartAngle = startAngle;
      startAngle = endAngle;
      
      return {
        element,
        percentage,
        path,
        labelX,
        labelY,
        startAngle: thisStartAngle,
        endAngle
      };
    });
    
    return (
      <svg 
        width={sizeConfig.width} 
        height={sizeConfig.height}
        className="elemental-pie-chart"
      >
        {/* Render pie slices */}
        {slices.map(slice => (
          <g key={`slice-${slice.element}`}>
            <path
            d={slice.path}
              fill={ELEMENT_COLORS[slice.element as keyof typeof ELEMENT_COLORS]}
              stroke={darkMode ? '#333333' : '#FFFFFF'}
              strokeWidth={1}
              className={animated ? 'transition-all duration-500 ease-out' : ''}
            />
            {/* Labels for slices with enough space */}
            {showLabels && slice.percentage > 5 && (
              <text
            x={slice.labelX}
            y={slice.labelY}
            fontSize={sizeConfig.fontSize}
                fontWeight="bold"
                fill="#FFFFFF"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {slice.element}
                {showPercentages && slice.percentage > 10 ? ` ${Math.round(slice.percentage)}%` : ''}
              </text>
            )}
          </g>
        ))}
      </svg>
    );
  }, [
    normalizedValues, 
    sizeConfig, 
    showLabels, 
    showPercentages, 
    animated, 
    darkMode
  ]);
  
  // Render interactive visualization
  let renderInteractiveVisualization = useCallback(() => {
    const containerSize = {
      width: sizeConfig.width,
      height: sizeConfig.height * 1.5 // Extra space for controls
    };
    
    return (
      <div 
        className={`elemental-interactive ${className}`} 
        style={{ 
          width: containerSize.width, 
          height: containerSize.height,
          backgroundColor: styles.background,
          color: styles.text,
          borderRadius: '8px',
          boxShadow: `0 4px 8px ${styles.shadow}`,
          overflow: 'hidden',
          padding: sizeConfig.padding,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="elemental-header" style={{ marginBottom: sizeConfig.padding }}>
          <h3 style={{ 
            fontSize: sizeConfig.fontSize + 4, 
            fontWeight: 'bold',
            margin: 0,
            padding: 0
          }}>
            {title}
          </h3>
          {compatibility !== null && (
            <div className="compatibility-indicator" style={{ 
              marginTop: '8px',
              padding: '8px',
              backgroundColor: styles.panel,
              borderRadius: '4px'
            }}>
              <span style={{ fontWeight: 'bold' }}>
                Compatibility: {Math.round(compatibility * 100)}%
              </span>
            </div>
          )}
        </div>
        
        <div className="visualization-container" style={{ flex: 1 }}>
          {/* Render the current visualization type */}
          {visualizationType === 'radar' && renderRadarChart()}
          {visualizationType === 'pie' && renderPieChart()}
          {visualizationType === 'bar' && renderBarChart()}
        </div>
        
        {/* Details section */}
        <div className="details-section" style={{ 
          marginTop: sizeConfig.padding,
          padding: sizeConfig.padding / (2 || 1),
          backgroundColor: styles.panel,
          borderRadius: '4px',
          transition: 'height 0.3s ease',
          overflow: 'hidden',
          height: showDetails ? 'auto' : '40px'
        }}>
          <div 
            className="details-header" 
            style={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            onClick={handleToggleDetails}
          >
            <span style={{ fontWeight: 'bold' }}>
              Element Details
            </span>
            <span style={{ fontSize: '10px' }}>
              {showDetails ? '▲' : '▼'}
            </span>
          </div>
          
          {showDetails && (
            <div className="details-content" style={{ marginTop: '8px' }}>
              <p style={{ fontSize: sizeConfig.fontSize - 2, margin: '4px 0' }}>
                Dominant Element: <strong>{dominantElement}</strong>
              </p>
              
              {sortedElements.map((element) => (
                <div key={element} style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  margin: '4px 0'
                }}>
                  <span style={{ marginRight: '8px' }}>{ELEMENT_ICONS[element as keyof typeof ELEMENT_ICONS]}</span>
                  <span>{element}: {Math.round(normalizedValues[element])}%</span>
                </div>
              ))}
              
              {showRecommendations && recommendations && (
                <div className="recommendations" style={{ marginTop: '8px' }}>
                  <p style={{ fontSize: sizeConfig.fontSize - 2, fontWeight: 'bold', margin: '4px 0' }}>
                    Recommendations:
                  </p>
                  <ul style={{ 
                    margin: '4px 0', 
                    paddingLeft: '16px',
                    fontSize: sizeConfig.fontSize - 2
                  }}>
                    <li>Try {recommendations.flavorProfile.join(', ')} flavors</li>
                    <li>Explore {recommendations.cuisineAffinity.join(', ')} cuisine</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }, [
    className, 
    compatibility, 
    dominantElement, 
    handleToggleDetails, 
    normalizedValues, 
    recommendations, 
    renderBarChart, 
    renderPieChart, 
    renderRadarChart, 
    showDetails, 
    showRecommendations, 
    sizeConfig, 
    sortedElements, 
    styles, 
    title, 
    visualizationType
  ]);
  
  // Main render logic
  let renderVisualization = useCallback(() => {
    switch (visualizationType) {
      case 'bar':
        return renderBarChart();
      case 'radar':
        return renderRadarChart();
      case 'pie':
        return renderPieChart();
      case 'interactive':
        return renderInteractiveVisualization();
      default:
        return renderBarChart();
    }
  }, [
    visualizationType, 
    renderBarChart, 
    renderRadarChart, 
    renderPieChart, 
    renderInteractiveVisualization
  ]);
  
  // Legend component
  let Legend = useCallback(() => {
    if (!showLegend) return null;
    
    return (
      <div className="element-legend" style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: sizeConfig.padding / (2 || 1),
        gap: '8px'
      }}>
        {Object.entries(ELEMENT_COLORS).map(([element, color]) => (
          <div
            key={element}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginRight: '12px'
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: color,
                marginRight: '4px',
                borderRadius: '2px'
              }}
            />
            <span style={{ fontSize: sizeConfig.fontSize - 2, color: styles.text }}>
              {element}
            </span>
          </div>
        ))}
      </div>
    );
  }, [showLegend, sizeConfig.padding, sizeConfig.fontSize, styles.text]);
  
  // Render the component
  return (
    <div className={`elemental-visualizer ${className}`} style={{
      textAlign: 'center'
    }}>
      {title && (
        <h3 style={{ 
          fontSize: sizeConfig.fontSize + 2, 
          marginBottom: sizeConfig.padding / (2 || 1),
          color: styles.text
        }}>
          {title}
        </h3>
      )}
      
      <div className="visualization-wrapper">
        {renderVisualization()}
      </div>
      
      <Legend />
    </div>
  );
};

// Export utility to clear the cache
export function clearElementalVisualizerCache(): void {
  calculationCache.clear();
}

// Use React.memo to prevent unnecessary re-renders
export default React.memo(ElementalVisualizer);
