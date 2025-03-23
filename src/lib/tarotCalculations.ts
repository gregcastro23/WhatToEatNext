import { 
  TAROT_CARDS, 
  DECAN_TO_TAROT, 
  MAJOR_ARCANA, 
  PLANET_TO_MAJOR_ARCANA,
  DECAN_RULERS 
} from '@/constants/tarotCards';
import { ZodiacSign, Decan } from '@/types/alchemy';
import { DECANS } from '@/constants/elementalConstants';
import { 
  tarotCardQuantumValues, 
  getTarotCardElement, 
  getTarotCardPlanet 
} from '@/constants/planetaryElements';

export function getCurrentDecan(date: Date, sunPosition?: { sign: string, degree: number }): string {
  if (sunPosition && sunPosition.sign && typeof sunPosition.degree === 'number') {
    // Calculate the absolute degree in the zodiac (0-360)
    const signToStartDegree: Record<string, number> = {
      'Aries': 0,
      'Taurus': 30,
      'Gemini': 60,
      'Cancer': 90,
      'Leo': 120,
      'Virgo': 150,
      'Libra': 180,
      'Scorpio': 210,
      'Sagittarius': 240,
      'Capricorn': 270,
      'Aquarius': 300,
      'Pisces': 330
    };
    
    // Get the starting degree for the sun's sign
    const signStartDegree = signToStartDegree[sunPosition.sign] || 0;
    
    // Add the degree within the sign
    const absoluteDegree = signStartDegree + sunPosition.degree;
    
    // Get the decan range (each has a 10 degree span)
    const decanStart = Math.floor(absoluteDegree / 10) * 10;
    const decanEnd = decanStart + 10;
    
    return `${decanStart}-${decanEnd}`;
  }
  
  // Fallback to date-based calculation if no sun position is provided
  // Calculate day of year (0-365)
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Convert day of year to approximate degree in the zodiac (0-360)
  // Each day is roughly 360/365 ≈ 0.986 degrees
  const approxDegree = Math.floor((dayOfYear * 360) / 365);
  
  // Get the decan ranges (each has a 10 degree span)
  const decanStart = Math.floor(approxDegree / 10) * 10;
  const decanEnd = decanStart + 10;
  
  return `${decanStart}-${decanEnd}`;
}

export function getTarotCardForDate(date: Date) {
  const decan = getCurrentDecan(date);
  const cardKey = DECAN_TO_TAROT[decan];
  return TAROT_CARDS[cardKey] || TAROT_CARDS['10_of_cups'];
}

export function getRecipesForTarotCard(card) {
  if (!card) return [];
  return card.associatedRecipes || [];
}

export function getMajorArcanaForDecan(decan: string) {
  const decanRuler = DECAN_RULERS[decan];
  const cardKey = PLANET_TO_MAJOR_ARCANA[decanRuler];
  return MAJOR_ARCANA[cardKey];
}

// Minor arcana cards (numbered cards + court cards)
const minorArcana = [
  // Wands (Fire)
  'Ace of Wands', 'Two of Wands', 'Three of Wands', 'Four of Wands', 'Five of Wands',
  'Six of Wands', 'Seven of Wands', 'Eight of Wands', 'Nine of Wands', 'Ten of Wands',
  'Page of Wands', 'Knight of Wands', 'Queen of Wands', 'King of Wands',
  
  // Cups (Water)
  'Ace of Cups', 'Two of Cups', 'Three of Cups', 'Four of Cups', 'Five of Cups',
  'Six of Cups', 'Seven of Cups', 'Eight of Cups', 'Nine of Cups', 'Ten of Cups',
  'Page of Cups', 'Knight of Cups', 'Queen of Cups', 'King of Cups',
  
  // Pentacles (Earth)
  'Ace of Pentacles', 'Two of Pentacles', 'Three of Pentacles', 'Four of Pentacles', 'Five of Pentacles',
  'Six of Pentacles', 'Seven of Pentacles', 'Eight of Pentacles', 'Nine of Pentacles', 'Ten of Pentacles',
  'Page of Pentacles', 'Knight of Pentacles', 'Queen of Pentacles', 'King of Pentacles',
  
  // Swords (Air)
  'Ace of Swords', 'Two of Swords', 'Three of Swords', 'Four of Swords', 'Five of Swords',
  'Six of Swords', 'Seven of Swords', 'Eight of Swords', 'Nine of Swords', 'Ten of Swords',
  'Page of Swords', 'Knight of Swords', 'Queen of Swords', 'King of Swords'
];

// Major arcana cards
const majorArcana = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
  'Judgement', 'The World'
];

// Keywords for minor arcana
const minorArcanaKeywords: Record<string, string[]> = {
  'Ace of Wands': ['inspiration', 'new energy', 'spark', 'potential'],
  'Two of Wands': ['planning', 'discovery', 'future vision', 'choice'],
  'Three of Wands': ['expansion', 'foresight', 'overseas opportunities'],
  'Four of Wands': ['celebration', 'harmony', 'home', 'community'],
  'Five of Wands': ['competition', 'conflict', 'diversity', 'tension'],
  'Six of Wands': ['victory', 'recognition', 'achievement', 'pride'],
  'Seven of Wands': ['defense', 'perseverance', 'challenge', 'standing ground'],
  'Eight of Wands': ['speed', 'movement', 'communication', 'travel'],
  'Nine of Wands': ['resilience', 'courage', 'persistence', 'last stand'],
  'Ten of Wands': ['burden', 'responsibility', 'hard work', 'completion'],
  'Page of Wands': ['exploration', 'excitement', 'freedom', 'potential'],
  'Knight of Wands': ['energy', 'passion', 'adventure', 'impulsiveness'],
  'Queen of Wands': ['courage', 'determination', 'joy', 'vibrancy'],
  'King of Wands': ['leadership', 'vision', 'entrepreneur', 'honor'],
  
  // Cups
  'Ace of Cups': ['emotional new beginning', 'intuition', 'love', 'compassion'],
  'Two of Cups': ['partnership', 'attraction', 'connection', 'harmony'],
  'Three of Cups': ['celebration', 'friendship', 'community', 'joy'],
  'Four of Cups': ['contemplation', 'apathy', 'reevaluation', 'discontent'],
  'Five of Cups': ['loss', 'grief', 'disappointment', 'regret'],
  'Six of Cups': ['nostalgia', 'childhood', 'innocence', 'joy'],
  'Seven of Cups': ['choices', 'fantasy', 'illusion', 'dreams'],
  'Eight of Cups': ['walking away', 'disillusionment', 'leaving behind'],
  'Nine of Cups': ['satisfaction', 'contentment', 'gratitude', 'wish fulfillment'],
  'Ten of Cups': ['harmony', 'happiness', 'alignment', 'family'],
  'Page of Cups': ['creative beginnings', 'intuitive messages', 'curiosity'],
  'Knight of Cups': ['romance', 'charm', 'imagination', 'beauty'],
  'Queen of Cups': ['compassion', 'calm', 'emotional security', 'intuition'],
  'King of Cups': ['emotional balance', 'generosity', 'control', 'diplomacy'],
  
  // Pentacles
  'Ace of Pentacles': ['opportunity', 'prosperity', 'new venture', 'abundance'],
  'Two of Pentacles': ['balance', 'adaptability', 'time management', 'prioritization'],
  'Three of Pentacles': ['teamwork', 'collaboration', 'learning', 'implementation'],
  'Four of Pentacles': ['security', 'control', 'conservation', 'frugality'],
  'Five of Pentacles': ['hardship', 'loss', 'isolation', 'worry'],
  'Six of Pentacles': ['generosity', 'charity', 'giving', 'receiving'],
  'Seven of Pentacles': ['assessment', 'patience', 'investment', 'growth'],
  'Eight of Pentacles': ['diligence', 'knowledge', 'detail', 'skill'],
  'Nine of Pentacles': ['luxury', 'self-sufficiency', 'culmination', 'rewards'],
  'Ten of Pentacles': ['legacy', 'inheritance', 'establishment', 'wealth'],
  'Page of Pentacles': ['ambition', 'desire', 'diligence', 'learning'],
  'Knight of Pentacles': ['efficiency', 'hard work', 'responsibility', 'practicality'],
  'Queen of Pentacles': ['nurturing', 'practical', 'abundance', 'nature'],
  'King of Pentacles': ['abundance', 'prosperity', 'security', 'discipline'],
  
  // Swords
  'Ace of Swords': ['clarity', 'breakthrough', 'new idea', 'truth'],
  'Two of Swords': ['decision', 'stalemate', 'blocked emotions', 'avoidance'],
  'Three of Swords': ['heartbreak', 'grief', 'sorrow', 'rejection'],
  'Four of Swords': ['rest', 'restoration', 'contemplation', 'recuperation'],
  'Five of Swords': ['conflict', 'tension', 'defeat', 'win at all costs'],
  'Six of Swords': ['transition', 'leaving behind', 'moving on', 'gradual change'],
  'Seven of Swords': ['deception', 'strategy', 'resourcefulness', 'sneakiness'],
  'Eight of Swords': ['restriction', 'imprisonment', 'victim mentality', 'helplessness'],
  'Nine of Swords': ['anxiety', 'worry', 'fear', 'depression'],
  'Ten of Swords': ['painful endings', 'deep wounds', 'betrayal', 'loss'],
  'Page of Swords': ['curiosity', 'restlessness', 'mental energy', 'new ideas'],
  'Knight of Swords': ['action', 'impulsiveness', 'defending beliefs', 'rushing in'],
  'Queen of Swords': ['independent', 'unbiased judgment', 'clear boundaries', 'direct'],
  'King of Swords': ['intellectual', 'authority', 'truth', 'ethical']
};

// Keywords for major arcana
const majorArcanaKeywords: Record<string, string[]> = {
  'The Fool': ['beginnings', 'innocence', 'spontaneity', 'free spirit'],
  'The Magician': ['manifestation', 'resourcefulness', 'power', 'inspired action'],
  'The High Priestess': ['intuition', 'sacred knowledge', 'divine feminine', 'subconscious'],
  'The Empress': ['femininity', 'beauty', 'nature', 'abundance'],
  'The Emperor': ['authority', 'structure', 'control', 'fatherhood'],
  'The Hierophant': ['spiritual wisdom', 'tradition', 'conformity', 'morality'],
  'The Lovers': ['love', 'harmony', 'choices', 'alignment'],
  'The Chariot': ['control', 'willpower', 'success', 'determination'],
  'Strength': ['courage', 'persuasion', 'influence', 'compassion'],
  'The Hermit': ['soul-searching', 'introspection', 'guidance', 'solitude'],
  'Wheel of Fortune': ['change', 'cycles', 'fate', 'turning point'],
  'Justice': ['fairness', 'truth', 'cause and effect', 'law'],
  'The Hanged Man': ['surrender', 'letting go', 'new perspective', 'sacrifice'],
  'Death': ['endings', 'change', 'transformation', 'transition'],
  'Temperance': ['balance', 'moderation', 'patience', 'purpose'],
  'The Devil': ['shadow self', 'attachment', 'addiction', 'restriction'],
  'The Tower': ['sudden change', 'revelation', 'upheaval', 'awakening'],
  'The Star': ['hope', 'faith', 'purpose', 'renewal'],
  'The Moon': ['illusion', 'fear', 'anxiety', 'subconscious'],
  'The Sun': ['positivity', 'fun', 'warmth', 'success'],
  'Judgement': ['reflection', 'reckoning', 'awakening', 'rebirth'],
  'The World': ['completion', 'accomplishment', 'travel', 'harmony']
};

// Map major arcana to planets
const majorArcanaPlanets: Record<string, string> = {
  'The Magician': 'Mercury',
  'The High Priestess': 'Moon',
  'The Empress': 'Venus',
  'The Emperor': 'Mars',
  'The Hierophant': 'Jupiter',
  'The Lovers': 'Venus',
  'The Chariot': 'Moon',
  'Strength': 'Sun',
  'The Hermit': 'Saturn',
  'Wheel of Fortune': 'Jupiter',
  'Justice': 'Venus',
  'The Hanged Man': 'Neptune',
  'Death': 'Pluto',
  'Temperance': 'Jupiter',
  'The Devil': 'Saturn',
  'The Tower': 'Mars',
  'The Star': 'Uranus',
  'The Moon': 'Moon',
  'The Sun': 'Sun',
  'Judgement': 'Pluto',
  'The World': 'Saturn',
  'The Fool': 'Uranus'
};

// Map minor arcana to elements
const minorArcanaElements: Record<string, string> = {};

// Fill in the elements for all minor arcana cards
minorArcana.forEach(card => {
  if (card.includes('Wands')) {
    minorArcanaElements[card] = 'Fire';
  } else if (card.includes('Cups')) {
    minorArcanaElements[card] = 'Water';
  } else if (card.includes('Pentacles')) {
    minorArcanaElements[card] = 'Earth';
  } else if (card.includes('Swords')) {
    minorArcanaElements[card] = 'Air';
  }
});

interface TarotCard {
    name: string;
    suit: string;
    number: number;
    keywords: string[];
    quantum: number;
}

interface MajorArcanaCard {
    name: string;
    planet: string;
    keywords: string[];
}

/**
 * Get the tarot cards for a specific date
 * Each date corresponds to a specific minor and major arcana card
 */
export const getTarotCardsForDate = (date: Date, sunPosition?: { sign: string, degree: number }): { minorCard: TarotCard, majorCard: MajorArcanaCard } => {
  // Get the current decan based on the day of the year or sun position if provided
  const decan = getCurrentDecan(date, sunPosition);
  
  // Get minor arcana card key from the decan mapping
  const minorArcanaKey = DECAN_TO_TAROT[decan];
  
  if (!minorArcanaKey) {
    console.warn(`No tarot card found for decan ${decan}, using default`);
  }
  
  // Log the decan, sun position, and selected card for debugging
  console.log(`Tarot Card Debug - Decan: ${decan}, Sun Position:`, sunPosition, `Selected Card: ${minorArcanaKey || '10_of_cups'}`);
  
  // Get the minor arcana card details
  const cardKey = minorArcanaKey || '10_of_cups'; // Default if not found
  const tarotCard = TAROT_CARDS[cardKey];
  
  // Extract suit and number from the card name
  const nameParts = tarotCard.name.split(' of ');
  const suit = nameParts[1];
  const numberStr = nameParts[0];
  
  // Convert number string to actual number
  let number;
  if (numberStr === 'Ace') {
    number = 1;
  } else if (numberStr === 'Page') {
    number = 11;
  } else if (numberStr === 'Knight') {
    number = 12;
  } else if (numberStr === 'Queen') {
    number = 13;
  } else if (numberStr === 'King') {
    number = 14;
  } else {
    number = parseInt(numberStr, 10);
  }
  
  // Create the minor card object
  const minorCard: TarotCard = {
    name: tarotCard.name,
    suit,
    number,
    keywords: tarotCard.keywords,
    quantum: number // Using the card number as quantum value
  };
  
  // For major arcana, get the planet ruling the current decan
  const decanRuler = DECAN_RULERS[decan];
  
  // Map the planet to corresponding major arcana card
  const majorArcanaName = PLANET_TO_MAJOR_ARCANA[decanRuler] || 'The Fool'; // Default
  
  // Create the major card object
  const majorCard: MajorArcanaCard = {
    name: majorArcanaName,
    planet: decanRuler || 'Sun', // Default to Sun if no planet found
    keywords: majorArcanaKeywords[majorArcanaName] || []
  };
  
  return { minorCard, majorCard };
};

export function getQuantumValueForCard(card: any): number {
  if (typeof card.quantum === 'number') {
    return card.quantum;
  }
  
  switch (card.quantum) {
    case 'spirit':
    case 'essence':
    case 'substance':
    case 'matter':
      return 4;
    default:
      return 0;
  }
}

export function getElementalQuantum(card) {
  if (!card) return 0;
  
  const quantumValue = getQuantumValueForCard(card);
  return {
    element: card.element,
    quantum: quantumValue
  };
}

export function getRecipeFiltersFromTarot(tarotCards: { minorCard: any, majorCard: any }) {
  const filters = {
    elementalProperties: {},
    keywords: [],
    associatedRecipes: []
  };

  // Add minor card influences
  if (tarotCards.minorCard) {
    filters.elementalProperties[tarotCards.minorCard.element] = 1;
    filters.keywords.push(...tarotCards.minorCard.keywords);
    if (tarotCards.minorCard.associatedRecipes) {
      filters.associatedRecipes.push(...tarotCards.minorCard.associatedRecipes);
    }
  }

  // Add major card influences
  if (tarotCards.majorCard) {
    filters.elementalProperties[tarotCards.majorCard.element] = 
      (filters.elementalProperties[tarotCards.majorCard.element] || 0) + 0.5;
  }

  return filters;
}

/**
 * Gets detailed food and recipe recommendations based on the current tarot cards
 * @param date The date to get recommendations for
 * @returns Object with food recommendations and insights
 */
export const getTarotFoodRecommendations = (date: Date): {
  element: string;
  foodElement: string;
  recommendedRecipes: string[];
  cookingApproach: string;
  flavors: string[];
  insights: string;
} => {
  const { minorCard, majorCard } = getTarotCardsForDate(date);
  const decan = getCurrentDecan(date);
  const decanRuler = DECAN_RULERS[decan];
  
  // Get the primary element from the minor card
  const primaryElement = minorCard.suit === 'Wands' ? 'Fire' :
                        minorCard.suit === 'Cups' ? 'Water' :
                        minorCard.suit === 'Pentacles' ? 'Earth' :
                        minorCard.suit === 'Swords' ? 'Air' : 'Neutral';
  
  // Map elements to food categories
  const foodElementMap: Record<string, string> = {
    'Fire': 'Spicy, grilled, and energetic foods',
    'Water': 'Fluid, soothing, and emotional foods',
    'Earth': 'Hearty, grounding, and nourishing foods',
    'Air': 'Light, varied, and intellectually stimulating foods'
  };
  
  // Get tarot card details
  const tarotCard = Object.values(TAROT_CARDS).find(card => 
    card.name.toLowerCase() === minorCard.name.toLowerCase()
  );
  
  // Get recommended recipes from the tarot card
  const recommendedRecipes = tarotCard?.associatedRecipes || [];
  
  // Determine cooking approach based on card number
  let cookingApproach = '';
  if (minorCard.number <= 3) {
    cookingApproach = 'Begin new culinary adventures, experiment with novel ingredients';
  } else if (minorCard.number <= 6) {
    cookingApproach = 'Focus on balanced, harmonious meals that bring people together';
  } else if (minorCard.number <= 9) {
    cookingApproach = 'Refine your techniques, perfect your skills, or overcome cooking challenges';
  } else {
    cookingApproach = 'Complete cooking projects, share your culinary knowledge, or bring meals to completion';
  }
  
  // Determine flavors based on planetary ruler
  const planetaryFlavorMap: Record<string, string[]> = {
    'Sun': ['bright', 'clear', 'citrusy'],
    'Moon': ['mild', 'comforting', 'creamy'],
    'Mercury': ['varied', 'complex', 'herbal'],
    'Venus': ['sweet', 'harmonious', 'balanced'],
    'Mars': ['spicy', 'bold', 'pungent'],
    'Jupiter': ['rich', 'generous', 'expansive'],
    'Saturn': ['earthy', 'structured', 'traditional'],
    'Uranus': ['unexpected', 'innovative', 'surprising'],
    'Neptune': ['subtle', 'mysterious', 'elusive'],
    'Pluto': ['intense', 'transformative', 'powerful']
  };
  
  const flavors = planetaryFlavorMap[decanRuler] || ['balanced', 'seasonal', 'appropriate'];
  
  // Create insights text
  const insights = `Today, the ${minorCard.name} suggests ${minorCard.keywords.join(', ')} energy, 
    which pairs well with ${foodElementMap[primaryElement]}. 
    The planetary influence of ${decanRuler} adds ${flavors.join(', ')} qualities to your dishes. 
    ${cookingApproach}.`;
  
  return {
    element: primaryElement,
    foodElement: foodElementMap[primaryElement],
    recommendedRecipes,
    cookingApproach,
    flavors,
    insights
  };
}; 