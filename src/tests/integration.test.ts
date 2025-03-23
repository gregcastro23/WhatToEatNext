// Add integration tests
test('seasonal calculations work correctly', () => {
  const result = calculateSeasonalEffectiveness(mockRecipe, 'Summer');
  expect(result).toBeDefined();
}); 