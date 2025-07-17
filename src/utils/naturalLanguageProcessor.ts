/**
 * Natural Language Processing utility for advanced search
 * Processes user queries and extracts search intent and filters
 */

import { SearchFilters } from '@/components/AdvancedSearchFilters';

// ========== INTERFACES ==========

export interface SearchIntent {
  query: string;
  extractedFilters: Partial<SearchFilters>;
  confidence: number;
  suggestions: string[];
}

export interface KeywordPattern {
  keywords: string[];
  category: keyof SearchFilters;
  values: string[];
  weight: number;
}

// ========== CONSTANTS ==========

const DIETARY_KEYWORDS: KeywordPattern[] = [
  {
    keywords: ['vegetarian', 'veggie', 'no meat'],
    category: 'dietaryRestrictions',
    values: ['vegetarian'],
    weight: 0.9
  },
  {
    keywords: ['vegan', 'plant based', 'no dairy', 'no animal products'],
    category: 'dietaryRestrictions',
    values: ['vegan'],
    weight: 0.9
  },
  {
    keywords: ['gluten free', 'no gluten', 'celiac'],
    category: 'dietaryRestrictions',
    values: ['gluten-free'],
    weight: 0.9
  },
  {
    keywords: ['dairy free', 'lactose free', 'no dairy'],
    category: 'dietaryRestrictions',
    values: ['dairy-free'],
    weight: 0.9
  },
  {
    keywords: ['nut free', 'no nuts', 'allergy'],
    category: 'dietaryRestrictions',
    values: ['nut-free'],
    weight: 0.8
  },
  {
    keywords: ['low carb', 'keto', 'ketogenic'],
    category: 'dietaryRestrictions',
    values: ['low-carb', 'keto'],
    weight: 0.8
  },
  {
    keywords: ['paleo', 'paleolithic'],
    category: 'dietaryRestrictions',
    values: ['paleo'],
    weight: 0.8
  },
  {
    keywords: ['halal'],
    category: 'dietaryRestrictions',
    values: ['halal'],
    weight: 0.9
  },
  {
    keywords: ['kosher'],
    category: 'dietaryRestrictions',
    values: ['kosher'],
    weight: 0.9
  }
];

const DIFFICULTY_KEYWORDS: KeywordPattern[] = [
  {
    keywords: ['easy', 'simple', 'quick', 'beginner'],
    category: 'difficultyLevel',
    values: ['easy', 'beginner'],
    weight: 0.8
  },
  {
    keywords: ['hard', 'difficult', 'complex', 'advanced', 'expert'],
    category: 'difficultyLevel',
    values: ['hard', 'expert'],
    weight: 0.8
  },
  {
    keywords: ['medium', 'intermediate', 'moderate'],
    category: 'difficultyLevel',
    values: ['medium'],
    weight: 0.7
  }
];

const TIME_KEYWORDS: KeywordPattern[] = [
  {
    keywords: ['quick', 'fast', 'under 30', 'less than 30', '30 minutes'],
    category: 'cookingTime',
    values: ['0-30'],
    weight: 0.8
  },
  {
    keywords: ['1 hour', 'one hour', '60 minutes'],
    category: 'cookingTime',
    values: ['30-60'],
    weight: 0.8
  },
  {
    keywords: ['long', 'slow', '2 hours', 'extended'],
    category: 'cookingTime',
    values: ['60-120'],
    weight: 0.7
  }
];

const CUISINE_KEYWORDS: KeywordPattern[] = [
  {
    keywords: ['italian', 'pasta', 'pizza', 'mediterranean'],
    category: 'cuisineTypes',
    values: ['italian'],
    weight: 0.9
  },
  {
    keywords: ['chinese', 'asian', 'stir fry', 'wok'],
    category: 'cuisineTypes',
    values: ['chinese'],
    weight: 0.9
  },
  {
    keywords: ['japanese', 'sushi', 'ramen', 'miso'],
    category: 'cuisineTypes',
    values: ['japanese'],
    weight: 0.9
  },
  {
    keywords: ['indian', 'curry', 'spicy', 'masala'],
    category: 'cuisineTypes',
    values: ['indian'],
    weight: 0.9
  },
  {
    keywords: ['thai', 'pad thai', 'coconut'],
    category: 'cuisineTypes',
    values: ['thai'],
    weight: 0.9
  },
  {
    keywords: ['mexican', 'tacos', 'salsa', 'beans'],
    category: 'cuisineTypes',
    values: ['mexican'],
    weight: 0.9
  },
  {
    keywords: ['french', 'wine', 'butter', 'cream'],
    category: 'cuisineTypes',
    values: ['french'],
    weight: 0.8
  }
];

const MEAL_KEYWORDS: KeywordPattern[] = [
  {
    keywords: ['breakfast', 'morning', 'brunch'],
    category: 'mealTypes',
    values: ['breakfast'],
    weight: 0.9
  },
  {
    keywords: ['lunch', 'midday', 'noon'],
    category: 'mealTypes',
    values: ['lunch'],
    weight: 0.9
  },
  {
    keywords: ['dinner', 'evening', 'supper'],
    category: 'mealTypes',
    values: ['dinner'],
    weight: 0.9
  },
  {
    keywords: ['snack', 'appetizer', 'starter'],
    category: 'mealTypes',
    values: ['snack', 'appetizer'],
    weight: 0.8
  },
  {
    keywords: ['dessert', 'sweet', 'cake', 'cookie'],
    category: 'mealTypes',
    values: ['dessert'],
    weight: 0.8
  }
];

const SPICE_KEYWORDS: KeywordPattern[] = [
  {
    keywords: ['mild', 'not spicy', 'no heat'],
    category: 'spiciness',
    values: ['mild'],
    weight: 0.8
  },
  {
    keywords: ['spicy', 'hot', 'chili', 'pepper'],
    category: 'spiciness',
    values: ['hot'],
    weight: 0.8
  },
  {
    keywords: ['very hot', 'extremely spicy', 'fire'],
    category: 'spiciness',
    values: ['very-hot'],
    weight: 0.9
  }
];

const ALL_PATTERNS = [
  ...DIETARY_KEYWORDS,
  ...DIFFICULTY_KEYWORDS,
  ...TIME_KEYWORDS,
  ...CUISINE_KEYWORDS,
  ...MEAL_KEYWORDS,
  ...SPICE_KEYWORDS
];

// ========== UTILITY FUNCTIONS ==========

/**
 * Normalize text for better matching
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2;
  if (len2 === 0) return len1;
  
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));
  
  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  
  const maxLen = Math.max(len1, len2);
  return (maxLen - matrix[len2][len1]) / maxLen;
}

/**
 * Extract time range from query
 */
function extractTimeRange(query: string): { min: number; max: number } | null {
  const timePatterns = [
    { pattern: /(\d+)\s*(?:minutes?|mins?)/i, multiplier: 1 },
    { pattern: /(\d+)\s*(?:hours?|hrs?)/i, multiplier: 60 },
    { pattern: /under\s*(\d+)/i, max: true },
    { pattern: /less\s*than\s*(\d+)/i, max: true },
    { pattern: /more\s*than\s*(\d+)/i, min: true },
    { pattern: /over\s*(\d+)/i, min: true }
  ];
  
  for (const { pattern, multiplier = 1, max, min } of timePatterns) {
    const match = query.match(pattern);
    if (match) {
      const value = parseInt(match[1]) * multiplier;
      if (max) return { min: 0, max: value };
      if (min) return { min: value, max: 480 };
      return { min: value - 15, max: value + 15 };
    }
  }
  
  return null;
}

/**
 * Generate search suggestions based on partial query
 */
function generateSuggestions(query: string): string[] {
  const normalizedQuery = normalizeText(query);
  const suggestions: Array<{ text: string; score: number }> = [];
  
  // Common cuisine suggestions
  const cuisineSuggestions = [
    'Italian pasta dishes',
    'Spicy Indian curry',
    'Quick Chinese stir-fry',
    'Healthy Mediterranean salad',
    'Easy Japanese ramen',
    'Mexican tacos and burritos',
    'French comfort food',
    'Thai coconut curry'
  ];
  
  // Dietary suggestions
  const dietarySuggestions = [
    'Vegetarian dinner recipes',
    'Vegan breakfast ideas',
    'Gluten-free desserts',
    'Keto-friendly meals',
    'Dairy-free options'
  ];
  
  // Time-based suggestions
  const timeSuggestions = [
    'Quick 30-minute meals',
    'Easy weeknight dinners',
    'Slow-cooked comfort food',
    'Fast breakfast ideas'
  ];
  
  const allSuggestions = [...cuisineSuggestions, ...dietarySuggestions, ...timeSuggestions];
  
  for (const suggestion of allSuggestions) {
    const similarity = calculateSimilarity(normalizedQuery, normalizeText(suggestion));
    if (similarity > 0.3 || suggestion.toLowerCase().includes(normalizedQuery)) {
      suggestions.push({ text: suggestion, score: similarity });
    }
  }
  
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.text);
}

// ========== MAIN FUNCTIONS ==========

/**
 * Process natural language query and extract search intent
 */
export function processNaturalLanguageQuery(query: string): SearchIntent {
  const normalizedQuery = normalizeText(query);
  const extractedFilters: Partial<SearchFilters> = {};
  let totalConfidence = 0;
  let matchCount = 0;
  
  // Process each pattern category
  for (const pattern of ALL_PATTERNS) {
    for (const keyword of pattern.keywords) {
      const similarity = calculateSimilarity(normalizedQuery, keyword);
      const containsKeyword = normalizedQuery.includes(keyword);
      
      if (similarity > 0.7 || containsKeyword) {
        const confidence = containsKeyword ? pattern.weight : similarity * pattern.weight;
        
        if (!extractedFilters[pattern.category]) {
          extractedFilters[pattern.category] = [] as any;
        }
        
        // Add values to the appropriate filter category
        if (pattern.category === 'cookingTime') {
          const timeRange = extractTimeRange(query) || { min: 0, max: 30 };
          extractedFilters[pattern.category] = timeRange as any;
        } else if (Array.isArray(extractedFilters[pattern.category])) {
          const currentArray = extractedFilters[pattern.category] as string[];
          for (const value of pattern.values) {
            if (!currentArray.includes(value)) {
              currentArray.push(value);
            }
          }
        }
        
        totalConfidence += confidence;
        matchCount++;
        break; // Move to next pattern after first match
      }
    }
  }
  
  // Extract specific time ranges
  const timeRange = extractTimeRange(query);
  if (timeRange) {
    extractedFilters.cookingTime = timeRange;
    totalConfidence += 0.8;
    matchCount++;
  }
  
  // Calculate overall confidence
  const overallConfidence = matchCount > 0 ? Math.min(totalConfidence / matchCount, 1) : 0;
  
  // Generate suggestions
  const suggestions = generateSuggestions(query);
  
  // Clean query by removing matched keywords
  let cleanedQuery = normalizedQuery;
  for (const pattern of ALL_PATTERNS) {
    for (const keyword of pattern.keywords) {
      cleanedQuery = cleanedQuery.replace(new RegExp(keyword, 'gi'), '').trim();
    }
  }
  cleanedQuery = cleanedQuery.replace(/\s+/g, ' ').trim();
  
  return {
    query: cleanedQuery || query,
    extractedFilters,
    confidence: overallConfidence,
    suggestions
  };
}

/**
 * Enhanced search with fuzzy matching
 */
export function enhancedSearch(
  items: any[],
  query: string,
  searchFields: string[] = ['name', 'description']
): any[] {
  if (!query.trim()) return items;
  
  const normalizedQuery = normalizeText(query);
  const queryWords = normalizedQuery.split(' ').filter(word => word.length > 0);
  
  return items
    .map(item => {
      let totalScore = 0;
      let matchCount = 0;
      
      for (const field of searchFields) {
        const fieldValue = item[field];
        if (typeof fieldValue === 'string') {
          const normalizedField = normalizeText(fieldValue);
          
          // Exact match bonus
          if (normalizedField.includes(normalizedQuery)) {
            totalScore += 1.0;
            matchCount++;
            continue;
          }
          
          // Word-by-word matching
          for (const word of queryWords) {
            if (normalizedField.includes(word)) {
              totalScore += 0.7;
              matchCount++;
            } else {
              // Fuzzy matching for individual words
              const words = normalizedField.split(' ');
              for (const fieldWord of words) {
                const similarity = calculateSimilarity(word, fieldWord);
                if (similarity > 0.6) {
                  totalScore += similarity * 0.5;
                  matchCount++;
                }
              }
            }
          }
        }
      }
      
      const averageScore = matchCount > 0 ? totalScore / matchCount : 0;
      return { ...item, searchScore: averageScore };
    })
    .filter(item => item.searchScore > 0.3)
    .sort((a, b) => b.searchScore - a.searchScore);
}

/**
 * Apply filters to items
 */
export function applyFilters(items: any[], filters: SearchFilters): any[] {
  return items.filter(item => {
    // Dietary restrictions
    if (filters.dietaryRestrictions.length > 0) {
      const itemDietary = item.dietaryRestrictions || [];
      const hasRequiredDietary = filters.dietaryRestrictions.every(restriction =>
        itemDietary.includes(restriction) || 
        (item.tags && item.tags.includes(restriction))
      );
      if (!hasRequiredDietary) return false;
    }
    
    // Difficulty level
    if (filters.difficultyLevel.length > 0) {
      const itemDifficulty = item.difficulty || item.difficultyLevel || 'medium';
      if (!filters.difficultyLevel.includes(itemDifficulty.toLowerCase())) return false;
    }
    
    // Cooking time
    if (filters.cookingTime.min > 0 || filters.cookingTime.max < 480) {
      const cookTime = parseInt(item.cookTime || item.cookingTime || '30');
      if (cookTime < filters.cookingTime.min || cookTime > filters.cookingTime.max) return false;
    }
    
    // Cuisine types
    if (filters.cuisineTypes.length > 0) {
      const itemCuisine = (item.cuisine || item.cuisineType || '').toLowerCase();
      if (!filters.cuisineTypes.some(cuisine => itemCuisine.includes(cuisine))) return false;
    }
    
    // Meal types
    if (filters.mealTypes.length > 0) {
      const itemMealType = (item.mealType || item.category || '').toLowerCase();
      if (!filters.mealTypes.some(meal => itemMealType.includes(meal))) return false;
    }
    
    // Spiciness
    if (filters.spiciness.length > 0) {
      const itemSpiciness = (item.spiciness || item.spiceLevel || 'mild').toLowerCase();
      if (!filters.spiciness.includes(itemSpiciness)) return false;
    }
    
    return true;
  });
}