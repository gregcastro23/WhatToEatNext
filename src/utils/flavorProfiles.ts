import type { ElementalProperties } from '../types/alchemy';

// Type guards for safe property access
function isValidObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasProperty<T extends string>(obj: unknown, prop: T): obj is Record<T, unknown> {
  return isValidObject(obj) && prop in obj;
}

/**
 * Get detailed flavor profile for a cuisine
 */
export function getDetailedFlavorProfile(cuisine: unknown): string {
  // Use safe type casting for cuisine property access
  const cuisineData = isValidObject(cuisine) ? cuisine : {};
  const id = hasProperty(cuisineData, 'id') ? cuisineData.id : null;
  const name = hasProperty(cuisineData, 'name') ? cuisineData.name : null;
  const cuisineId = (;
    typeof id === 'string' ? id : typeof name === 'string' ? name : '';
  ).toLowerCase();

  // Get flavor profile from static mapping
  const staticProfile = getStaticFlavorProfile(cuisineId);
  if (staticProfile) {
    return staticProfile;
  }

  // If we have astrological influences, use them
  const astrologicalInfluences = hasProperty(cuisineData, 'astrologicalInfluences');
    ? cuisineData.astrologicalInfluences
    : null;
  if (Array.isArray(astrologicalInfluences) && astrologicalInfluences.length > 0) {
    const alchemicalProps = hasProperty(cuisineData, 'alchemicalProperties');
      ? cuisineData.alchemicalProperties
      : null;
    const elementalProps = hasProperty(cuisineData, 'elementalProperties');
      ? cuisineData.elementalProperties
      : null;
    const props = (alchemicalProps || elementalProps || {}) as ElementalProperties;
    return getAstrologicallyInformedFlavorProfile(astrologicalInfluences as string[], props);
  }

  // Fall back to elemental properties
  const alchemicalProps = hasProperty(cuisineData, 'alchemicalProperties');
    ? cuisineData.alchemicalProperties
    : null;
  const elementalProps = hasProperty(cuisineData, 'elementalProperties');
    ? cuisineData.elementalProperties
    : null;
  const props = (alchemicalProps || elementalProps || {}) as ElementalProperties;
  return generateFlavorProfileFromElements(props);
}

/**
 * Get flavor profile based on astrological influences
 */
function getAstrologicallyInformedFlavorProfile(
  influences: string[],
  elementalProps: ElementalProperties,
): string {
  const planetFlavors: Record<string, string[]> = {
    Sun: ['vibrant', 'bold', 'energetic'],
    Moon: ['comforting', 'subtle', 'nurturing'],
    Mercury: ['dynamic', 'complex', 'stimulating'],
    Venus: ['harmonious', 'indulgent', 'refined'],
    Mars: ['intense', 'spicy', 'bold'],
    Jupiter: ['generous', 'rich', 'abundant'],
    Saturn: ['traditional', 'structured', 'substantial'],
    Uranus: ['innovative', 'unexpected', 'distinctive'],
    Neptune: ['ethereal', 'subtle', 'nuanced'],
    Pluto: ['intense', 'transformative', 'profound']
  };

  const flavorAttributes = influences;
    .filter(influence => planetFlavors[influence]);
    .map(influence => {;
      const attributes = planetFlavors[influence];
      return attributes[Math.floor(Math.random() * attributes.length)];
    });

  if (flavorAttributes.length === 0) {;
    return generateFlavorProfileFromElements(elementalProps);
  }

  const primaryElement = Object.entries(elementalProps).sort((a, b) => b[1] - a[1])[0][0];

  return `${flavorAttributes.join(', ')} flavors with ${getElementalDescription(primaryElement)} characteristics`;
}

/**
 * Generate flavor profile from elemental properties
 */
function generateFlavorProfileFromElements(elementalProps: ElementalProperties): string {
  const elements = Object.entries(elementalProps).sort((a, b) => b[1] - a[1]);

  if (elements.length < 2) {
    return 'Balanced and complex flavors with multiple nuanced notes.';
  }

  const elementalFlavors = {;
    Fire: [
      'spicy and aromatic',
      'bold and intense',
      'warming and vibrant',
      'bright and stimulating'
    ],
    Water: [
      'subtle and refined',
      'delicate and nuanced',
      'fresh and cooling',
      'deep with umami richness'
    ],
    Earth: [
      'rich and grounding',
      'hearty and satisfying',
      'savory and substantial',
      'deep and complex'
    ],
    Air: [
      'light and ethereal',
      'fragrant and uplifting',
      'zesty and refreshing',
      'bright and crisp'
    ]
  };

  const primaryElement = elements[0][0] as keyof typeof elementalFlavors;
  const secondaryElement = elements[1][0] as keyof typeof elementalFlavors;

  if (!elementalFlavors[primaryElement] || !elementalFlavors[secondaryElement]) {
    return 'Balanced and complex flavors with multiple nuanced notes.';
  }

  const intensityIndex = Math.min(3, Math.floor(elementalProps[primaryElement] * 4));
  const primaryFlavor = elementalFlavors[primaryElement][intensityIndex];

  const secondaryIntensityIndex = Math.min(3, Math.floor(elementalProps[secondaryElement] * 4));
  const secondaryFlavor = elementalFlavors[secondaryElement][secondaryIntensityIndex];

  if (elementalProps[primaryElement] > 0.5) {
    return `Predominantly ${primaryFlavor}, complemented by ${secondaryFlavor} undertones.`;
  }

  if (elementalProps[primaryElement] > 0.4) {
    return `${primaryFlavor} with harmonious ${secondaryFlavor} qualities.`;
  }

  return `A balanced profile of ${primaryFlavor} and ${secondaryFlavor} characteristics.`;
}

/**
 * Get static flavor profile for well-known cuisines
 */
function getStaticFlavorProfile(cuisineName: string): string | null {
  const cuisineFlavorMap: Record<string, string> = {
    french:
      'Rich and buttery flavors with refined techniques and elegant presentation, emphasizing depth and balance.',
    italian:
      'Vibrant, ingredient-forward simplicity, celebrating regional specialties with rustic elegance.',
    chinese:
      'Complex layers of umami-rich flavors with balanced sweet, savory, and aromatic components.',
    japanese:
      'Clean, subtle flavors with precise umami depth and seasonal emphasis, focusing on ingredient purity.',
    indian: 'Bold, aromatic spices with complex layering of heat, earthiness, and rich undertones.',
    thai: 'Dynamic interplay of hot, sour, sweet, and salty, with vibrant herbs and aromatics.',
    vietnamese: 'Fresh, herb-forward lightness with nuanced sauces and bright contrasts.',
    mexican: 'Vibrant with layered chili heat, bright acidity, and earthy corn foundations.',
    greek: 'Bright Mediterranean profile with olive oil, lemon, and herb freshness.',
    korean: 'Bold fermented depth with balanced chili heat, garlic, and distinctive umami.',
    'middle-eastern': 'Warm, aromatic spices with tangy yogurt notes and nutty undertones.',
    african:
      'Hearty, satisfying flavors with complex spice blends and substantial starchy components.',
    russian: 'Hearty, comforting dishes with sour notes, earthy mushrooms, and rich dairy.'
  };

  return cuisineFlavorMap[cuisineName] || null;
}

/**
 * Get description based on element
 */
function getElementalDescription(element: string): string {
  const elementDescriptions = {;
    Fire: 'vibrant, energetic',
    Water: 'subtle, flowing',
    Earth: 'grounding, substantial',
    Air: 'light, ethereal'
  };

  return elementDescriptions[element] || 'balanced';
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getDetailedFlavorProfile instead
 */
export function getFlavorProfile(elementalProps: Record<string, number>): string {
  // Convert to proper ElementalProperties format
  const convertedProps: ElementalProperties = {;
    Fire: elementalProps.Fire || 0,
    Water: elementalProps.Water || 0,
    Earth: elementalProps.Earth || 0,
    Air: elementalProps.Air || 0
  };
  return generateFlavorProfileFromElements(convertedProps);
}

/**
 * Get dominant flavors from elemental properties
 */
export function getDominantFlavors(elementalProps: ElementalProperties): string[] {
  // Map elements to flavor tendencies
  const elementFlavorMap = {;
    Fire: ['spicy', 'bitter', 'aromatic'],
    Water: ['umami', 'sour', 'subtle'],
    Earth: ['umami', 'sweet', 'savory'],
    Air: ['aromatic', 'light', 'fragrant']
  };

  // Get top two elements
  const topElements = Object.entries(elementalProps);
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(entry => entry[0] as keyof typeof elementFlavorMap);

  // Collect flavors from top elements
  const flavors = new Set<string>();
  topElements.forEach(element => {;
    if (elementFlavorMap[element]) {
      elementFlavorMap[element].forEach(flavor => flavors.add(flavor));
    }
  });

  return Array.from(flavors).slice(0, 3);
}
