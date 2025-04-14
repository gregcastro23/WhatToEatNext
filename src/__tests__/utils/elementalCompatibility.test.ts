import { calculateElementalCompatibility } from '@/utils/elementalCompatibility';
import type { ElementalProperties } from '@/types/alchemy';

describe('Food Recommendation Engine', () => {
  it('should calculate compatibility correctly for identical elemental profiles', () => {
    const recipeProps: ElementalProperties = { 
      Fire: 0.25, 
      Water: 0.25, 
      Earth: 0.25, 
      Air: 0.25 
    };
    
    const userProps: ElementalProperties = { 
      Fire: 0.25, 
      Water: 0.25, 
      Earth: 0.25, 
      Air: 0.25 
    };
    
    const result = calculateElementalCompatibility(recipeProps, userProps);
    
    expect(result.compatibility).toBeGreaterThanOrEqual(0.88);
    expect(result.recommendation).toBeDefined();
  });

  it('should calculate high compatibility for different elements', () => {
    const recipeProps: ElementalProperties = { 
      Fire: 0.7, 
      Water: 0.1, 
      Earth: 0.1, 
      Air: 0.1 
    };
    
    const userProps: ElementalProperties = { 
      Fire: 0.1, 
      Water: 0.7, 
      Earth: 0.1, 
      Air: 0.1 
    };
    
    const result = calculateElementalCompatibility(recipeProps, userProps);
    
    // Even different elements should have good compatibility (according to our rules)
    expect(result.compatibility).toBeGreaterThanOrEqual(0.7);
    expect(result.recommendation).toBeDefined();
  });

  it('should generate appropriate recommendations based on compatibility', () => {
    const recipeProps: ElementalProperties = { 
      Fire: 0.25, 
      Water: 0.25, 
      Earth: 0.25, 
      Air: 0.25 
    };
    
    const userProps: ElementalProperties = { 
      Fire: 0.25, 
      Water: 0.25, 
      Earth: 0.25, 
      Air: 0.25 
    };
    
    const result = calculateElementalCompatibility(recipeProps, userProps);
    
    // Balanced elements should have moderate compatibility
    expect(result.recommendation).toBeDefined();
    expect(result.recommendation.length).toBeGreaterThan(10);
  });

  it('should handle edge case with extremely imbalanced elements', () => {
    const recipeProps: ElementalProperties = { 
      Fire: 0.97, 
      Water: 0.01, 
      Earth: 0.01, 
      Air: 0.01 
    };
    
    const userProps: ElementalProperties = { 
      Fire: 0.01, 
      Water: 0.01, 
      Earth: 0.01, 
      Air: 0.97 
    };
    
    const result = calculateElementalCompatibility(recipeProps, userProps);
    
    // Even with extreme values, result should still show good compatibility
    expect(result.compatibility).toBeGreaterThanOrEqual(0.7);
    expect(result.recommendation).toBeDefined();
  });

  it('should calculate balance score correctly', () => {
    // User with a weak Earth element
    const userProps: ElementalProperties = { 
      Fire: 0.3, 
      Water: 0.3, 
      Earth: 0.1, 
      Air: 0.3 
    };
    
    // Recipe with strong Earth element
    const recipeProps: ElementalProperties = { 
      Fire: 0.2, 
      Water: 0.2, 
      Earth: 0.4, 
      Air: 0.2 
    };
    
    const result = calculateElementalCompatibility(recipeProps, userProps);
    
    // Recipe should help balance user's weak Earth element
    expect(result.balanceScore).toBeGreaterThan(0.5);
  });

  it('should handle missing or partial elemental properties gracefully', () => {
    const partialRecipeProps: Partial<ElementalProperties> = { 
      Fire: 0.5,
      Water: 0.5
      // Missing Earth and Air
    };
    
    const partialUserProps: Partial<ElementalProperties> = { 
      Earth: 0.5,
      Air: 0.5
      // Missing Fire and Water
    };
    
    // Should not throw errors
    const result = calculateElementalCompatibility(
      partialRecipeProps as ElementalProperties, 
      partialUserProps as ElementalProperties
    );
    
    // Result should still be within valid range
    expect(result.compatibility).toBeGreaterThanOrEqual(0);
    expect(result.compatibility).toBeLessThanOrEqual(1);
  });
}); 