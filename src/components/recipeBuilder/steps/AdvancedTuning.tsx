import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Target, 
  Zap, 
  BarChart3, 
  Moon, 
  Sun, 
  RotateCcw,
  TrendingUp,
  Activity,
  Compass
} from 'lucide-react';

// Types
import type { 
  RecipeBuildingCriteria 
} from '@/data/unified/recipeBuilding';
import type { 
  PlanetName, 
  LunarPhase, 
  ZodiacSign 
} from '@/types/alchemy';

interface AdvancedTuningProps {
  criteria: Partial<RecipeBuildingCriteria>;
  onUpdate: (updates: Partial<RecipeBuildingCriteria>) => void;
  previewData?: any;
  isGenerating?: boolean;
}

// Monica optimization presets
const MONICA_PRESETS = [
  { value: 0.5, label: 'Gentle', description: 'Minimal transformation, preserves natural flavors' },
  { value: 1.0, label: 'Balanced', description: 'Perfect harmony of technique and ingredients' },
  { value: 1.5, label: 'Enhanced', description: 'Elevated techniques, refined results' },
  { value: 2.0, label: 'Intense', description: 'Maximum transformation, complex flavors' }
];

// Kalchm targeting
const KALCHM_RANGES = [
  { min: 0.5, max: 1.0, label: 'Simple', description: 'Basic combinations, easy harmony' },
  { min: 1.0, max: 2.0, label: 'Moderate', description: 'Balanced complexity, good variety' },
  { min: 2.0, max: 3.0, label: 'Complex', description: 'Rich combinations, multiple layers' },
  { min: 3.0, max: 5.0, label: 'Advanced', description: 'Sophisticated harmony, expert level' }
];

// Planetary hours (simplified)
const PLANETARY_HOURS = [
  { planet: 'Sun' as PlanetName, element: 'Fire', energy: 'Vitality, leadership, confidence' },
  { planet: 'Moon' as PlanetName, element: 'Water', energy: 'Intuition, emotions, nurturing' },
  { planet: 'Mercury' as PlanetName, element: 'Air', energy: 'Communication, learning, adaptability' },
  { planet: 'Venus' as PlanetName, element: 'Earth', energy: 'Love, beauty, harmony' },
  { planet: 'Mars' as PlanetName, element: 'Fire', energy: 'Action, courage, strength' },
  { planet: 'Jupiter' as PlanetName, element: 'Air', energy: 'Expansion, wisdom, abundance' },
  { planet: 'Saturn' as PlanetName, element: 'Earth', energy: 'Structure, discipline, patience' }
];

// Lunar phases
const LUNAR_PHASES = [
  { phase: 'new', label: 'New Moon', energy: 'New beginnings, fresh starts' },
  { phase: 'waxing', label: 'Waxing Moon', energy: 'Growth, building, accumulation' },
  { phase: 'full', label: 'Full Moon', energy: 'Peak energy, culmination, abundance' },
  { phase: 'waning', label: 'Waning Moon', energy: 'Release, cleansing, reduction' }
];

// Innovation vs tradition slider
const INNOVATION_LEVELS = [
  { value: 0, label: 'Traditional', description: 'Classic recipes, time-tested methods' },
  { value: 0.25, label: 'Contemporary', description: 'Modern twists on classics' },
  { value: 0.5, label: 'Innovative', description: 'Creative combinations, new techniques' },
  { value: 0.75, label: 'Experimental', description: 'Cutting-edge, molecular gastronomy' },
  { value: 1, label: 'Revolutionary', description: 'Completely new concepts' }
];

export default function AdvancedTuning({ 
  criteria, 
  onUpdate, 
  previewData, 
  isGenerating 
}: AdvancedTuningProps) {
  
  const [advancedMode, setAdvancedMode] = useState(false);
  const [useAstrological, setUseAstrological] = useState(false);

  // Handle Monica optimization
  const setMonicaTarget = useCallback((value: number) => {
    onUpdate({ targetMonica: value });
  }, [onUpdate]);

  // Handle Kalchm targeting
  const setKalchmRange = useCallback((min: number, max: number) => {
    const target = (min + max) / 2;
    const tolerance = (max - min) / 2;
    onUpdate({ 
      targetKalchm: target,
      kalchmTolerance: tolerance 
    });
  }, [onUpdate]);

  // Handle planetary hour selection
  const setPlanetaryHour = useCallback((planet: PlanetName) => {
    onUpdate({ planetaryHour: planet });
  }, [onUpdate]);

  // Handle lunar phase selection
  const setLunarPhase = useCallback((phase: string) => {
    onUpdate({ lunarPhase: phase as LunarPhase });
  }, [onUpdate]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    onUpdate({
      targetMonica: 1.0,
      targetKalchm: 1.5,
      kalchmTolerance: 0.3,
      planetaryHour: undefined,
      lunarPhase: undefined
    });
  }, [onUpdate]);

  const currentMonica = criteria.targetMonica || 1.0;
  const currentKalchm = criteria.targetKalchm || 1.5;
  const currentTolerance = criteria.kalchmTolerance || 0.3;

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-purple-900 mb-2">
                Advanced Alchemical Tuning
              </h3>
              <p className="text-sm text-purple-700">
                Fine-tune the mathematical precision and cosmic alignment of your recipe
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={advancedMode ? "default" : "outline"}
                onClick={() => setAdvancedMode(!advancedMode)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Advanced Mode
              </Button>
              <Button
                variant={useAstrological ? "default" : "outline"}
                onClick={() => setUseAstrological(!useAstrological)}
              >
                <Moon className="w-4 h-4 mr-2" />
                Astrological
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monica Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            Monica Constant Optimization
          </CardTitle>
          <p className="text-sm text-gray-600">
            Control the precision and mathematical harmony of cooking techniques
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Monica Value Display */}
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-amber-600 mb-2">
              {currentMonica.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              Current Monica Target
            </div>
          </div>

          {/* Monica Presets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MONICA_PRESETS.map((preset) => {
              const isSelected = Math.abs(currentMonica - preset.value) < 0.1;
              
              return (
                <button
                  key={preset.value}
                  onClick={() => setMonicaTarget(preset.value)}
                  className={`p-3 text-left border-2 rounded-lg transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{preset.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{preset.description}</div>
                  <div className="text-xs font-mono text-amber-600 mt-2">
                    {preset.value.toFixed(1)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Monica Slider */}
          {advancedMode && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Custom Monica Value</label>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={currentMonica}
                onChange={(e) => setMonicaTarget(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-amber-200 to-amber-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Gentle (0.1)</span>
                <span>Moderate (1.5)</span>
                <span>Intense (3.0)</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kalchm Targeting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Kalchm Complexity Targeting
          </CardTitle>
          <p className="text-sm text-gray-600">
            Set the desired complexity and harmony range for ingredient combinations
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Range Display */}
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-green-600 mb-2">
              {(currentKalchm - currentTolerance).toFixed(1)} - {(currentKalchm + currentTolerance).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              Kalchm Target Range
            </div>
          </div>

          {/* Kalchm Presets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {KALCHM_RANGES.map((range) => {
              const isInRange = currentKalchm >= range.min && currentKalchm <= range.max;
              
              return (
                <button
                  key={range.label}
                  onClick={() => setKalchmRange(range.min, range.max)}
                  className={`p-3 text-left border-2 rounded-lg transition-all ${
                    isInRange
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{range.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{range.description}</div>
                  <div className="text-xs font-mono text-green-600 mt-2">
                    {range.min.toFixed(1)} - {range.max.toFixed(1)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Kalchm Controls */}
          {advancedMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-sm font-medium">Target Kalchm</label>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={currentKalchm}
                  onChange={(e) => onUpdate({ targetKalchm: parseFloat(e.target.value) })}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-green-200 to-green-600"
                />
                <div className="text-center text-sm font-mono">{currentKalchm.toFixed(1)}</div>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium">Tolerance</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={currentTolerance}
                  onChange={(e) => onUpdate({ kalchmTolerance: parseFloat(e.target.value) })}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-blue-200 to-blue-600"
                />
                <div className="text-center text-sm font-mono">±{currentTolerance.toFixed(2)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Astrological Timing */}
      {useAstrological && (
        <>
          {/* Planetary Hour Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-600" />
                Planetary Hour Selection
              </CardTitle>
              <p className="text-sm text-gray-600">
                Choose the planetary energy to infuse into your recipe
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {PLANETARY_HOURS.map((planetary) => {
                  const isSelected = criteria.planetaryHour === planetary.planet;
                  
                  return (
                    <button
                      key={planetary.planet}
                      onClick={() => setPlanetaryHour(planetary.planet)}
                      className={`p-3 text-left border-2 rounded-lg transition-all ${
                        isSelected
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{planetary.planet}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Element: {planetary.element}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {planetary.energy}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Lunar Phase Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-blue-600" />
                Lunar Phase Timing
              </CardTitle>
              <p className="text-sm text-gray-600">
                Align your cooking with the lunar cycle
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {LUNAR_PHASES.map((lunar) => {
                  const isSelected = criteria.lunarPhase === lunar.phase;
                  
                  return (
                    <button
                      key={lunar.phase}
                      onClick={() => setLunarPhase(lunar.phase)}
                      className={`p-3 text-center border-2 rounded-lg transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{lunar.label}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {lunar.energy}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Nutritional Focus */}
      {advancedMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Nutritional Optimization
            </CardTitle>
            <p className="text-sm text-gray-600">
              Focus on specific nutritional goals
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'energy', label: 'High Energy', description: 'Boost vitality' },
                { id: 'recovery', label: 'Recovery', description: 'Post-workout nutrition' },
                { id: 'brain', label: 'Mental Clarity', description: 'Cognitive support' },
                { id: 'immunity', label: 'Immune Support', description: 'Strengthen defenses' },
                { id: 'digestion', label: 'Digestive Health', description: 'Gut-friendly' },
                { id: 'anti-inflammatory', label: 'Anti-Inflammatory', description: 'Reduce inflammation' }
              ].map((focus) => (
                <button
                  key={focus.id}
                  className="p-3 text-left border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-all"
                >
                  <div className="font-medium text-sm">{focus.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{focus.description}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Control Panel */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-gray-600">Monica: </span>
                <span className="font-mono font-medium">{currentMonica.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">Kalchm: </span>
                <span className="font-mono font-medium">
                  {(currentKalchm - currentTolerance).toFixed(1)}-{(currentKalchm + currentTolerance).toFixed(1)}
                </span>
              </div>
              {criteria.planetaryHour && (
                <div>
                  <span className="text-gray-600">Planet: </span>
                  <span className="font-medium">{criteria.planetaryHour}</span>
                </div>
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={resetToDefaults}
              disabled={isGenerating}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}