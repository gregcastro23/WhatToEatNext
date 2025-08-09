import React, { useState, useEffect } from 'react';

import { Tooltip } from './ContextualHelp';

// Astrological pattern suggestions based on established casing conventions
interface CodeSuggestion {
  id: string;
  title: string;
  description: string;
  code: string;
  category: 'elemental' | 'planetary' | 'zodiac' | 'alchemical' | 'cuisine' | 'lunar';
  tags: string[];
}

const ASTROLOGICAL_SUGGESTIONS: CodeSuggestion[] = [
  {
    id: 'elemental-properties',
    title: 'Elemental Properties Interface',
    description: 'Standard interface for elemental properties using proper casing',
    code: `interface ElementalProperties {
  Fire: number;    // Energy, spice, quick cooking
  Water: number;   // Cooling, fluid, steaming  
  Earth: number;   // Grounding, root vegetables, slow cooking
  Air: number;     // Light, leafy, raw preparations
}

// Usage example
const ingredientElements: ElementalProperties = {
  Fire: 0.8,
  Water: 0.2,
  Earth: 0.1,
  Air: 0.0
};`,
    category: 'elemental',
    tags: ['interface', 'properties', 'elements'],
  },
  {
    id: 'planetary-positions',
    title: 'Planetary Position Calculation',
    description: 'Reliable planetary position calculation with fallbacks',
    code: `import { getReliablePlanetaryPositions } from '@/utils/reliableAstronomy';

async function calculatePlanetaryInfluences(date: Date = new Date()) {
  try {
    const positions = await getReliablePlanetaryPositions(date);
    
    // Planets use capitalized names: Sun, Moon, Mercury, Venus, etc.
    const sunInfluence = positions.Sun?.degree || 0;
    const moonInfluence = positions.Moon?.degree || 0;
    
    return {
      solar: sunInfluence,
      lunar: moonInfluence,
      timestamp: date
    };
  } catch (error) {
    console.warn('Using fallback planetary positions', error);
    return getFallbackInfluences();
  }
}`,
    category: 'planetary',
    tags: ['calculation', 'positions', 'fallback'],
  },
  {
    id: 'zodiac-validation',
    title: 'Zodiac Sign Validation',
    description: 'Validate zodiac signs using lowercase convention',
    code: `type ZodiacSign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' |
                 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

function validateZodiacSign(sign: string): sign is ZodiacSign {
  const validSigns: ZodiacSign[] = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];
  
  return validSigns.includes(sign.toLowerCase() as ZodiacSign);
}

// Usage with transit validation
function validateTransitDate(planet: string, date: Date, sign: ZodiacSign): boolean {
  if (!validateZodiacSign(sign)) {
    throw new Error(\`Invalid zodiac sign: \${sign}\`);
  }
  
  // Transit dates use lowercase signs
  const planetData = require(\`@/data/planets/\${planet.toLowerCase()}\`);
  const transitDates = planetData.TransitDates;
  
  return transitDates[sign] ? isDateInRange(date, transitDates[sign]) : false;
}`,
    category: 'zodiac',
    tags: ['validation', 'signs', 'transit'],
  },
  {
    id: 'elemental-compatibility',
    title: 'Elemental Compatibility Calculation',
    description: 'Self-reinforcement principle with proper element casing',
    code: `function calculateElementalCompatibility(
  source: ElementalProperties, 
  target: ElementalProperties
): number {
  const elements: Array<keyof ElementalProperties> = ['Fire', 'Water', 'Earth', 'Air'];
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const element of elements) {
    const sourceStrength = source[element];
    const targetStrength = target[element];
    
    if (sourceStrength > 0 && targetStrength > 0) {
      // Self-reinforcement: same elements have highest compatibility (0.9)
      const compatibility = 0.9;
      const weight = Math.min(sourceStrength, targetStrength);
      
      weightedSum += compatibility * weight;
      totalWeight += weight;
    }
  }
  
  // Ensure minimum compatibility of 0.7 (no opposing elements)
  return Math.max(0.7, totalWeight > 0 ? weightedSum / totalWeight : 0.7);
}`,
    category: 'elemental',
    tags: ['compatibility', 'self-reinforcement', 'calculation'],
  },
  {
    id: 'cuisine-types',
    title: 'Cuisine Type Definitions',
    description: 'Proper cuisine type casing with cultural sensitivity',
    code: `type CuisineType = 'Italian' | 'Mexican' | 'Chinese' | 'Indian' | 'Japanese' |
                  'French' | 'Thai' | 'Greek' | 'Middle-Eastern' | 'Mediterranean' |
                  'Korean' | 'Vietnamese' | 'Spanish' | 'German' | 'American';

interface CuisineProfile {
  name: CuisineType;
  elementalTendencies: ElementalProperties;
  commonIngredients: string[];
  cookingMethods: string[];
  culturalContext: string;
}

// Example implementation
const italianCuisine: CuisineProfile = {
  name: 'Italian',
  elementalTendencies: {
    Fire: 0.6,  // Garlic, herbs, quick sautéing
    Water: 0.3, // Tomatoes, olive oil
    Earth: 0.7, // Grains, root vegetables
    Air: 0.4    // Fresh herbs, light preparations
  },
  commonIngredients: ['tomatoes', 'basil', 'garlic', 'olive oil', 'pasta'],
  cookingMethods: ['sautéing', 'braising', 'roasting'],
  culturalContext: 'Mediterranean tradition emphasizing fresh, seasonal ingredients'
};`,
    category: 'cuisine',
    tags: ['types', 'cultural', 'profile'],
  },
  {
    id: 'lunar-phases',
    title: 'Lunar Phase Integration',
    description: 'Lunar phase calculations using lowercase convention',
    code: `type LunarPhase = 'new moon' | 'waxing crescent' | 'first quarter' | 'waxing gibbous' |
                 'full moon' | 'waning gibbous' | 'last quarter' | 'waning crescent';

interface LunarInfluence {
  phase: LunarPhase;
  illumination: number; // 0-1
  elementalBoost: Partial<ElementalProperties>;
  recommendedActions: string[];
}

function getLunarInfluence(date: Date): LunarInfluence {
  const phase = calculateLunarPhase(date);
  
  const influences: Record<LunarPhase, LunarInfluence> = {
    'new moon': {
      phase: 'new moon',
      illumination: 0,
      elementalBoost: { Water: 0.2 },
      recommendedActions: ['detoxifying foods', 'cleansing preparations']
    },
    'full moon': {
      phase: 'full moon', 
      illumination: 1,
      elementalBoost: { Fire: 0.3, Air: 0.2 },
      recommendedActions: ['balancing meals', 'harmonizing flavors']
    },
    // ... other phases
  };
  
  return influences[phase] || influences['new moon'];
}`,
    category: 'lunar',
    tags: ['phases', 'influence', 'timing'],
  },
  {
    id: 'alchemical-properties',
    title: 'Alchemical Property System',
    description: 'The 14 Alchemical Pillars with proper casing',
    code: `type AlchemicalProperty = 'Spirit' | 'Essence' | 'Matter' | 'Substance' |
                        'Harmony' | 'Balance' | 'Transformation' | 'Integration';

interface AlchemicalProfile {
  primary: AlchemicalProperty;
  secondary: AlchemicalProperty;
  intensity: number; // 0-1
  manifestation: string;
}

const ALCHEMICAL_PILLARS = {
  'Elemental Harmony': { primary: 'Harmony' as AlchemicalProperty, weight: 1.0 },
  'Planetary Correspondence': { primary: 'Spirit' as AlchemicalProperty, weight: 0.9 },
  'Seasonal Attunement': { primary: 'Balance' as AlchemicalProperty, weight: 0.8 },
  'Cultural Resonance': { primary: 'Integration' as AlchemicalProperty, weight: 0.7 },
  'Nutritional Alchemy': { primary: 'Transformation' as AlchemicalProperty, weight: 0.9 },
  // ... other pillars
} as const;

function calculateAlchemicalScore(
  ingredient: any,
  context: { season: string; culture: CuisineType; timing: Date }
): number {
  let score = 0;
  let totalWeight = 0;
  
  for (const [pillar, config] of Object.entries(ALCHEMICAL_PILLARS)) {
    const pillarScore = evaluatePillar(pillar, ingredient, context);
    score += pillarScore * config.weight;
    totalWeight += config.weight;
  }
  
  return totalWeight > 0 ? score / totalWeight : 0;
}`,
    category: 'alchemical',
    tags: ['pillars', 'properties', 'scoring'],
  },
];

interface AstrologicalCodeSuggestionsProps {
  onInsertCode?: (code: string) => void;
  filterCategory?: CodeSuggestion['category'];
  className?: string;
}

export const AstrologicalCodeSuggestions: React.FC<AstrologicalCodeSuggestionsProps> = ({
  onInsertCode,
  filterCategory,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CodeSuggestion['category'] | 'all'>(
    filterCategory || 'all',
  );
  const [filteredSuggestions, setFilteredSuggestions] = useState(ASTROLOGICAL_SUGGESTIONS);

  useEffect(() => {
    let filtered = ASTROLOGICAL_SUGGESTIONS;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        s =>
          s.title.toLowerCase().includes(term) ||
          s.description.toLowerCase().includes(term) ||
          s.tags.some(tag => tag.toLowerCase().includes(term)),
      );
    }

    setFilteredSuggestions(filtered);
  }, [searchTerm, selectedCategory]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'elemental', label: 'Elemental' },
    { value: 'planetary', label: 'Planetary' },
    { value: 'zodiac', label: 'Zodiac' },
    { value: 'alchemical', label: 'Alchemical' },
    { value: 'cuisine', label: 'Cuisine' },
    { value: 'lunar', label: 'Lunar' },
  ];

  return (
    <div className={`rounded-lg border bg-white shadow-lg ${className}`}>
      <div className='border-b p-4'>
        <h3 className='mb-3 text-lg font-semibold text-gray-900'>Astrological Code Suggestions</h3>

        <div className='mb-3 flex gap-3'>
          <input
            type='text'
            placeholder='Search suggestions...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value as any)}
            className='rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className='max-h-96 overflow-y-auto'>
        {filteredSuggestions.length === 0 ? (
          <div className='p-4 text-center text-gray-500'>
            No suggestions found matching your criteria.
          </div>
        ) : (
          filteredSuggestions.map(suggestion => (
            <div key={suggestion.id} className='border-b p-4 hover:bg-gray-50'>
              <div className='mb-2 flex items-start justify-between'>
                <div>
                  <h4 className='font-medium text-gray-900'>{suggestion.title}</h4>
                  <p className='mt-1 text-sm text-gray-600'>{suggestion.description}</p>
                </div>

                <div className='flex items-center gap-2'>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      suggestion.category === 'elemental'
                        ? 'bg-red-100 text-red-800'
                        : suggestion.category === 'planetary'
                          ? 'bg-blue-100 text-blue-800'
                          : suggestion.category === 'zodiac'
                            ? 'bg-purple-100 text-purple-800'
                            : suggestion.category === 'alchemical'
                              ? 'bg-yellow-100 text-yellow-800'
                              : suggestion.category === 'cuisine'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {suggestion.category}
                  </span>

                  {onInsertCode && (
                    <Tooltip
                      content='Insert code snippet'
                      trigger={
                        <button
                          onClick={() => onInsertCode(suggestion.code)}
                          className='p-1 text-gray-400 transition-colors hover:text-blue-600'
                        >
                          <svg
                            className='h-4 w-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                            />
                          </svg>
                        </button>
                      }
                    />
                  )}
                </div>
              </div>

              <div className='mb-3 flex flex-wrap gap-1'>
                {suggestion.tags.map(tag => (
                  <span key={tag} className='rounded bg-gray-100 px-2 py-1 text-xs text-gray-600'>
                    {tag}
                  </span>
                ))}
              </div>

              <details className='group'>
                <summary className='cursor-pointer select-none text-sm text-blue-600 hover:text-blue-800'>
                  View code snippet
                </summary>
                <pre className='mt-2 overflow-x-auto rounded bg-gray-100 p-3 text-sm'>
                  <code>{suggestion.code}</code>
                </pre>
              </details>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
