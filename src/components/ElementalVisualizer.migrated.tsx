'use client';
import { ElementalProperties } from '@/types/celestial';
import React, { useMemo, useState, useCallback, useRef } from 'react';
import { useServices } from '@/hooks/useServices';



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
const ELEMENT_COLORS = { Fire: '#FF5722', Water: '#2196F3', Earth: '#8BC34A', Air: '#9C27B0'
};

const ELEMENT_ICONS = { Fire: '🔥', Water: '💧', Earth: '🌍', Air: '💨'
};

const ELEMENT_GRADIENTS = { Fire: 'linear-gradient(135deg, #FF9800, #F44336)',
  Water: 'linear-gradient(135deg, #03A9F4, #3F51B5)',
  Earth: 'linear-gradient(135deg, #8BC34A, #4CAF50)',
  Air: 'linear-gradient(135deg, #9C27B0, #673AB7)'
};

const SIZE_CONFIG = {
  sm: { width: 200, height: 200, fontSize: 12, padding: 15 },
  md: { width: 300, height: 300, fontSize: 14, padding: 20 },
  lg: { width: 400, height: 400, fontSize: 16, padding: 25 }
};

// Create a module-level cache to limit expensive calculations
const calculationCache = new Map<string, any>();
const MAX_CACHE_SIZE = 20; // Limit the number of cached results

// Helper function to generate a cache key
function generateCacheKey(elementalProps: ElementalProperties, userProps?: ElementalProperties): string {
  const elemStr = JSON.stringify(elementalProps);
  const userStr = userProps ? JSON.stringify(userProps) : '';
  return `${elemStr}|${userStr}`;
}

// Helper function to manage cache size
function addToCache(key: string, value: Record<string, unknown>): void {
  if (calculationCache.size >= MAX_CACHE_SIZE) {
    // Remove the oldest entry (first inserted)
    const firstKey = calculationCache.keys()?.next().value;
    if (firstKey) calculationCache.delete(firstKey);
  }
  calculationCache.set(key, value);
}

// Function to calculate elemental compatibility
function calculateElementalCompatibility(
  source: ElementalProperties,
  target: ElementalProperties
): number {
  // Calculate weighted similarity score
  let totalScore = 0;
  let totalWeight = 0;
  
  for (const element in source) {
    if (Object?.prototype?.hasOwnProperty?.call(source, element) && 
        Object?.prototype?.hasOwnProperty?.call(target, element)) {
      const sourceValue = source[element as "Fire" | "Water" | "Earth" | "Air"] || 0;
      const targetValue = target[element as "Fire" | "Water" | "Earth" | "Air"] || 0;
      
      // Use the source value as weight
      const weight = sourceValue;
      
      // Calculate the similarity for this element (1 - normalized difference)
      const maxValue = Math.max(sourceValue, targetValue);
      const similarity = maxValue > 0 
        ? 1 - (Math.abs(sourceValue - targetValue) / maxValue) 
        : 1;
      
      totalScore += weight * similarity;
      totalWeight += weight;
    }
  }
  
  // Return normalized score (0-1)
  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

const ElementalVisualizerMigrated: React.FC<ElementalVisualizerProps> = ({
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
  // Access services through the useServices hook
  const { isLoading, error } = useServices();
  
  // State for showing details
  const [showDetails, setShowDetails] = useState(false);
  
  // Ref to track mounted state
  const isMountedRef = useRef(true);
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Determine styles based on dark mode
  const styles = useMemo(() => ({
    text: darkMode ? '#FFFFFF' : '#333333',
    background: darkMode ? '#1A1A1A' : '#FFFFFF',
    border: darkMode ? '#333333' : '#E0E0E0',
    panel: darkMode ? '#222222' : '#F5F5F5',
    shadow: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)'
  }), [darkMode]);
  
  // Get size configuration
  const sizeConfig = SIZE_CONFIG[size];
  
  // Generate a cache key for calculations
  const cacheKey = useMemo(() => 
    generateCacheKey(elementalProperties, userProperties),
  [elementalProperties, userProperties]);
  
  // Check cache first for calculations
  const cachedResults = calculationCache.get(cacheKey);
  
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
    const total = Object.values(elementalProperties)?.reduce((sum, value) => sum + value, 0);
    
    // Calculate normalized values (percentages)
    const normalizedValues: { [key: string]: number } = {};
    Object.entries(elementalProperties || {}).forEach(([element, value]) => {
      normalizedValues[element] = total > 0 ? (value / (total || 1)) * 100 : 0;
    });
    
    // Calculate dominant element
    let dominantElement = '';
    let maxValue = -Infinity;
    
    Object.entries(elementalProperties || {}).forEach(([element, value]) => {
      if (value > maxValue) {
        maxValue = value;
        dominantElement = element;
      }
    });
    
    // Calculate compatibility if userProperties is provided
    const compatibility = showComparison && userProperties 
      ? calculateElementalCompatibility(elementalProperties, userProperties)
      : null;
    
    // Sorted elements by value (descending)
    const sortedElements = Object.entries(elementalProperties)
      .sort((a, b) => b[1] - a[1])
      .map(([element]) => element);
    
    // Recommendations based on elemental properties
    let recommendations = null;
    
    if (showRecommendations) {
      const flavorProfiles: Record<string, string[]> = { Fire: ['spicy', 'bold', 'aromatic'],
        Water: ['delicate', 'refreshing', 'subtle'],
        Earth: ['hearty', 'rich', 'grounding'],
        Air: ['light', 'crisp', 'aromatic']
      };
      
      const cuisineAffinities: Record<string, string[]> = { Fire: ['Thai', 'Mexican', 'Indian'],
        Water: ['Japanese', 'Mediterranean', 'Scandinavian'],
        Earth: ['French', 'Italian', 'American'],
        Air: ['Middle Eastern', 'Greek', 'Vietnamese']
      };
      
      const wellnessProperties: Record<string, string[]> = { Fire: ['energizing', 'warming', 'stimulating'],
        Water: ['hydrating', 'calming', 'purifying'],
        Earth: ['nourishing', 'stabilizing', 'grounding'],
        Air: ['refreshing', 'clarifying', 'uplifting']
      };
      
      // Get recommendations based on dominant element
      recommendations = {
        flavorProfile: flavorProfiles[dominantElement?.toLowerCase() as keyof typeof flavorProfiles] || [],
        cuisineAffinity: cuisineAffinities[dominantElement?.toLowerCase() as keyof typeof cuisineAffinities] || [],
        wellnessProperties: wellnessProperties[dominantElement?.toLowerCase() as keyof typeof wellnessProperties] || []
      };
    }
    
    // Create the result object
    const result = {
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
  const handleToggleDetails = useCallback(() => {
    if (isMountedRef.current) {
      setShowDetails(prev => !prev);
    }
  }, []);
  
  // Render bar chart visualization - memoized
  const renderBarChart = useMemo(() => {
    const barHeight = 30;
    const barSpacing = 10;
    const chartWidth = sizeConfig.width - (sizeConfig.padding * 2);
    const chartHeight = (barHeight + barSpacing) * Object.keys(elementalProperties || {}).length;
    
    return (
      <svg 
        width={sizeConfig.width} 
        height={chartHeight + (sizeConfig.padding * 2)}
        className="elemental-bar-chart"
      >
        {Object.entries(normalizedValues || {}).map(([element, percentage], index) => {
          const numericPercentage = Number(percentage) || 0;
          const y = (index * (barHeight + barSpacing)) + sizeConfig.padding;
          const normalizedElement = element?.toLowerCase();
          
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
                width={(numericPercentage / 100) * chartWidth}
                height={barHeight}
                rx={4}
                fill={ELEMENT_COLORS[normalizedElement as keyof typeof ELEMENT_COLORS] || '#777777'}
                opacity={animated ? 0 : 1}
                className={animated ? 'elemental-bar animate-grow' : ''}
                style={animated ? { animationDelay: `${index * 100}ms` } : {}}
              />
              {/* Element label */}
              {showLabels && (
                <text
                  x={sizeConfig.padding + 10}
                  y={y + (barHeight / 2) + 5}
                  fontSize={sizeConfig.fontSize}
                  fontWeight="bold"
                  fill={styles.text}
                >
                  {element}
                </text>
              )}
              {/* Percentage label */}
              {showPercentages && (
                <text
                  x={sizeConfig.width - sizeConfig.padding - 40}
                  y={y + (barHeight / 2) + 5}
                  fontSize={sizeConfig.fontSize}
                  fontWeight="bold"
                  fill={styles.text}
                  textAnchor="end"
                >
                  {numericPercentage.toFixed(1)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  }, [normalizedValues, sizeConfig, darkMode, showLabels, showPercentages, animated, styles.text]);
  
  // Render pie chart visualization - memoized
  const renderPieChart = useMemo(() => {
    const centerX = sizeConfig.width / 2;
    const centerY = sizeConfig.height / 2;
    const radius = Math.min(centerX, centerY) - sizeConfig.padding;
    
    // Calculate slices
    let startAngle = 0;
    const slices = Object.entries(normalizedValues || {}).map(([element, percentage]) => {
      const numericPercentage = Number(percentage) || 0;
      const angle = (numericPercentage / 100) * 360;
      const endAngle = startAngle + angle;
      
      // Calculate arc path
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);
      
      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
      
      // Create slice object
      const slice = {
        element,
        percentage: numericPercentage,
        startAngle,
        endAngle,
        pathData
      };
      
      // Update start angle for next slice
      startAngle = endAngle;
      
      return slice;
    });
    
    return (
      <svg 
        width={sizeConfig.width} 
        height={sizeConfig.height}
        className="elemental-pie-chart"
      >
        {/* Render slices */}
        {(slices || []).map((slice, index) => {
          const normalizedElement = slice.element?.toLowerCase();
          const midAngle = (slice.startAngle + slice.endAngle) / 2;
          const midRad = (midAngle - 90) * (Math.PI / 180);
          
          // Calculate label position
          const labelRadius = radius * 0.7;
          const labelX = centerX + labelRadius * Math.cos(midRad);
          const labelY = centerY + labelRadius * Math.sin(midRad);
          
          return (
            <g key={slice.element}>
              {/* Pie slice */}
              <path
                d={slice.pathData}
                fill={ELEMENT_COLORS[normalizedElement as keyof typeof ELEMENT_COLORS] || '#777777'}
                stroke={styles.background}
                strokeWidth={1}
                opacity={animated ? 0 : 1}
                className={animated ? 'elemental-slice animate-fade-in' : ''}
                style={animated ? { animationDelay: `${index * 100}ms` } : {}}
              />
              
              {/* Labels (conditionally rendered) */}
              {showLabels && slice.percentage > 5 && (
                <text
                  x={labelX}
                  y={labelY}
                  fontSize={sizeConfig.fontSize}
                  fontWeight="bold"
                  fill={styles.text}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {slice.element}
                  {showPercentages && ` (${slice.percentage.toFixed(1)}%)`}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  }, [normalizedValues, sizeConfig, styles.text, styles.background, animated, showLabels, showPercentages]);
  
  // Render radar chart visualization - memoized
  const renderRadarChart = useMemo(() => {
    const centerX = sizeConfig.width / 2;
    const centerY = sizeConfig.height / 2;
    const radius = Math.min(centerX, centerY) - sizeConfig.padding;
    const elements = Object.keys(elementalProperties);
    const numPoints = (elements || []).length;
    
    // Create points on the radar
    const angleStep = (2 * Math.PI) / numPoints;
    const points = (elements || []).map((element, i) => {
      const angle = i * angleStep - Math.PI / 2; // Start from the top (subtract 90 degrees)
      const normalizedValue = (normalizedValues[element] || 0) / 100;
      
      return {
        element,
        value: normalizedValue,
        x: centerX + radius * normalizedValue * Math.cos(angle),
        y: centerY + radius * normalizedValue * Math.sin(angle),
        labelX: centerX + (radius + 20) * Math.cos(angle),
        labelY: centerY + (radius + 20) * Math.sin(angle),
        angle
      };
    });
    
    // Create the polygon points string
    const polygonPoints = (points || []).map(p => `${p.x},${p.y}`)?.join(' ');
    
    // Create the comparison polygon if applicable
    let comparisonPoints = null;
    if (showComparison && userProperties) {
      // Calculate total for normalization
      const userTotal = Object.values(userProperties)?.reduce((sum, value) => sum + value, 0);
      
      comparisonPoints = (elements || []).map((element, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const value = userProperties[element as "Fire" | "Water" | "Earth" | "Air"] || 0;
        const normalizedValue = userTotal > 0 ? value / userTotal : 0;
        
        return {
          x: centerX + radius * normalizedValue * Math.cos(angle),
          y: centerY + radius * normalizedValue * Math.sin(angle)
        };
      });
    }
    
    return (
      <svg 
        width={sizeConfig.width} 
        height={sizeConfig.height}
        className="elemental-radar-chart"
      >
        {/* Background grid */}
        {[0.25, 0.5, 0.75, 1].map((gridLevel, i) => (
          <circle
            key={`grid-${i}`}
            cx={centerX}
            cy={centerY}
            r={radius * gridLevel}
            fill="none"
            stroke={darkMode ? '#333333' : '#E0E0E0'}
            strokeWidth={1}
            strokeDasharray={darkMode ? '4 4' : ''}
          />
        ))}
        
        {/* Axis lines */}
        {(points || []).map((point, i) => (
          <line
            key={`axis-${i}`}
            x1={centerX}
            y1={centerY}
            x2={centerX + radius * Math.cos(point.angle)}
            y2={centerY + radius * Math.sin(point.angle)}
            stroke={darkMode ? '#333333' : '#E0E0E0'}
            strokeWidth={1}
          />
        ))}
        
        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(33, 150, 243, 0.3)"
          stroke="#2196F3"
          strokeWidth={2}
          opacity={animated ? 0 : 1}
          className={animated ? 'elemental-polygon animate-scale' : ''}
        />
        
        {/* Comparison polygon if applicable */}
        {comparisonPoints && (
          <polygon
            points={comparisonPoints.map(p => `${p.x},${p.y}`)?.join(' ')}
            fill="rgba(255, 87, 34, 0.3)"
            stroke="#FF5722"
            strokeWidth={2}
            strokeDasharray="5 5"
            opacity={animated ? 0 : 1}
            className={animated ? 'elemental-polygon animate-scale' : ''}
            style={{ animationDelay: '300ms' }}
          />
        )}
        
        {/* Data points */}
        {(points || []).map((point, i) => (
          <circle
            key={`point-${i}`}
            cx={point.x}
            cy={point.y}
            r={5}
            fill="#2196F3"
            opacity={animated ? 0 : 1}
            className={animated ? 'elemental-point animate-fade-in' : ''}
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
        
        {/* Labels */}
        {showLabels && (points || []).map((point, i) => {
          // Calculate anchor position based on angle
          const textAnchor = 
            point.angle > -Math.PI/4 && point.angle < Math.PI/4 ? "start" :
            point.angle > 3*Math.PI/4 || point.angle < -3*Math.PI/4 ? "end" :
            "middle";
          
          // Calculate baseline position based on angle
          const baseline = 
            point.angle > Math.PI/4 && point.angle < 3*Math.PI/4 ? "hanging" :
            point.angle > -3*Math.PI/4 && point.angle < -Math.PI/4 ? "text-top" :
            "middle";
            
          return (
            <text
              key={`label-${i}`}
              x={point.labelX}
              y={point.labelY}
              fontSize={sizeConfig.fontSize}
              fontWeight="bold"
              fill={styles.text}
              textAnchor={textAnchor}
              dominantBaseline={baseline}
            >
              {point.element}
              {showPercentages && ` (${(normalizedValues[point.element] || 0).toFixed(1)}%)`}
            </text>
          );
        })}
      </svg>
    );
  }, [elementalProperties, normalizedValues, sizeConfig, darkMode, showLabels, showPercentages, showComparison, userProperties, animated, styles.text]);
  
  // Render interactive visualization - memoized
  const renderInteractiveVisualization = useMemo(() => {
    return (
      <div className="elemental-interactive p-4" style={{ 
        width: sizeConfig.width, 
        background: styles.panel,
        borderRadius: '8px',
        boxShadow: `0 4px 8px ${styles.shadow}`,
        color: styles.text
      }}>
        <div className="flex flex-col space-y-4">
          {/* Element cards */}
          {(sortedElements || []).map(element => {
            const normalizedElement = element?.toLowerCase();
            const percentage = normalizedValues[element] || 0;
            
            return (
              <div 
                key={element}
                className="elemental-card p-3 rounded-lg transition-all duration-300 cursor-pointer hover:shadow-lg"
                style={{ 
                  background: ELEMENT_GRADIENTS[normalizedElement as keyof typeof ELEMENT_GRADIENTS] || 'linear-gradient(135deg, #777777, #333333)',
                  boxShadow: `0 2px 4px ${styles.shadow}`,
                }}
                onClick={handleToggleDetails}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">
                      {ELEMENT_ICONS[normalizedElement as keyof typeof ELEMENT_ICONS] || '🔮'}
                    </span>
                    <h3 className="font-bold text-white">{element}</h3>
                  </div>
                  <span className="font-bold text-white">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="mt-2 bg-white bg-opacity-20 rounded-full h-2">
                  <div 
                    className="h-full rounded-full bg-white"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
          
          {/* Detailed information (toggled) */}
          {showDetails && (
            <div className="mt-4 p-4 rounded-lg" style={{ background: styles.background }}>
              <h3 className="font-bold mb-2">Elemental Details</h3>
              
              {/* Dominant element */}
              <div className="mb-2">
                <span className="font-medium">Dominant Element:</span> {dominantElement}
              </div>
              
              {/* Compatibility */}
              {compatibility !== null && (
                <div className="mb-2">
                  <span className="font-medium">Compatibility:</span> {(compatibility * 100).toFixed(1)}%
                </div>
              )}
              
              {/* Recommendations */}
              {recommendations && (
                <div className="mt-4">
                  <h4 className="font-medium mb-1">Recommended Flavor Profiles:</h4>
                  <p>{recommendations.flavorProfile?.join(', ')}</p>
                  
                  <h4 className="font-medium mb-1 mt-2">Cuisine Affinities:</h4>
                  <p>{recommendations.cuisineAffinity?.join(', ')}</p>
                  
                  <h4 className="font-medium mb-1 mt-2">Wellness Properties:</h4>
                  <p>{recommendations.wellnessProperties?.join(', ')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }, [sortedElements, normalizedValues, sizeConfig, styles, showDetails, dominantElement, compatibility, recommendations, handleToggleDetails]);
  
  // Show loading state if services aren't ready
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p>Loading services...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Error: {error.message}</p>
      </div>
    );
  }
  
  // Select the right visualization to render
  const renderVisualization = () => {
    switch (visualizationType) {
      case 'bar':
        return renderBarChart;
      case 'pie':
        return renderPieChart;
      case 'radar':
        return renderRadarChart;
      case 'interactive':
        return renderInteractiveVisualization;
      default:
        return renderBarChart;
    }
  };
  
  return (
    <div 
      className={`elemental-visualizer ${className}`}
      style={{ 
        width: 'fit-content',
        color: styles.text,
        backgroundColor: styles.background,
        border: `1px solid ${styles.border}`,
        borderRadius: '8px',
        padding: `${sizeConfig.padding}px`,
        boxShadow: `0 2px 8px ${styles.shadow}`
      }}
    >
      {title && (
        <h2 className="text-center font-bold mb-4" style={{ fontSize: sizeConfig.fontSize + 4 }}>
          {title}
        </h2>
      )}
      
      {renderVisualization()}
      
      {/* Legend (if enabled) */}
      {showLegend && visualizationType !== 'interactive' && (
        <div className="elemental-legend mt-4 flex flex-wrap justify-center gap-3">
          {Object.entries(ELEMENT_COLORS || {}).map(([element, color]) => (
            <div key={element} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: color }}
              ></div>
              <span style={{ fontSize: sizeConfig.fontSize - 2 }}>
                {element.charAt(0)?.toUpperCase() + element?.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Compatibility indicator (if comparison is enabled) */}
      {showComparison && compatibility !== null && (
        <div className="mt-4 text-center">
          <div className="font-medium" style={{ fontSize: sizeConfig.fontSize }}>
            Compatibility: {(compatibility * 100).toFixed(1)}%
          </div>
          <div 
            className="mt-1 mx-auto h-2 rounded-full"
            style={{ width: '80%', backgroundColor: styles.border }}
          >
            <div 
              className="h-full rounded-full"
              style={{ 
                width: `${compatibility * 100}%`, 
                backgroundColor: compatibility > 0.7 ? '#4CAF50' : compatibility > 0.4 ? '#FFC107' : '#F44336' 
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Function to clear the calculation cache (exposed for testing)
export function clearElementalVisualizerCache(): void {
  calculationCache.clear();
}

export default React.memo(ElementalVisualizerMigrated); 