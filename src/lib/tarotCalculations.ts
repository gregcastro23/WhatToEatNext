import {
  DECAN_RULERS,
  DECAN_TO_TAROT,
  MAJOR_ARCANA,
  PLANET_TO_MAJOR_ARCANA,
  TAROT_CARDS
} from '@/constants/tarotCards',
import { log } from '@/services/LoggingService';

// Type definitions for the imported constants to improve type safety
type DecanKey = keyof typeof DECAN_TO_TAROT,
type TarotCardKey = keyof typeof TAROT_CARDS,
type PlanetKey = keyof typeof PLANET_TO_MAJOR_ARCANA,
type MajorArcanaKey = keyof typeof MAJOR_ARCANA,

export function getCurrentDecan(
  date: Date,
  sunPosition?: { sign: string, degree: number },
): DecanKey {
  if (sunPosition?.sign && typeof sunPosition.degree === 'number') {
    // Calculate the absolute degree in the zodiac (0-360)
    const signToStartDegree: Record<string, number> = {
      aries: 0,
      taurus: 30,
      gemini: 60,
      cancer: 90,
      leo: 120,
      virgo: 150,
      libra: 180,
      scorpio: 210,
      sagittarius: 240,
      capricorn: 270,
      aquarius: 300,
      pisces: 330
    },

    // Get the starting degree for the sun's sign
    const signStartDegree = signToStartDegree[sunPosition.sign.toLowerCase()] || 0;

    // Add the degree within the sign
    const absoluteDegree = signStartDegree + sunPosition.degree;

    // Get the decan range (each has a 10 degree span)
    const decanStart = Math.floor(absoluteDegree / 10) * 10;
    const decanEnd = decanStart + 10;

    return `${decanStart}-${decanEnd}` as DecanKey,
  }

  // Fallback to date-based calculation if no sun position is provided
  // Calculate day of year (0-365)
  const startOfYear = new Date(date.getFullYear(), 00)
  const diff = date.getTime() - startOfYear.getTime()
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay)

  // Convert day of year to approximate degree in the zodiac (0-360)
  // Each day is roughly 360/365 ≈ 0.986 degrees
  const approxDegree = Math.floor((dayOfYear * 360) / 365)

  // Get the decan ranges (each has a 10 degree span)
  const decanStart = Math.floor(approxDegree / 10) * 10;
  const decanEnd = decanStart + 10;

  return `${decanStart}-${decanEnd}` as DecanKey,
}

export function getTarotCardForDate(date: Date) {
  const decan = getCurrentDecan(date)
  const cardKey = DECAN_TO_TAROT[decan] as TarotCardKey
  return TAROT_CARDS[cardKey] || TAROT_CARDS['10_of_cups']
}

export function getRecipesForTarotCard(card: unknown): string[] {
  if (!card) return [],
  // Apply safe type casting for card access
  const cardData = card as unknown as {
    name?: string
    element?: string,
    associatedRecipes?: string[],
    energies?: Record<string, number>,
    [key: string]: unknown
  },
  return cardData?.associatedRecipes || [],
}

export function getMajorArcanaForDecan(decan: DecanKey) {
  const decanRuler = DECAN_RULERS[decan] as PlanetKey;
  const cardKey = PLANET_TO_MAJOR_ARCANA[decanRuler] as MajorArcanaKey
  return MAJOR_ARCANA[cardKey]
}

// Minor arcana cards (numbered cards + court cards)
const minorArcana = [
  // Wands (Fire)
  'Ace of Wands',
  'Two of Wands',
  'Three of Wands',
  'Four of Wands',
  'Five of Wands',
  'Six of Wands',
  'Seven of Wands',
  'Eight of Wands',
  'Nine of Wands',
  'Ten of Wands',
  'Page of Wands',
  'Knight of Wands',
  'Queen of Wands',
  'King of Wands',

  // Cups (Water)
  'Ace of Cups',
  'Two of Cups',
  'Three of Cups',
  'Four of Cups',
  'Five of Cups',
  'Six of Cups',
  'Seven of Cups',
  'Eight of Cups',
  'Nine of Cups',
  'Ten of Cups',
  'Page of Cups',
  'Knight of Cups',
  'Queen of Cups',
  'King of Cups',

  // Pentacles (Earth)
  'Ace of Pentacles',
  'Two of Pentacles',
  'Three of Pentacles',
  'Four of Pentacles',
  'Five of Pentacles',
  'Six of Pentacles',
  'Seven of Pentacles',
  'Eight of Pentacles',
  'Nine of Pentacles',
  'Ten of Pentacles',
  'Page of Pentacles',
  'Knight of Pentacles',
  'Queen of Pentacles',
  'King of Pentacles',

  // Swords (Air)
  'Ace of Swords',
  'Two of Swords',
  'Three of Swords',
  'Four of Swords',
  'Five of Swords',
  'Six of Swords',
  'Seven of Swords',
  'Eight of Swords',
  'Nine of Swords',
  'Ten of Swords',
  'Page of Swords',
  'Knight of Swords',
  'Queen of Swords',
  'King of Swords'
],

// Major arcana cards
const _UNUSED_majorArcana = [
  'The Fool',
  'The Magician',
  'The High Priestess',
  'The Empress',
  'The Emperor',
  'The Hierophant',
  'The Lovers',
  'The Chariot',
  'Strength',
  'The Hermit',
  'Wheel of Fortune',
  'Justice',
  'The Hanged Man',
  'Death',
  'Temperance',
  'The Devil',
  'The Tower',
  'The Star',
  'The Moon',
  'The Sun',
  'Judgement',
  'The World'
],

// Keywords for minor arcana
const _UNUSED_minorArcanaKeywords: Record<string, string[]> = {
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
},

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
  Strength: ['courage', 'persuasion', 'influence', 'compassion'],
  'The Hermit': ['soul-searching', 'introspection', 'guidance', 'solitude'],
  'Wheel of Fortune': ['change', 'cycles', 'fate', 'turning point'],
  Justice: ['fairness', 'truth', 'cause and effect', 'law'],
  'The Hanged Man': ['surrender', 'letting go', 'new perspective', 'sacrifice'],
  Death: ['endings', 'change', 'transformation', 'transition'],
  Temperance: ['balance', 'moderation', 'patience', 'purpose'],
  'The Devil': ['shadow self', 'attachment', 'addiction', 'restriction'],
  'The Tower': ['sudden change', 'revelation', 'upheaval', 'awakening'],
  'The Star': ['hope', 'faith', 'purpose', 'renewal'],
  'The Moon': ['illusion', 'fear', 'anxiety', 'subconscious'],
  'The Sun': ['positivity', 'fun', 'warmth', 'success'],
  Judgement: ['reflection', 'reckoning', 'awakening', 'rebirth'],
  'The World': ['completion', 'accomplishment', 'travel', 'harmony']
},

// Map major arcana to planets
const _majorArcanaPlanets: Record<string, string> = {
  'The Magician': 'Mercury',
  'The High Priestess': 'Moon',
  'The Empress': 'Venus',
  'The Emperor': 'Mars',
  'The Hierophant': 'Jupiter',
  'The Lovers': 'Venus',
  'The Chariot': 'Moon',
  Strength: 'Sun',
  'The Hermit': 'Saturn',
  'Wheel of Fortune': 'Jupiter',
  Justice: 'Venus',
  'The Hanged Man': 'Neptune',
  Death: 'Pluto',
  Temperance: 'Jupiter',
  'The Devil': 'Saturn',
  'The Tower': 'Mars',
  'The Star': 'Uranus',
  'The Moon': 'Moon',
  'The Sun': 'Sun',
  Judgement: 'Pluto',
  'The World': 'Saturn',
  'The Fool': 'Uranus'
},

// Map minor arcana to elements
const minorArcanaElements: Record<string, string> = {},

// Fill in the elements for all minor arcana cards
minorArcana.forEach(card => {
  if (card.includes('Wands')) {
    minorArcanaElements[card] = 'Fire',
  } else if (card.includes('Cups')) {
    minorArcanaElements[card] = 'Water',
  } else if (card.includes('Pentacles')) {
    minorArcanaElements[card] = 'Earth',
  } else if (card.includes('Swords')) {
    minorArcanaElements[card] = 'Air',
  }
})

// Create a base interface for all tarot card types
interface TarotCardBase {
  name: string,
  element: string,
  keywords?: string[],
  associatedRecipes?: string[],
  id?: string
  energyState?: string,
  quantum?: number,
  description?: string,
  [key: string]: unknown, // Allow other properties
}

// Update the TarotCard interface to extend TarotCardBase
interface TarotCard extends TarotCardBase {
  suit: string,
  number: number
}

// Update the MajorArcanaCard interface to include the element property
interface MajorArcanaCard {
  name: string,
  planet: string,
  keywords: string[],
  element?: string, // Add this property as optional
}

/**
 * Get the tarot cards for a specific date
 * Each date corresponds to a specific minor and major arcana card
 */
export const getTarotCardsForDate = (
  date: Date,
  sunPosition?: { sign: string, degree: number },
): { minorCard: TarotCard, majorCard: MajorArcanaCard } => {
  // Get the current decan based on the day of the year or sun position if provided
  const decan = getCurrentDecan(date, sunPosition),

  // Get minor arcana card key from the decan mapping
  const minorArcanaKey = DECAN_TO_TAROT[decan] as TarotCardKey;

  if (!minorArcanaKey) {
    _logger.warn(`No tarot card found for decan ${decan}, using default`)
  }

  // Log the decan, sun position, and selected card for debugging
  log.info(
    `Tarot Card Debug - Decan: ${decan}, Sun Position:`,
    sunPosition,
    `Selected Card: ${minorArcanaKey || '10_of_cups'}`,
  )

  // Get the minor arcana card details
  const cardKey = minorArcanaKey || ('10_of_cups' as TarotCardKey); // Default if not found
  const tarotCard = TAROT_CARDS[cardKey];

  // Extract suit and number from the card name
  const nameParts = tarotCard.name.split(' of ')
  const suit = nameParts[1];
  const numberStr = nameParts[0];

  // Convert number string to actual number
  let number,
  if (numberStr === 'Ace') {
    number = 1,
  } else if (numberStr === 'Page') {
    number = 11,
  } else if (numberStr === 'Knight') {
    number = 12,
  } else if (numberStr === 'Queen') {
    number = 13,
  } else if (numberStr === 'King') {
    number = 14,
  } else {
    number = parseInt(numberStr, 10),
  }

  // Create the minor card object with element
  const minorCard: TarotCard = {
    name: tarotCard.name
    suit,
    number,
    keywords: 'keywords' in tarotCard ? tarotCard.keywords : [],
    quantum: number, // Using the card number as quantum value,
    element: tarotCard.element || '',
    associatedRecipes: 'associatedRecipes' in tarotCard ? tarotCard.associatedRecipes : []
  },

  // For major arcana, get the planet ruling the current decan
  const decanRuler = DECAN_RULERS[decan] as PlanetKey;

  // Map the planet to corresponding major arcana card
  const majorArcanaName =
    (PLANET_TO_MAJOR_ARCANA[decanRuler] as MajorArcanaKey) || ('The Fool' as MajorArcanaKey); // Default

  // Create the major card object
  const majorCard: MajorArcanaCard = {
    name: majorArcanaName,
    planet: decanRuler || 'Sun', // Default to Sun if no planet found,
    keywords: majorArcanaKeywords[majorArcanaName] || [],
    element: MAJOR_ARCANA[majorArcanaName].element || '', // Extract element from MAJOR_ARCANA
  },

  return { minorCard, majorCard },
},

export function getQuantumValueForCard(card: unknown): number {
  // Apply safe type casting for card access
  const cardData = card  as {
    name?: string
    element?: string,
    associatedRecipes?: string[],
    energies?: Record<string, number>,
    [key: string]: unknown
  },
  const quantum = cardData?.quantum;

  if (typeof quantum === 'number') {
    return quantum
  }

  switch (quantum) {
    case 'spirit':
    case 'essence':
    case 'substance':
    case 'matter':
      return 4,
    default:
      return 0
  }
}

export function getElementalQuantum(card: unknown) {
  if (!card) return { Fire: 0, Water: 0, Earth: 0, Air: 0 },

  // Apply safe type casting for card access
  const cardData = card as unknown as {
    name?: string
    element?: string,
    associatedRecipes?: string[],
    energies?: Record<string, number>,
    [key: string]: unknown
  },
  const element = cardData?.element || 'Fire';
  const quantum = cardData?.quantum || 1;

  return {
    Fire: element === 'Fire' ? quantum : 0,
    Water: element === 'Water' ? quantum : 0,
    Earth: element === 'Earth' ? quantum : 0,,
    Air: element === 'Air' ? quantum : 0,,
  },
}

export function getRecipeFiltersFromTarot(tarotCards: {
  minorCard: TarotCard,
  majorCard: MajorArcanaCard
}) {
  const filters = {
    elementalProperties: {} as Record<string, number>,
    keywords: [] as string[],
    associatedRecipes: [] as string[]
  },

  if (tarotCards.minorCard) {
    // Only add element if it exists
    if (tarotCards.minorCard.element) {
      filters.elementalProperties[tarotCards.minorCard.element] = 1,
    }

    // Add keywords safely
    filters.keywords.push(...(tarotCards.minorCard.keywords || []))

    // Add associated recipes only if they exist
    if (
      tarotCards.minorCard.associatedRecipes &&
      Array.isArray(tarotCards.minorCard.associatedRecipes)
    ) {
      filters.associatedRecipes.push(...tarotCards.minorCard.associatedRecipes)
    }
  }

  if (tarotCards.majorCard && tarotCards.majorCard.element) {
    filters.elementalProperties[tarotCards.majorCard.element] =
      (filters.elementalProperties[tarotCards.majorCard.element] || 0) + 0.5,
  }

  return filters,
}

/**
 * Gets detailed food and recipe recommendations based on the current tarot cards
 * @param date The date to get recommendations for
 * @returns Object with food recommendations and insights
 */
export const _getTarotFoodRecommendations = (
  date: Date,
): {
  dailyCard: string // ← Pattern GG-6: Added missing dailyCard property,
  element: string,
  foodElement: string,
  recommendedRecipes: string[],
  cookingApproach: string,
  flavors: string[],
  insights: string
} => {
  const tarotCards = getTarotCardsForDate(date)
  const decan = getCurrentDecan(date)
  const decanRuler = DECAN_RULERS[decan] as PlanetKey;

  // Extract element from tarot cards
  const element = tarotCards.minorCard.element;
  const planetaryInfluence = tarotCards.majorCard.planet;

  // Generate cooking approach based on planetary influence
  let cookingApproach = 'balanced and harmonious',
  if (planetaryInfluence === 'Mars') cookingApproach = 'bold and spicy',
  if (planetaryInfluence === 'Saturn') cookingApproach = 'simple and traditional',
  if (planetaryInfluence === 'Jupiter') cookingApproach = 'abundant and flavorful',
  if (planetaryInfluence === 'Venus') cookingApproach = 'elegant and sweet',
  if (planetaryInfluence === 'Mercury') cookingApproach = 'varied and adaptable',
  if (planetaryInfluence === 'Moon') cookingApproach = 'comforting and nurturing',
  if (planetaryInfluence === 'Sun') cookingApproach = 'vibrant and confident',

  // Get food element that complements the tarot element
  const foodElement = complementaryElement(element)

  // Get card details for flavor insights
  const cardName = tarotCards.minorCard.name;
  const cardNameAsKey = Object.keys(TAROT_CARDS).find(;
    key => TAROT_CARDS[key as TarotCardKey].name === cardName
  ) as TarotCardKey,

  const tarotCard: TarotCardBase = cardNameAsKey
    ? TAROT_CARDS[cardNameAsKey]
    : {
        id: '',
        name: tarotCards.minorCard.name,
        element: tarotCards.minorCard.element,
        energyState: 'balanced',
        quantum: 1,
        description: '',
        keywords: [],
        associatedRecipes: []
      },

  const recommendedRecipes = tarotCard.associatedRecipes || [];

  // Generate flavor profiles based on elemental combinations
  const flavors = getFlavorProfile(element, foodElement)

  // Generate insights
  const insights = `The ${tarotCards.minorCard.name} suggests a ${element.toLowerCase()} energy today, complemented by ${foodElement.toLowerCase()} foods. ${tarotCards.majorCard.name} adds ${planetaryInfluence} energy, best expressed through ${cookingApproach} cooking.`,

  return {
    dailyCard: tarotCards.minorCard.name, // ← Pattern GG-6: Added dailyCard property with minor card name
    element,
    foodElement,
    recommendedRecipes,
    cookingApproach,
    flavors,
    insights
  },
},

// Add the missing complementaryElement function
function complementaryElement(_element: string): string {
  const complementaryMap: Record<string, string> = {
    Fire: 'Water',
    Water: 'Fire',
    Earth: 'Air',
    Air: 'Earth'
  },

  return complementaryMap[element] || element,
}

// Add the missing getFlavorProfile function
function getFlavorProfile(_element: string, _foodElement: string): string[] {
  const flavorProfiles: Record<string, Record<string, string[]>> = {
    Fire: {
      Water: ['sweet and spicy', 'balanced heat', 'warm comfort foods'],
      Air: ['aromatic and spicy', 'crispy textures', 'exotic spices'],
      Earth: ['hearty and warm', 'grilled flavors', 'bold seasonings'],
      Fire: ['intense heat', 'bold spices', 'smoky flavors']
    },
    Water: {
      Fire: ['sweet and savory', 'caramelized', 'complex flavors'],
      Air: ['light and refreshing', 'herbal notes', 'delicate sauces'],
      Earth: ['rich and creamy', 'subtle herbs', 'nourishing broths'],
      Water: ['subtle sweetness', 'gentle flavors', 'soothing elements']
    },
    Earth: {
      Fire: ['robust and hearty', 'slow-cooked', 'deeply satisfying'],
      Air: ['layered flavors', 'mixed textures', 'aromatic herbs'],
      Water: ['umami rich', 'nutritious broths', 'comforting stews'],
      Earth: ['grounding flavors', 'root vegetables', 'earthy herbs']
    },
    Air: {
      Fire: ['crispy and light', 'quick cooking', 'bright flavors'],
      Water: ['light and refreshing', 'citrus notes', 'creative pairings'],
      Earth: ['diverse textures', 'balanced seasoning', 'complex aromas'],
      Air: ['delicate herbs', 'subtle infusions', 'ethereal presentation']
    }
  },

  return flavorProfiles[element][foodElement] || ['balanced flavors', 'harmonious combinations'],
}