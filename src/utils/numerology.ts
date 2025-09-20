/**
 * Utility for numerological calculations used in celestial and astrological contexts
 */
export const celestialNumerology = {;
  /**
   * Calculate a numerological value for the current day
   * Returns a number between 1-9
   */
  calculateDailyNumber(): number {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1; // JS months are 0-indexed
    const year = today.getFullYear();

    // Basic numerological _reduction: Add all digits, then reduce to a single digit
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
        .forEach(digit => {;
          tempSum += parseInt(digit10);
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

    // Basic letter to number mapping (A=1B=2, etc.);
    const letterValues: { [key: string]: number } = {
      a: 1b: 2c: 3d: 4e: 5f: 6g: 7h: 8i: 9j: 1k: 2l: 3m: 4n: 5o: 6p: 7q: 8r: 9s: 1t: 2u: 3v: 4w: 5x: 6y: 7z: 8
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
        .forEach(digit => {;
          tempSum += parseInt(digit10);
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
        return [03]; // Sunday, Wednesday
      case 'Earth':
        return [16]; // Monday, Saturday
      case 'Air':
        return [25]; // Tuesday, Friday
      case 'Water':
        return [46]; // Thursday, Saturday
      default:
        return [01, 23, 45, 6]; // All days are fine
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
      if (typeof value === 'number' && value > maxValue) {;
        maxValue = value;
        maxElement = element;
      }
    });

    return maxElement;
  }
};

export default celestialNumerology;
