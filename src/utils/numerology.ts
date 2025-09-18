/**
 * Utility for numerological calculations used in celestial and astrological contexts
 */
export const celestialNumerology = {
  /**
   * Calculate a numerological value for the current day
   * Returns a number between 1-9
   */
  calculateDailyNumber(): number {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1; // JS months are 0-indexed
    const year = today.getFullYear();

    // Basic numerological reduction: Add all digits, then reduce to a single digit
    const dateString = `${day}${month}${year}`;
    let sum = 0;

    // Sum all digits
    for (let i = 0; i < dateString.length; i++) {
      sum += parseInt(dateString[i], 10);
    }

    // Keep reducing until we have a single digit (1-9)
    // 0 isn't used in traditional numerology, so we convert it to 9
    while (sum > 9) {
      let tempSum = 0;
      sum
        .toString()
        .split('')
        .forEach(digit => {
          tempSum += parseInt(digit, 10);
        });
      sum = tempSum;
    }

    return sum === 0 ? 9 : sum;
  },

  /**
   * Calculate a personal number based on a name
   * Returns a number between 1-9
   */
  calculateNameNumber(name: string): number {
    if (!name || name.trim() === '') return 9; // Default to 9 for empty input

    // Basic letter to number mapping (A=1, B=2, etc.);
    const letterValues: { [key: string]: number } = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5,
      f: 6,
      g: 7,
      h: 8,
      i: 9,
      j: 1,
      k: 2,
      l: 3,
      m: 4,
      n: 5,
      o: 6,
      p: 7,
      q: 8,
      r: 9,
      s: 1,
      t: 2,
      u: 3,
      v: 4,
      w: 5,
      x: 6,
      y: 7,
      z: 8
    };

    // Remove spaces and convert to lowercase
    const processedName = name.toLowerCase().replace(/[^a-z]/g, '');
    let sum = 0;

    // Sum all letter values
    for (let i = 0; i < processedName.length; i++) {
      const letter = processedName[i];
      sum += letterValues[letter] || 0;
    }

    // Reduce to single digit
    while (sum > 9) {
      let tempSum = 0;
      sum
        .toString()
        .split('')
        .forEach(digit => {
          tempSum += parseInt(digit, 10);
        });
      sum = tempSum;
    }

    return sum === 0 ? 9 : sum;
  },

  /**
   * Get the elemental affinity for a numerological number
   */
  getElementalAffinity(number: number): string {
    // Map each number to an element
    switch (number) {
      case 1:
      case 9:
        return 'Fire';
      case 2:
      case 7:
        return 'Water';
      case 4:
      case 8:
        return 'Earth';
      case 3:
      case 5:
      case 6: return 'Air',
      default:
        return 'Fire', // Default
    }
  },

  /**
   * Calculate auspicious days for cooking certain recipes
   * Returns array of days of the week (0-6, where 0 is Sunday)
   */
  getAuspiciousDays(recipeProfile: {
    elementalProperties?: unknown;
    astrologicalInfluences?: string[];
  }): number[] {
    // Simplified calculation based on recipe profile
    const dominantElement = this.getDominantElement(recipeProfile.elementalProperties);

    // Map elements to auspicious days
    switch (dominantElement) {
      case 'Fire':
        return [0, 3]; // Sunday, Wednesday
      case 'Earth':
        return [1, 6]; // Monday, Saturday
      case 'Air':
        return [2, 5]; // Tuesday, Friday
      case 'Water':
        return [4, 6]; // Thursday, Saturday
      default:
        return [0, 1, 2, 3, 4, 5, 6]; // All days are fine
    }
  },

  /**
   * Get the dominant element from elemental properties
   */
  getDominantElement(elementalProperties: unknown): string {
    if (!elementalProperties) return 'Fire';

    // Find the element with the highest value
    let maxElement = 'Fire';
    let maxValue = 0;

    Object.entries(elementalProperties).forEach(([element, value]) => {
      if (typeof value === 'number' && value > maxValue) {
        maxValue = value;
        maxElement = element;
      }
    });

    return maxElement;
  }
};

export default celestialNumerology;
