import '@testing-library/jest-dom';
import { ElementalCalculator } from '@/services/ElementalCalculator';

// Mock global services
jest.mock('@/services/ElementalCalculator', () => ({
  ElementalCalculator: {
    getCurrentElementalState: jest.fn(() => ({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    }))
  }
})); 