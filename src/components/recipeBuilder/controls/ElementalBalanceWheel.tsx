import React, { useState, useCallback, useEffect, SetStateAction } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Flame, 
  Droplets, 
  Mountain, 
  Wind, 
  RotateCcw, 
  Target, 
  TrendingUp,
  Zap
} from 'lucide-react';

// Types
import type { 
  RecipeBuildingCriteria 
} from '@/data/unified/recipeBuilding';
import type { 
  ElementalProperties,
  Element 
} from '@/types/alchemy';

interface ElementalBalanceWheelProps {
  criteria: Partial<RecipeBuildingCriteria>;
  onUpdate: (updates: Partial<RecipeBuildingCriteria>) => void;
  previewData?: any;
  isGenerating?: boolean;
}

// Element configurations
const ELEMENTS = [
  {
    key: 'Fire' as keyof ElementalProperties,
    label: 'Fire',
    icon: Flame,
    color: '#ef4444',
    lightColor: '#fef2f2',
    description: 'Heat, energy, transformation',
    qualities: ['Warming', 'Energizing', 'Transformative', 'Stimulating'],
    seasonalPeak: 'summer'
  },
  {
    key: 'Water' as keyof ElementalProperties,
    label: 'Water',
    icon: Droplets,
    color: '#3b82f6',
    lightColor: '#eff6ff',
    description: 'Cooling, flowing, nurturing',
    qualities: ['Cooling', 'Hydrating', 'Cleansing', 'Soothing'],
    seasonalPeak: 'winter'
  },
  {
    key: 'Earth' as keyof ElementalProperties,
    label: 'Earth',
    icon: Mountain,
    color: '#84cc16',
    lightColor: '#f7fee7',
    description: 'Grounding, stability, nourishment',
    qualities: ['Grounding', 'Stabilizing', 'Nourishing', 'Building'],
    seasonalPeak: 'autumn'
  },
  {
    key: 'Air' as keyof ElementalProperties,
    label: 'Air',
    icon: Wind,
    color: '#8b5cf6',
    lightColor: '#faf5ff',
    description: 'Lightness, movement, clarity',
    qualities: ['Lightening', 'Clarifying', 'Uplifting', 'Inspiring'],
    seasonalPeak: 'spring'
  }
];

// Preset configurations
const ELEMENTAL_PRESETS = [
  {
    name: 'Balanced',
    description: 'Equal distribution of all elements',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
  },
  {
    name: 'Fire Dominant',
    description: 'Warming and energizing recipes',
    elementalProperties: { Fire: 0.5, Water: 0.15, Earth: 0.2, Air: 0.15 }
  },
  {
    name: 'Water Dominant',
    description: 'Cooling and hydrating recipes',
    elementalProperties: { Fire: 0.15, Water: 0.5, Earth: 0.2, Air: 0.15 }
  },
  {
    name: 'Earth Dominant',
    description: 'Grounding and nourishing recipes',
    elementalProperties: { Fire: 0.15, Water: 0.2, Earth: 0.5, Air: 0.15 }
  },
  {
    name: 'Air Dominant',
    description: 'Light and uplifting recipes',
    elementalProperties: { Fire: 0.15, Water: 0.15, Earth: 0.2, Air: 0.5 }
  },
  {
    name: 'Seasonal Summer',
    description: 'Fire and Air for hot weather',
    elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.1, Air: 0.3 }
  },
  {
    name: 'Seasonal Winter',
    description: 'Earth and Water for cold weather',
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 }
  }
];

export default function ElementalBalanceWheel({ 
  criteria, 
  onUpdate, 
  previewData, 
  isGenerating 
}: ElementalBalanceWheelProps) {
  
  const [tempElements, setTempElements] = useState<ElementalProperties>(
    criteria.elementalPreference || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
  );

  // Sync with criteria when it changes externally
  useEffect(() => {
    if (criteria.elementalPreference) {
      setTempElements(criteria.elementalPreference as ElementalProperties);
    }
  }, [criteria.elementalPreference]);

  // Update element value with automatic balancing
  const updateElement = useCallback((element: keyof ElementalProperties, value: number) => {
    setTempElements(prev => {
      const newElements = { ...prev };
      const oldValue = newElements[element];
      const difference = value - oldValue;
      
      // Set the new value
      newElements[element] = Math.max(0, Math.min(1, value));
      
      // Automatically adjust other elements to maintain reasonable total
      const otherElements = ELEMENTS.filter(e => e.key !== element);
      const totalOthers = otherElements.reduce((sum, e) => sum + newElements[e.key], 0);
      
      // If total would exceed 1, proportionally reduce other elements
      const total = newElements[element] + totalOthers;
      if (total > 1) {
        const reductionFactor = (1 - newElements[element]) / totalOthers;
        otherElements.forEach(e => {
          newElements[e.key] *= reductionFactor;
        });
      }
      
      return newElements;
    });
  }, []);

  // Apply preset configuration
  const applyPreset = useCallback((preset: typeof ELEMENTAL_PRESETS[0]) => {
    setTempElements(preset.elementalProperties);
    onUpdate({ elementalPreference: preset.elementalProperties });
  }, [onUpdate]);

  // Reset to balanced
  const resetToBalanced = useCallback(() => {
    const balanced = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    setTempElements(balanced);
    onUpdate({ elementalPreference: balanced });
  }, [onUpdate]);

  // Commit changes to criteria
  const commitChanges = useCallback(() => {
    onUpdate({ elementalPreference: tempElements });
  }, [tempElements, onUpdate]);

  // Get dominant element
  const getDominantElement = useCallback(() => {
    return ELEMENTS.reduce((dominant, element) => 
      tempElements[element.key] > tempElements[dominant.key] ? element : dominant
    );
  }, [tempElements]);

  // Calculate element percentages
  const getElementPercentage = (element: keyof ElementalProperties) => {
    return Math.round(tempElements[element] * 100);
  };

  // Calculate total percentage
  const getTotalPercentage = () => {
    return Math.round(Object.values(tempElements).reduce((sum, value) => sum + value, 0) * 100);
  };

  const dominantElement = getDominantElement();
  const totalPercentage = getTotalPercentage();

  return (
    <div className="space-y-6">
      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Elemental Presets
          </CardTitle>
          <p className="text-sm text-gray-600">
            Quick configurations for different recipe types
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ELEMENTAL_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="p-3 text-left border-2 border-gray-200 rounded-lg hover:border-amber-300 transition-all"
              >
                <div className="font-medium text-sm">{preset.name}</div>
                <div className="text-xs text-gray-500 mt-1">{preset.description}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Wheel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Element Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Elemental Balance
            </CardTitle>
            <p className="text-sm text-gray-600">
              Adjust the elemental properties for your recipe
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {ELEMENTS.map((element) => {
              const Icon = element.icon;
              const percentage = getElementPercentage(element.key);
              const isDominant = dominantElement.key === element.key;
              
              return (
                <div key={element.key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: element.lightColor }}
                      >
                        <Icon 
                          className="w-5 h-5" 
                          style={{ color: element.color }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{element.label}</span>
                          {isDominant && (
                            <Badge className="text-xs">Dominant</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{element.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-lg font-bold">{percentage}%</div>
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={tempElements[element.key]}
                      onChange={(e) => updateElement(element.key, parseFloat(e.target.value))}
                      onMouseUp={commitChanges}
                      onTouchEnd={commitChanges}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${element.color} 0%, ${element.color} ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
                      }}
                    />
                    
                    {/* Qualities */}
                    <div className="flex flex-wrap gap-1">
                      {element.qualities.map((quality) => (
                        <Badge 
                          key={quality}
                          variant="secondary"
                          className="text-xs"
                        >
                          {quality}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            <Separator />

            {/* Total and Actions */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Percentage</div>
                <div className={`font-mono text-lg font-bold ${
                  totalPercentage > 105 ? 'text-red-600' : 
                  totalPercentage < 95 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {totalPercentage}%
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={resetToBalanced}
                disabled={isGenerating}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Balance
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Visual Representation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Visual Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Circular Chart */}
            <div className="relative w-64 h-64 mx-auto mb-6">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                {ELEMENTS.map((element, index) => {
                  const percentage = tempElements[element.key];
                  const angle = (percentage * 360);
                  const startAngle = ELEMENTS.slice(0, index).reduce((sum, e) => sum + tempElements[e.key] * 360, 0);
                  
                  if (percentage === 0) return null;
                  
                  const x1 = 100 + 80 * Math.cos(startAngle * Math.PI / 180);
                  const y1 = 100 + 80 * Math.sin(startAngle * Math.PI / 180);
                  const x2 = 100 + 80 * Math.cos((startAngle + angle) * Math.PI / 180);
                  const y2 = 100 + 80 * Math.sin((startAngle + angle) * Math.PI / 180);
                  
                  const largeArcFlag = angle > 180 ? 1 : 0;
                  
                  return (
                    <path
                      key={element.key}
                      d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={element.color}
                      opacity={0.8}
                      className="transition-all duration-300"
                    />
                  );
                })}
                <circle cx="100" cy="100" r="30" fill="white" className="drop-shadow-sm" />
                <text x="100" y="100" textAnchor="middle" dy="0.3em" className="text-xs font-medium fill-gray-700">
                  Balance
                </text>
              </svg>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-3">
              {ELEMENTS.map((element) => {
                const Icon = element.icon;
                return (
                  <div key={element.key} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: element.color }}
                    />
                    <span className="text-sm">{element.label}</span>
                    <span className="text-sm text-gray-500 ml-auto">
                      {getElementPercentage(element.key)}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Dominant Element Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <dominantElement.icon 
                  className="w-5 h-5" 
                  style={{ color: dominantElement.color }}
                />
                <span className="font-medium">Dominant: {dominantElement.label}</span>
              </div>
              <p className="text-sm text-gray-600">{dominantElement.description}</p>
              <div className="text-xs text-gray-500 mt-1">
                Peak season: {dominantElement.seasonalPeak}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-medium text-blue-900 mb-3">Elemental Balance Tips</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <strong>Fire recipes:</strong> Spicy, grilled, roasted foods. Great for cold weather or when you need energy.
            </div>
            <div>
              <strong>Water recipes:</strong> Cooling, hydrating dishes. Perfect for hot weather or inflammation.
            </div>
            <div>
              <strong>Earth recipes:</strong> Hearty, grounding meals. Ideal for stability and nourishment.
            </div>
            <div>
              <strong>Air recipes:</strong> Light, fresh dishes. Best for mental clarity and digestion.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}