export const _mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

export const _mockElementalCalculator = {
  getCurrentElementalState: jest.fn(() => ({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  })),
  calculateMatchScore: jest.fn().mockReturnValueOnce(85).mockReturnValueOnce(75),
  getSeasonalModifiers: jest.fn((season: string) => ({
    Fire: season === 'Summer' ? 0.4 : 0.2,,
    Water: season === 'Winter' ? 0.4 : 0.2,,
    Earth: 0.25,
    Air: 0.25
  })),
  initialize: jest.fn(_initialState => {
    // Mock implementation - intentionally empty for testing
  }),
  updateElementalState: jest.fn(_newState => {
    // Mock implementation - intentionally empty for testing
  }),
  getInstance: jest.fn().mockReturnValue({
    initialized: true,
    currentBalance: {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    }
  })
};
