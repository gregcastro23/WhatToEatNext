import '@testing-library/jest-dom';
import { ElementalCalculator } from '@/services/ElementalCalculator';

// Mock global services
jest.mock('@/services/ElementalCalculator', () => ({
  ElementalCalculator: {
    getCurrentElementalState: jest.fn().mockReturnValue({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    })
  }
}));

// Add a simple test so the file doesn't fail with "no tests" error
test('setup is working correctly', () => {
  expect(ElementalCalculator.getCurrentElementalState()).toEqual({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  });
}); 