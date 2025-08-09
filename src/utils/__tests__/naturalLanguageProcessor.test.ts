import { processNaturalLanguageQuery, enhancedSearch, applyFilters } from '../naturalLanguageProcessor';

describe('naturalLanguageProcessor', () => {
  describe('processNaturalLanguageQuery', () => {
    it('extracts dietary restrictions from query', () => {
      const result = processNaturalLanguageQuery('I want vegetarian pasta recipes');

      expect(result.extractedFilters.dietaryRestrictions).toContain('vegetarian');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('extracts cuisine types from query', () => {
      const result = processNaturalLanguageQuery('Show me Italian dishes');

      expect(result.extractedFilters.cuisineTypes).toContain('italian');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('extracts difficulty level from query', () => {
      const result = processNaturalLanguageQuery('Easy recipes for beginners');

      expect(result.extractedFilters.difficultyLevel).toContain('easy');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('extracts cooking time from query', () => {
      const result = processNaturalLanguageQuery('Quick 30 minute meals');

      expect(result.extractedFilters.cookingTime).toEqual({ min: 0, max: 30 });
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('extracts meal types from query', () => {
      const result = processNaturalLanguageQuery('Breakfast ideas for tomorrow');

      expect(result.extractedFilters.mealTypes).toContain('breakfast');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('extracts spiciness level from query', () => {
      const result = processNaturalLanguageQuery('I want something spicy and hot');

      expect(result.extractedFilters.spiciness).toContain('hot');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('handles complex queries with multiple filters', () => {
      const result = processNaturalLanguageQuery('Easy vegetarian Italian dinner recipes under 30 minutes');

      expect(result.extractedFilters.difficultyLevel).toContain('easy');
      expect(result.extractedFilters.dietaryRestrictions).toContain('vegetarian');
      expect(result.extractedFilters.cuisineTypes).toContain('italian');
      expect(result.extractedFilters.mealTypes).toContain('dinner');
      expect(result.extractedFilters.cookingTime).toEqual({ min: 0, max: 30 });
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('provides suggestions for partial queries', () => {
      const result = processNaturalLanguageQuery('spicy');

      expect(result.suggestions).toHaveLength(5);
      expect(result.suggestions.some(s => s.toLowerCase().includes('spicy'))).toBe(true);
    });

    it('returns low confidence for unrecognized queries', () => {
      const result = processNaturalLanguageQuery('xyz abc random text');

      expect(result.confidence).toBeLessThan(0.3);
      expect(Object.keys(result.extractedFilters)).toHaveLength(0);
    });
  });

  describe('enhancedSearch', () => {
    const mockItems = [
      { id: 1, name: 'Italian Pasta', description: 'Delicious pasta from Italy' },
      { id: 2, name: 'Chinese Noodles', description: 'Traditional Chinese noodle dish' },
      { id: 3, name: 'Japanese Ramen', description: 'Authentic ramen from Japan' },
      { id: 4, name: 'Thai Pad Thai', description: 'Classic Thai stir-fried noodles' },
    ];

    it('performs exact match search', () => {
      const results = enhancedSearch(mockItems, 'Italian', ['name', 'description']);

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Italian Pasta');
      expect(results[0].searchScore).toBeGreaterThan(0.9);
    });

    it('performs fuzzy search for partial matches', () => {
      const results = enhancedSearch(mockItems, 'noodle', ['name', 'description']);

      expect(results.length).toBeGreaterThan(1);
      expect(results.some(r => r.name.includes('Noodles'))).toBe(true);
      expect(results.some(r => r.description.includes('noodles'))).toBe(true);
    });

    it('returns empty array for no matches', () => {
      const results = enhancedSearch(mockItems, 'xyz', ['name', 'description']);

      expect(results).toHaveLength(0);
    });

    it('returns all items for empty query', () => {
      const results = enhancedSearch(mockItems, '', ['name', 'description']);

      expect(results).toHaveLength(mockItems.length);
    });

    it('sorts results by search score', () => {
      const results = enhancedSearch(mockItems, 'noodle', ['name', 'description']);

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].searchScore).toBeGreaterThanOrEqual(results[i].searchScore);
      }
    });
  });

  describe('applyFilters', () => {
    const mockItems = [
      {
        id: 1,
        name: 'Italian Pasta',
        cuisine: 'italian',
        difficulty: 'easy',
        cookTime: '25',
        mealType: 'dinner',
        spiciness: 'mild',
        dietaryRestrictions: ['vegetarian'],
      },
      {
        id: 2,
        name: 'Spicy Thai Curry',
        cuisine: 'thai',
        difficulty: 'medium',
        cookTime: '45',
        mealType: 'dinner',
        spiciness: 'hot',
        dietaryRestrictions: ['vegan'],
      },
      {
        id: 3,
        name: 'Quick Breakfast',
        cuisine: 'american',
        difficulty: 'easy',
        cookTime: '10',
        mealType: 'breakfast',
        spiciness: 'mild',
        dietaryRestrictions: [],
      },
    ];

    it('filters by dietary restrictions', () => {
      const filters = {
        query: '',
        dietaryRestrictions: ['vegetarian'],
        difficultyLevel: [],
        cookingTime: { min: 0, max: 480 },
        cuisineTypes: [],
        mealTypes: [],
        spiciness: [],
        ingredients: [],
      };

      const results = applyFilters(mockItems, filters);

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Italian Pasta');
    });

    it('filters by difficulty level', () => {
      const filters = {
        query: '',
        dietaryRestrictions: [],
        difficultyLevel: ['easy'],
        cookingTime: { min: 0, max: 480 },
        cuisineTypes: [],
        mealTypes: [],
        spiciness: [],
        ingredients: [],
      };

      const results = applyFilters(mockItems, filters);

      expect(results).toHaveLength(2);
      expect(results.every(r => r.difficulty === 'easy')).toBe(true);
    });

    it('filters by cooking time', () => {
      const filters = {
        query: '',
        dietaryRestrictions: [],
        difficultyLevel: [],
        cookingTime: { min: 0, max: 30 },
        cuisineTypes: [],
        mealTypes: [],
        spiciness: [],
        ingredients: [],
      };

      const results = applyFilters(mockItems, filters);

      expect(results).toHaveLength(2);
      expect(results.every(r => parseInt(r.cookTime) <= 30)).toBe(true);
    });

    it('filters by cuisine type', () => {
      const filters = {
        query: '',
        dietaryRestrictions: [],
        difficultyLevel: [],
        cookingTime: { min: 0, max: 480 },
        cuisineTypes: ['italian'],
        mealTypes: [],
        spiciness: [],
        ingredients: [],
      };

      const results = applyFilters(mockItems, filters);

      expect(results).toHaveLength(1);
      expect(results[0].cuisine).toBe('italian');
    });

    it('filters by meal type', () => {
      const filters = {
        query: '',
        dietaryRestrictions: [],
        difficultyLevel: [],
        cookingTime: { min: 0, max: 480 },
        cuisineTypes: [],
        mealTypes: ['breakfast'],
        spiciness: [],
        ingredients: [],
      };

      const results = applyFilters(mockItems, filters);

      expect(results).toHaveLength(1);
      expect(results[0].mealType).toBe('breakfast');
    });

    it('filters by spiciness', () => {
      const filters = {
        query: '',
        dietaryRestrictions: [],
        difficultyLevel: [],
        cookingTime: { min: 0, max: 480 },
        cuisineTypes: [],
        mealTypes: [],
        spiciness: ['hot'],
        ingredients: [],
      };

      const results = applyFilters(mockItems, filters);

      expect(results).toHaveLength(1);
      expect(results[0].spiciness).toBe('hot');
    });

    it('applies multiple filters simultaneously', () => {
      const filters = {
        query: '',
        dietaryRestrictions: [],
        difficultyLevel: ['easy'],
        cookingTime: { min: 0, max: 30 },
        cuisineTypes: [],
        mealTypes: ['breakfast'],
        spiciness: [],
        ingredients: [],
      };

      const results = applyFilters(mockItems, filters);

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Quick Breakfast');
    });

    it('returns empty array when no items match filters', () => {
      const filters = {
        query: '',
        dietaryRestrictions: ['vegan'],
        difficultyLevel: ['hard'],
        cookingTime: { min: 0, max: 480 },
        cuisineTypes: [],
        mealTypes: [],
        spiciness: [],
        ingredients: [],
      };

      const results = applyFilters(mockItems, filters);

      expect(results).toHaveLength(0);
    });
  });
});
