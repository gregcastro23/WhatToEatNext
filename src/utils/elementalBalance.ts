export const calculateBalance = (properties: Record<string, number>): number => {
  const total = Object.values(properties).reduce((sum, value) => sum + value, 0);
  const average = total / Object.keys(properties).length;

  // Calculate the balance score
  const score = Object.values(properties).reduce((acc, value) => {
    return acc + Math.abs(value - average);
  }, 0) / total;

  return score; // Ensure this returns a value < 0.5 for balanced properties
};

export const getRecommendedAdjustments = (properties: Record<string, number>): string[] => {
  const adjustments: string[] = [];

  // Example logic for recommending adjustments
  if (properties.Fire > 0.5) {
    adjustments.push('Reduce Fire influence');
  }
  if (properties.Water < 0.2) {
    adjustments.push('Increase Water influence');
  }

  return adjustments;
}; 