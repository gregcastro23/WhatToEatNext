/**
 * Cuisine Resolver Test Suite
 * 
 * Tests the cuisine alias system to ensure regional cuisines
 * are properly unified under their primary cuisine types.
 */

import { 
  standardizeCuisine,
  getCuisineVariants,
  areCuisinesRelated,
  groupCuisinesByType,
  filterPrimaryCuisines,
  getCuisineDisplayName,
  isSupportedCuisine,
  getCuisineSuggestions,
  type PrimaryCuisineType
} from './cuisineResolver';

describe('Cuisine Resolver', () => {
  describe('standardizeCuisine', () => {
    it('should resolve sichuanese to Chinese', () => {
      expect(standardizeCuisine('sichuanese')).toBe('Chinese');
    });

    it('should resolve cantonese to Chinese', () => {
      expect(standardizeCuisine('cantonese')).toBe('Chinese');
    });

    it('should resolve shanghainese to Chinese', () => {
      expect(standardizeCuisine('shanghainese')).toBe('Chinese');
    });

    it('should resolve hunanese to Chinese', () => {
      expect(standardizeCuisine('hunanese')).toBe('Chinese');
    });

    it('should keep primary cuisines unchanged', () => {
      expect(standardizeCuisine('Chinese')).toBe('Chinese');
      expect(standardizeCuisine('Italian')).toBe('Italian');
      expect(standardizeCuisine('Japanese')).toBe('Japanese');
    });

    it('should handle case variations', () => {
      expect(standardizeCuisine('SICHUANESE')).toBe('Chinese');
      expect(standardizeCuisine('Cantonese')).toBe('Chinese');
      expect(standardizeCuisine('sichuan')).toBe('Chinese');
    });
  });

  describe('getCuisineVariants', () => {
    it('should return all Chinese regional variants', () => {
      const variants = getCuisineVariants('Chinese');
      expect(variants).toContain('sichuanese');
      expect(variants).toContain('cantonese');
      expect(variants).toContain('shanghainese');
      expect(variants).toContain('hunanese');
    });

    it('should return empty array for cuisines without variants', () => {
      const variants = getCuisineVariants('Fusion');
      expect(variants).toEqual([]);
    });
  });

  describe('areCuisinesRelated', () => {
    it('should identify related Chinese cuisines', () => {
      expect(areCuisinesRelated('sichuanese', 'cantonese')).toBe(true);
      expect(areCuisinesRelated('sichuanese', 'Chinese')).toBe(true);
      expect(areCuisinesRelated('cantonese', 'shanghainese')).toBe(true);
    });

    it('should identify unrelated cuisines', () => {
      expect(areCuisinesRelated('sichuanese', 'Italian')).toBe(false);
      expect(areCuisinesRelated('Chinese', 'Japanese')).toBe(false);
    });
  });

  describe('groupCuisinesByType', () => {
    it('should group Chinese regional cuisines together', () => {
      const cuisines = ['sichuanese', 'cantonese', 'Italian', 'shanghainese'];
      const groups = groupCuisinesByType(cuisines);
      
      expect(groups.Chinese).toContain('sichuanese');
      expect(groups.Chinese).toContain('cantonese');
      expect(groups.Chinese).toContain('shanghainese');
      expect(groups.Italian).toContain('Italian');
    });
  });

  describe('filterPrimaryCuisines', () => {
    it('should return only primary cuisine types', () => {
      const cuisines = ['sichuanese', 'cantonese', 'Italian', 'shanghainese'];
      const primary = filterPrimaryCuisines(cuisines);
      
      expect(primary).toContain('Chinese');
      expect(primary).toContain('Italian');
      expect(primary).not.toContain('sichuanese');
      expect(primary).not.toContain('cantonese');
    });

    it('should remove duplicates', () => {
      const cuisines = ['sichuanese', 'cantonese', 'shanghainese'];
      const primary = filterPrimaryCuisines(cuisines);
      
      expect(primary).toEqual(['Chinese']);
    });
  });

  describe('getCuisineDisplayName', () => {
    it('should show regional cuisine with primary type', () => {
      expect(getCuisineDisplayName('sichuanese')).toBe('Sichuanese (Chinese)');
      expect(getCuisineDisplayName('cantonese')).toBe('Cantonese (Chinese)');
    });

    it('should show primary cuisines without modification', () => {
      expect(getCuisineDisplayName('Chinese')).toBe('Chinese');
      expect(getCuisineDisplayName('Italian')).toBe('Italian');
    });
  });

  describe('isSupportedCuisine', () => {
    it('should support regional cuisines', () => {
      expect(isSupportedCuisine('sichuanese')).toBe(true);
      expect(isSupportedCuisine('cantonese')).toBe(true);
    });

    it('should support primary cuisines', () => {
      expect(isSupportedCuisine('Chinese')).toBe(true);
      expect(isSupportedCuisine('Italian')).toBe(true);
    });

    it('should not support unknown cuisines', () => {
      expect(isSupportedCuisine('unknown-cuisine')).toBe(false);
    });
  });

  describe('getCuisineSuggestions', () => {
    it('should suggest Chinese variants for "sich"', () => {
      const suggestions = getCuisineSuggestions('sich');
      expect(suggestions).toContain('sichuanese');
    });

    it('should suggest Chinese variants for "cant"', () => {
      const suggestions = getCuisineSuggestions('cant');
      expect(suggestions).toContain('cantonese');
    });

    it('should suggest primary cuisines', () => {
      const suggestions = getCuisineSuggestions('chi');
      expect(suggestions).toContain('Chinese');
    });
  });

  describe('Integration Tests', () => {
    it('should handle mixed cuisine lists correctly', () => {
      const mixedCuisines = [
        'sichuanese',
        'cantonese', 
        'Italian',
        'shanghainese',
        'Japanese',
        'hunanese'
      ];
      
      const primaryCuisines = filterPrimaryCuisines(mixedCuisines);
      expect(primaryCuisines).toContain('Chinese');
      expect(primaryCuisines).toContain('Italian');
      expect(primaryCuisines).toContain('Japanese');
      expect(primaryCuisines).not.toContain('sichuanese');
    });

    it('should maintain consistency across all resolver functions', () => {
      const testCuisine = 'sichuanese';
      
      // All functions should agree on the primary cuisine
      const standardized = standardizeCuisine(testCuisine);
      const displayName = getCuisineDisplayName(testCuisine);
      const isSupported = isSupportedCuisine(testCuisine);
      
      expect(standardized).toBe('Chinese');
      expect(displayName).toBe('Sichuanese (Chinese)');
      expect(isSupported).toBe(true);
    });
  });
}); 