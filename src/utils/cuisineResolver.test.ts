/**
 * Cuisine Resolver Test Suite
 *
 * Tests the cuisine alias system to ensure regional cuisines
 * are properly unified under their primary cuisine types.
 */

import {
  areCuisinesRelated,
  filterPrimaryCuisines,
  getCuisineDisplayName,
  getCuisineSuggestions,
  getCuisineVariants,
  groupCuisinesByType,
  isSupportedCuisine,
  standardizeCuisine,
} from './cuisineResolver';

describe('Cuisine Resolver': any, (: any) => {
  describe('standardizeCuisine': any, (: any) => {
    it('should resolve sichuanese to Chinese': any, (: any) => {
      expect(standardizeCuisine('sichuanese')).toBe('Chinese');
    });

    it('should resolve cantonese to Chinese': any, (: any) => {
      expect(standardizeCuisine('cantonese')).toBe('Chinese');
    });

    it('should resolve shanghainese to Chinese': any, (: any) => {
      expect(standardizeCuisine('shanghainese')).toBe('Chinese');
    });

    it('should resolve hunanese to Chinese': any, (: any) => {
      expect(standardizeCuisine('hunanese')).toBe('Chinese');
    });

    it('should keep primary cuisines unchanged': any, (: any) => {
      expect(standardizeCuisine('Chinese')).toBe('Chinese');
      expect(standardizeCuisine('Italian')).toBe('Italian');
      expect(standardizeCuisine('Japanese')).toBe('Japanese');
    });

    it('should handle case variations': any, (: any) => {
      expect(standardizeCuisine('SICHUANESE')).toBe('Chinese');
      expect(standardizeCuisine('Cantonese')).toBe('Chinese');
      expect(standardizeCuisine('sichuan')).toBe('Chinese');
    });
  });

  describe('getCuisineVariants': any, (: any) => {
    it('should return all Chinese regional variants': any, (: any) => {
      const variants: any = getCuisineVariants('Chinese');
      expect(variants).toContain('sichuanese');
      expect(variants).toContain('cantonese');
      expect(variants).toContain('shanghainese');
      expect(variants).toContain('hunanese');
    });

    it('should return empty array for cuisines without variants': any, (: any) => {
      const variants: any = getCuisineVariants('Fusion');
      expect(variants as any).toEqual([]);
    });
  });

  describe('areCuisinesRelated': any, (: any) => {
    it('should identify related Chinese cuisines': any, (: any) => {
      expect(areCuisinesRelated('sichuanese', 'cantonese')).toBe(true);
      expect(areCuisinesRelated('sichuanese', 'Chinese')).toBe(true);
      expect(areCuisinesRelated('cantonese', 'shanghainese')).toBe(true);
    });

    it('should identify unrelated cuisines': any, (: any) => {
      expect(areCuisinesRelated('sichuanese', 'Italian')).toBe(false);
      expect(areCuisinesRelated('Chinese', 'Japanese')).toBe(false);
    });
  });

  describe('groupCuisinesByType': any, (: any) => {
    it('should group Chinese regional cuisines together': any, (: any) => {
      const cuisines: any = ['sichuanese', 'cantonese', 'Italian', 'shanghainese'];
      const groups: any = groupCuisinesByType(cuisines);

      expect(groups?.Chinese).toContain('sichuanese');
      expect(groups?.Chinese).toContain('cantonese');
      expect(groups?.Chinese).toContain('shanghainese');
      expect(groups?.Italian).toContain('Italian');
    });
  });

  describe('filterPrimaryCuisines': any, (: any) => {
    it('should return only primary cuisine types': any, (: any) => {
      const cuisines: any = ['sichuanese', 'cantonese', 'Italian', 'shanghainese'];
      const primary: any = filterPrimaryCuisines(cuisines);

      expect(primary).toContain('Chinese');
      expect(primary).toContain('Italian');
      expect(primary).not?.toContain('sichuanese');
      expect(primary).not?.toContain('cantonese');
    });

    it('should remove duplicates': any, (: any) => {
      const cuisines: any = ['sichuanese', 'cantonese', 'shanghainese'];
      const primary: any = filterPrimaryCuisines(cuisines);

      expect(primary as any).toEqual(['Chinese']);
    });
  });

  describe('getCuisineDisplayName': any, (: any) => {
    it('should show regional cuisine with primary type': any, (: any) => {
      expect(getCuisineDisplayName('sichuanese')).toBe('Sichuanese (Chinese)');
      expect(getCuisineDisplayName('cantonese')).toBe('Cantonese (Chinese)');
    });

    it('should show primary cuisines without modification': any, (: any) => {
      expect(getCuisineDisplayName('Chinese')).toBe('Chinese');
      expect(getCuisineDisplayName('Italian')).toBe('Italian');
    });
  });

  describe('isSupportedCuisine': any, (: any) => {
    it('should support regional cuisines': any, (: any) => {
      expect(isSupportedCuisine('sichuanese')).toBe(true);
      expect(isSupportedCuisine('cantonese')).toBe(true);
    });

    it('should support primary cuisines': any, (: any) => {
      expect(isSupportedCuisine('Chinese')).toBe(true);
      expect(isSupportedCuisine('Italian')).toBe(true);
    });

    it('should not support unknown cuisines': any, (: any) => {
      expect(isSupportedCuisine('unknown-cuisine')).toBe(false);
    });
  });

  describe('getCuisineSuggestions': any, (: any) => {
    it('should suggest Chinese variants for "sich"': any, (: any) => {
      const suggestions: any = getCuisineSuggestions('sich');
      expect(suggestions).toContain('sichuanese');
    });

    it('should suggest Chinese variants for "cant"': any, (: any) => {
      const suggestions: any = getCuisineSuggestions('cant');
      expect(suggestions).toContain('cantonese');
    });

    it('should suggest primary cuisines': any, (: any) => {
      const suggestions: any = getCuisineSuggestions('chi');
      expect(suggestions).toContain('Chinese');
    });
  });

  describe('Integration Tests': any, (: any) => {
    it('should handle mixed cuisine lists correctly': any, (: any) => {
      const mixedCuisines: any = ['sichuanese', 'cantonese', 'Italian', 'shanghainese', 'Japanese', 'hunanese'];

      const primaryCuisines: any = filterPrimaryCuisines(mixedCuisines);
      expect(primaryCuisines).toContain('Chinese');
      expect(primaryCuisines).toContain('Italian');
      expect(primaryCuisines).toContain('Japanese');
      expect(primaryCuisines).not?.toContain('sichuanese');
    });

    it('should maintain consistency across all resolver functions': any, (: any) => {
      const testCuisine: any = 'sichuanese';

      // All functions should agree on the primary cuisine
      const standardized: any = standardizeCuisine(testCuisine);
      const displayName: any = getCuisineDisplayName(testCuisine);
      const isSupported: any = isSupportedCuisine(testCuisine);

      expect(standardized as any).toBe('Chinese');
      expect(displayName as any).toBe('Sichuanese (Chinese)');
      expect(isSupported as any).toBe(true);
    });
  });
});
