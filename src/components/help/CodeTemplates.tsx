import React, { useState } from 'react';

import { Tooltip } from './ContextualHelp';

interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'component' | 'service' | 'utility' | 'test' | 'hook' | 'type';
  template: string;
  placeholders: { [key: string]: string };
  dependencies?: string[];
}

const CODE_TEMPLATES: CodeTemplate[] = [
  {
    id: 'astrological-component',
    name: 'Astrological React Component',
    description: 'Template for React component with astrological context integration',
    category: 'component',
    template: `import React, { useContext, useEffect, useState } from 'react';
import { AstrologicalContext } from '@/contexts/AstrologicalContext';
import { ElementalProperties } from '@/types/elemental';

interface {{COMPONENT_NAME}}Props {
  {{PROP_NAME}}: {{PROP_TYPE}};
  className?: string;
  onElementalChange?: (elements: ElementalProperties) => void;
}

export const {{COMPONENT_NAME}}: React.FC<{{COMPONENT_NAME}}Props> = ({
  {{PROP_NAME}},
  className = '',
  onElementalChange
}) => {
  const { planetaryPositions, currentElements } = useContext(AstrologicalContext);
  const [localElements, setLocalElements] = useState<ElementalProperties>({
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0
  });

  useEffect(() => {
    // Calculate elemental influences based on current planetary positions
    const influences = calculateElementalInfluences(planetaryPositions);
    setLocalElements(influences);
    onElementalChange?.(influences);
  }, [planetaryPositions, onElementalChange]);

  const handleElementalUpdate = (newElements: ElementalProperties) => {
    setLocalElements(newElements);
    onElementalChange?.(newElements);
  };

  return (
    <div className={\`{{COMPONENT_NAME.toLowerCase()}}-container \${className}\`}>
      <div className="elemental-display">
        {Object.entries(localElements).map(([element, value]) => (
          <div key={element} className={\`element-\${element.toLowerCase()}\`}>
            <span className="element-name">{element}</span>
            <span className="element-value">{value.toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      {/* Component-specific content */}
      <div className="content">
        {{COMPONENT_CONTENT}}
      </div>
    </div>
  );
};

// Helper function for elemental calculations
function calculateElementalInfluences(positions: any): ElementalProperties {
  // Implementation based on planetary positions
  return {
    Fire: (positions.Sun?.degree || 0) / 30 * 0.3 + (positions.Mars?.degree || 0) / 30 * 0.2,
    Water: (positions.Moon?.degree || 0) / 30 * 0.3 + (positions.Neptune?.degree || 0) / 30 * 0.1,
    Earth: (positions.Saturn?.degree || 0) / 30 * 0.2 + (positions.Venus?.degree || 0) / 30 * 0.2,
    Air: (positions.Mercury?.degree || 0) / 30 * 0.2 + (positions.Uranus?.degree || 0) / 30 * 0.1
  };
}`,
    placeholders: {
      'COMPONENT_NAME': 'Component name (e.g., ElementalDisplay)',
      'PROP_NAME': 'Main prop name (e.g., ingredients)',
      'PROP_TYPE': 'Prop type (e.g., Ingredient[])',
      'COMPONENT_CONTENT': 'Component-specific JSX content'
    },
    dependencies: ['@/contexts/AstrologicalContext', '@/types/elemental']
  },
  {
    id: 'astrological-service',
    name: 'Astrological Service Class',
    description: 'Template for service class with astrological calculations',
    category: 'service',
    template: `import { getReliablePlanetaryPositions } from '@/utils/reliableAstronomy';
import { ElementalProperties } from '@/types/elemental';
import { ZodiacSign } from '@/types/astrological';

export class {{SERVICE_NAME}} {
  private cache = new Map<string, any>();
  private cacheTimeout = 6 * 60 * 60 * 1000; // 6 hours

  async {{METHOD_NAME}}({{PARAMETERS}}): Promise<{{RETURN_TYPE}}> {
    const cacheKey = \`{{METHOD_NAME}}-\${JSON.stringify(arguments)}\`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const positions = await getReliablePlanetaryPositions();
      const result = await this.calculate{{CALCULATION_TYPE}}(positions, {{PARAMETERS}});
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('{{SERVICE_NAME}} calculation failed:', error);
      return this.getFallback{{CALCULATION_TYPE}}({{PARAMETERS}});
    }
  }

  private async calculate{{CALCULATION_TYPE}}(
    positions: any,
    {{PARAMETERS}}
  ): Promise<{{RETURN_TYPE}}> {
    // Implement astrological calculation logic
    const elementalInfluences: ElementalProperties = {
      Fire: this.calculateFireInfluence(positions),
      Water: this.calculateWaterInfluence(positions),
      Earth: this.calculateEarthInfluence(positions),
      Air: this.calculateAirInfluence(positions)
    };

    return {
      elements: elementalInfluences,
      timestamp: new Date(),
      reliability: this.calculateReliability(positions)
    } as {{RETURN_TYPE}};
  }

  private calculateFireInfluence(positions: any): number {
    // Fire signs: aries, leo, sagittarius
    const fireInfluence = 
      (positions.Sun?.sign === 'aries' || positions.Sun?.sign === 'leo' || positions.Sun?.sign === 'sagittarius' ? 0.3 : 0) +
      (positions.Mars?.degree || 0) / 30 * 0.2;
    
    return Math.min(1.0, fireInfluence);
  }

  private calculateWaterInfluence(positions: any): number {
    // Water signs: cancer, scorpio, pisces
    const waterInfluence = 
      (positions.Moon?.sign === 'cancer' || positions.Moon?.sign === 'scorpio' || positions.Moon?.sign === 'pisces' ? 0.3 : 0) +
      (positions.Neptune?.degree || 0) / 30 * 0.1;
    
    return Math.min(1.0, waterInfluence);
  }

  private calculateEarthInfluence(positions: any): number {
    // Earth signs: taurus, virgo, capricorn
    const earthInfluence = 
      (positions.Venus?.sign === 'taurus' || positions.Venus?.sign === 'virgo' || positions.Venus?.sign === 'capricorn' ? 0.2 : 0) +
      (positions.Saturn?.degree || 0) / 30 * 0.2;
    
    return Math.min(1.0, earthInfluence);
  }

  private calculateAirInfluence(positions: any): number {
    // Air signs: gemini, libra, aquarius
    const airInfluence = 
      (positions.Mercury?.sign === 'gemini' || positions.Mercury?.sign === 'libra' || positions.Mercury?.sign === 'aquarius' ? 0.2 : 0) +
      (positions.Uranus?.degree || 0) / 30 * 0.1;
    
    return Math.min(1.0, airInfluence);
  }

  private calculateReliability(positions: any): number {
    // Calculate reliability based on data freshness and source
    const hasRecentData = positions.timestamp && 
      (Date.now() - new Date(positions.timestamp).getTime()) < this.cacheTimeout;
    
    return hasRecentData ? 0.9 : 0.7;
  }

  private getFallback{{CALCULATION_TYPE}}({{PARAMETERS}}): {{RETURN_TYPE}} {
    // Fallback implementation using cached or default values
    return {
      elements: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      },
      timestamp: new Date(),
      reliability: 0.5
    } as {{RETURN_TYPE}};
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}`,
    placeholders: {
      'SERVICE_NAME': 'Service class name (e.g., ElementalCalculationService)',
      'METHOD_NAME': 'Main method name (e.g., calculateElementalBalance)',
      'PARAMETERS': 'Method parameters (e.g., ingredients: Ingredient[])',
      'RETURN_TYPE': 'Return type (e.g., ElementalAnalysis)',
      'CALCULATION_TYPE': 'Calculation type (e.g., ElementalBalance)'
    },
    dependencies: ['@/utils/reliableAstronomy', '@/types/elemental', '@/types/astrological']
  },
  {
    id: 'astrological-hook',
    name: 'Astrological React Hook',
    description: 'Template for custom React hook with astrological state management',
    category: 'hook',
    template: `import { useState, useEffect, useCallback, useContext } from 'react';
import { AstrologicalContext } from '@/contexts/AstrologicalContext';
import { ElementalProperties } from '@/types/elemental';

interface {{HOOK_NAME}}Options {
  refreshInterval?: number;
  enableCache?: boolean;
  fallbackEnabled?: boolean;
}

interface {{HOOK_NAME}}Result {
  {{RESULT_PROPERTY}}: {{RESULT_TYPE}};
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export function {{HOOK_NAME}}(
  {{PARAMETERS}},
  options: {{HOOK_NAME}}Options = {}
): {{HOOK_NAME}}Result {
  const {
    refreshInterval = 30000, // 30 seconds
    enableCache = true,
    fallbackEnabled = true
  } = options;

  const { planetaryPositions, isLoading: astroLoading } = useContext(AstrologicalContext);
  const [{{RESULT_PROPERTY}}, set{{RESULT_PROPERTY}}] = useState<{{RESULT_TYPE}} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const calculate{{CALCULATION_NAME}} = useCallback(async (): Promise<{{RESULT_TYPE}}> => {
    if (!planetaryPositions) {
      throw new Error('Planetary positions not available');
    }

    // Implement astrological calculation
    const result: {{RESULT_TYPE}} = {
      elements: calculateElementalInfluences(planetaryPositions),
      planetaryFactors: extractPlanetaryFactors(planetaryPositions),
      confidence: calculateConfidence(planetaryPositions),
      timestamp: new Date()
    };

    return result;
  }, [planetaryPositions, {{PARAMETERS}}]);

  const refresh = useCallback(async () => {
    if (astroLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await calculate{{CALCULATION_NAME}}();
      set{{RESULT_PROPERTY}}(result);
      setLastUpdated(new Date());
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      if (fallbackEnabled) {
        // Use fallback calculation
        const fallback = getFallback{{CALCULATION_NAME}}();
        set{{RESULT_PROPERTY}}(fallback);
        setLastUpdated(new Date());
      }
    } finally {
      setIsLoading(false);
    }
  }, [calculate{{CALCULATION_NAME}}, astroLoading, fallbackEnabled]);

  // Initial load and periodic refresh
  useEffect(() => {
    refresh();
    
    if (refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refresh, refreshInterval]);

  // Refresh when planetary positions change
  useEffect(() => {
    if (planetaryPositions && !astroLoading) {
      refresh();
    }
  }, [planetaryPositions, astroLoading, refresh]);

  return {
    {{RESULT_PROPERTY}}: {{RESULT_PROPERTY}},
    isLoading: isLoading || astroLoading,
    error,
    refresh,
    lastUpdated
  };
}

// Helper functions
function calculateElementalInfluences(positions: any): ElementalProperties {
  return {
    Fire: Math.min(1.0, (positions.Sun?.degree || 0) / 30 * 0.3 + (positions.Mars?.degree || 0) / 30 * 0.2),
    Water: Math.min(1.0, (positions.Moon?.degree || 0) / 30 * 0.3 + (positions.Neptune?.degree || 0) / 30 * 0.1),
    Earth: Math.min(1.0, (positions.Saturn?.degree || 0) / 30 * 0.2 + (positions.Venus?.degree || 0) / 30 * 0.2),
    Air: Math.min(1.0, (positions.Mercury?.degree || 0) / 30 * 0.2 + (positions.Uranus?.degree || 0) / 30 * 0.1)
  };
}

function extractPlanetaryFactors(positions: any): Record<string, number> {
  return {
    solarInfluence: positions.Sun?.degree || 0,
    lunarInfluence: positions.Moon?.degree || 0,
    mercuryInfluence: positions.Mercury?.degree || 0,
    venusInfluence: positions.Venus?.degree || 0,
    marsInfluence: positions.Mars?.degree || 0
  };
}

function calculateConfidence(positions: any): number {
  // Calculate confidence based on data quality and recency
  const hasAllPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].every(
    planet => positions[planet] && typeof positions[planet].degree === 'number'
  );
  
  return hasAllPlanets ? 0.9 : 0.7;
}

function getFallback{{CALCULATION_NAME}}(): {{RESULT_TYPE}} {
  return {
    elements: {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    },
    planetaryFactors: {
      solarInfluence: 15,
      lunarInfluence: 15,
      mercuryInfluence: 15,
      venusInfluence: 15,
      marsInfluence: 15
    },
    confidence: 0.5,
    timestamp: new Date()
  };
}`,
    placeholders: {
      'HOOK_NAME': 'Hook name (e.g., useElementalBalance)',
      'PARAMETERS': 'Hook parameters (e.g., ingredients: Ingredient[])',
      'RESULT_PROPERTY': 'Result property name (e.g., elementalBalance)',
      'RESULT_TYPE': 'Result type (e.g., ElementalAnalysis)',
      'CALCULATION_NAME': 'Calculation name (e.g., ElementalBalance)'
    },
    dependencies: ['@/contexts/AstrologicalContext', '@/types/elemental']
  },
  {
    id: 'astrological-test',
    name: 'Astrological Test Suite',
    description: 'Template for testing astrological calculations with proper validation',
    category: 'test',
    template: `import { {{FUNCTION_NAME}} } from '../{{MODULE_NAME}}';
import { ElementalProperties } from '@/types/elemental';

// Mock planetary positions for consistent testing
const mockPlanetaryPositions = {
  Sun: { sign: 'aries' as const, degree: 15, exactLongitude: 15, isRetrograde: false },
  Moon: { sign: 'cancer' as const, degree: 10, exactLongitude: 100, isRetrograde: false },
  Mercury: { sign: 'gemini' as const, degree: 20, exactLongitude: 80, isRetrograde: false },
  Venus: { sign: 'taurus' as const, degree: 25, exactLongitude: 55, isRetrograde: false },
  Mars: { sign: 'leo' as const, degree: 5, exactLongitude: 125, isRetrograde: false }
};

describe('{{FUNCTION_NAME}}', () => {
  beforeEach(() => {
    // Reset any global state or mocks
    jest.clearAllMocks();
  });

  describe('elemental calculations', () => {
    test('calculates elemental properties correctly', () => {
      const result = {{FUNCTION_NAME}}({{TEST_PARAMETERS}});
      
      expect(result).toBeDefined();
      expect(result.elements).toBeDefined();
      
      // Validate elemental properties structure
      const elements = result.elements as ElementalProperties;
      expect(elements).toHaveProperty('Fire');
      expect(elements).toHaveProperty('Water');
      expect(elements).toHaveProperty('Earth');
      expect(elements).toHaveProperty('Air');
      
      // Validate elemental values are within valid range
      Object.values(elements).forEach(value => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });

    test('follows self-reinforcement principle', () => {
      const fireIngredient = { elements: { Fire: 0.8, Water: 0.1, Earth: 0.1, Air: 0.0 } };
      const otherFireIngredient = { elements: { Fire: 0.7, Water: 0.2, Earth: 0.1, Air: 0.0 } };
      
      const compatibility = {{FUNCTION_NAME}}(fireIngredient, otherFireIngredient);
      
      // Same elements should have high compatibility (≥0.9)
      expect(compatibility).toBeGreaterThanOrEqual(0.9);
    });

    test('maintains minimum compatibility of 0.7', () => {
      const fireIngredient = { elements: { Fire: 1.0, Water: 0.0, Earth: 0.0, Air: 0.0 } };
      const waterIngredient = { elements: { Fire: 0.0, Water: 1.0, Earth: 0.0, Air: 0.0 } };
      
      const compatibility = {{FUNCTION_NAME}}(fireIngredient, waterIngredient);
      
      // No opposing elements - all combinations should be ≥0.7
      expect(compatibility).toBeGreaterThanOrEqual(0.7);
    });
  });

  describe('planetary position validation', () => {
    test('validates zodiac signs use lowercase', () => {
      const positions = mockPlanetaryPositions;
      
      Object.values(positions).forEach(position => {
        expect(position.sign).toMatch(/^[a-z]+$/);
        expect(['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'])
          .toContain(position.sign);
      });
    });

    test('handles retrograde planets correctly', () => {
      const retrogradePositions = {
        ...mockPlanetaryPositions,
        Mercury: { ...mockPlanetaryPositions.Mercury, isRetrograde: true }
      };
      
      const result = {{FUNCTION_NAME}}(retrogradePositions);
      
      // Retrograde should affect calculations but not break them
      expect(result).toBeDefined();
      expect(result.confidence).toBeLessThan(1.0);
    });
  });

  describe('error handling and fallbacks', () => {
    test('handles missing planetary data gracefully', () => {
      const incompletePlanets = {
        Sun: mockPlanetaryPositions.Sun
        // Missing other planets
      };
      
      const result = {{FUNCTION_NAME}}(incompletePlanets);
      
      expect(result).toBeDefined();
      expect(result.confidence).toBeLessThan(0.9); // Lower confidence for incomplete data
    });

    test('provides fallback values when calculations fail', () => {
      // Test with invalid data
      const invalidData = null;
      
      const result = {{FUNCTION_NAME}}(invalidData);
      
      expect(result).toBeDefined();
      expect(result.elements).toBeDefined();
      expect(result.confidence).toBeLessThanOrEqual(0.5); // Fallback confidence
    });
  });

  describe('performance requirements', () => {
    test('completes calculations within 2 seconds', async () => {
      const startTime = Date.now();
      
      await {{FUNCTION_NAME}}({{TEST_PARAMETERS}});
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(2000);
    });

    test('handles large datasets efficiently', () => {
      const largeDataset = Array(1000).fill(mockPlanetaryPositions);
      
      const startTime = Date.now();
      largeDataset.forEach(data => {{FUNCTION_NAME}}(data));
      const duration = Date.now() - startTime;
      
      // Should process 1000 items in reasonable time
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('casing convention compliance', () => {
    test('uses proper element casing (Fire, Water, Earth, Air)', () => {
      const result = {{FUNCTION_NAME}}({{TEST_PARAMETERS}});
      
      if (result.elements) {
        expect(result.elements).toHaveProperty('Fire');
        expect(result.elements).toHaveProperty('Water');
        expect(result.elements).toHaveProperty('Earth');
        expect(result.elements).toHaveProperty('Air');
        
        // Should not have lowercase variants
        expect(result.elements).not.toHaveProperty('fire');
        expect(result.elements).not.toHaveProperty('water');
      }
    });

    test('uses proper zodiac sign casing (lowercase)', () => {
      const positions = mockPlanetaryPositions;
      
      Object.values(positions).forEach(position => {
        expect(position.sign).toMatch(/^[a-z]+$/);
      });
    });
  });
});`,
    placeholders: {
      'FUNCTION_NAME': 'Function being tested (e.g., calculateElementalCompatibility)',
      'MODULE_NAME': 'Module file name (e.g., elementalUtils)',
      'TEST_PARAMETERS': 'Test parameters (e.g., mockPlanetaryPositions)'
    },
    dependencies: ['@/types/elemental', '@/types/astrological']
  }
];

interface CodeTemplatesProps {
  onInsertTemplate?: (template: string) => void;
  filterCategory?: CodeTemplate['category'];
  className?: string;
}

export const CodeTemplates: React.FC<CodeTemplatesProps> = ({
  onInsertTemplate,
  filterCategory,
  className = ''
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate | null>(null);
  const [placeholderValues, setPlaceholderValues] = useState<{ [key: string]: string }>({});
  const [selectedCategory, setSelectedCategory] = useState<CodeTemplate['category'] | 'all'>(
    filterCategory || 'all'
  );

  const filteredTemplates = selectedCategory === 'all' 
    ? CODE_TEMPLATES 
    : CODE_TEMPLATES.filter(t => t.category === selectedCategory);

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'component', label: 'Components' },
    { value: 'service', label: 'Services' },
    { value: 'utility', label: 'Utilities' },
    { value: 'test', label: 'Tests' },
    { value: 'hook', label: 'Hooks' },
    { value: 'type', label: 'Types' }
  ];

  const generateCode = (template: CodeTemplate): string => {
    let code = template.template;
    
    Object.entries(placeholderValues).forEach(([placeholder, value]) => {
      const regex = new RegExp(`{{${placeholder}}}`, 'g');
      code = code.replace(regex, value || `[${placeholder}]`);
    });
    
    return code;
  };

  const handleInsertTemplate = () => {
    if (selectedTemplate && onInsertTemplate) {
      const code = generateCode(selectedTemplate);
      onInsertTemplate(code);
      setSelectedTemplate(null);
      setPlaceholderValues({});
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Astrological Code Templates
        </h3>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Available Templates</h4>
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedTemplate?.id === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setSelectedTemplate(template);
                setPlaceholderValues({});
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">{template.name}</h5>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  template.category === 'component' ? 'bg-blue-100 text-blue-800' :
                  template.category === 'service' ? 'bg-green-100 text-green-800' :
                  template.category === 'utility' ? 'bg-yellow-100 text-yellow-800' :
                  template.category === 'test' ? 'bg-red-100 text-red-800' :
                  template.category === 'hook' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {template.category}
                </span>
              </div>
              
              {template.dependencies && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    Dependencies: {template.dependencies.join(', ')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {selectedTemplate && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Configure Template</h4>
              
              <div className="space-y-3">
                {Object.entries(selectedTemplate.placeholders).map(([placeholder, description]) => (
                  <div key={placeholder}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {placeholder}
                    </label>
                    <input
                      type="text"
                      placeholder={description}
                      value={placeholderValues[placeholder] || ''}
                      onChange={(e) => setPlaceholderValues(prev => ({
                        ...prev,
                        [placeholder]: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleInsertTemplate}
                  disabled={!onInsertTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Insert Template
                </button>
                
                <Tooltip
                  content="Copy template to clipboard"
                  trigger={
                    <button
                      onClick={() => {
                        const code = generateCode(selectedTemplate);
                        navigator.clipboard.writeText(code);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Copy
                    </button>
                  }
                />
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Preview</h5>
              <pre className="p-3 bg-gray-100 rounded text-sm overflow-auto max-h-64">
                <code>{generateCode(selectedTemplate)}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};