// ========== INGREDIENT DATA NORMALIZATION UTILITIES ==========

/**
 * Normalize vitamin data to a consistent format
 * Handles both array format ['c', 'k'] and object format {B12: 0.85, niacin: 0.43}
 */
export function normalizeVitamins(
  vitamins: Record<string, unknown>
): Array<{ name: string; value?: number; unit?: string }> {
  if (!vitamins) return [];
  // If it's already an array of strings
  if (Array.isArray(vitamins)) {
    return vitamins.map(vitamin => ({
      name: formatVitaminName(vitamin),
      value: undefined,
      unit: undefined
    }));
  }

  // If it's an object with values
  if (typeof vitamins === 'object') {
    return Object.entries(vitamins).map(([name, value]) => ({
      name: formatVitaminName(name),
      value: typeof value === 'number' ? value : undefined,
      unit: typeof value === 'number' ? 'mg' : undefined
    }));
  }

  return [];
}

/**
 * Normalize mineral data to a consistent format
 */
export function normalizeMinerals(
  minerals: Record<string, unknown>
): Array<{ name: string; value?: number; unit?: string }> {
  if (!minerals) return [];
  // If it's already an array of strings
  if (Array.isArray(minerals)) {
    return minerals.map(mineral => ({
      name: formatMineralName(mineral),
      value: undefined,
      unit: undefined
    }));
  }

  // If it's an object with values
  if (typeof minerals === 'object') {
    return Object.entries(minerals).map(([name, value]) => ({
      name: formatMineralName(name),
      value: typeof value === 'number' ? value : undefined,
      unit: typeof value === 'number' ? 'mg' : undefined
    }));
  }

  return [];
}

/**
 * Format vitamin names for consistent display
 */
export function formatVitaminName(name: string): string {
  if (!name) return '';
  const vitaminName = name.toString().toLowerCase();

  // Handle common vitamin formats
  const vitaminMap: Record<string, string> = {
    a: 'Vitamin A',
    b1: 'Vitamin B1 (Thiamine)',
    b2: 'Vitamin B2 (Riboflavin)',
    b3: 'Vitamin B3 (Niacin)',
    b6: 'Vitamin B6 (Pyridoxine)',
    b12: 'Vitamin B12 (Cobalamin)',
    c: 'Vitamin C',
    d: 'Vitamin D',
    e: 'Vitamin E',
    k: 'Vitamin K',
    folate: 'Folate',
    niacin: 'Niacin (B3)',
    thiamine: 'Thiamine (B1)',
    riboflavin: 'Riboflavin (B2)',
    pyridoxine: 'Pyridoxine (B6)',
    cobalamin: 'Cobalamin (B12)',
    biotin: 'Biotin',
    pantothenic_acid: 'Pantothenic Acid'
  };
  return vitaminMap[vitaminName] || `Vitamin ${name.toUpperCase()}`;
}

/**
 * Format mineral names for consistent display
 */
export function formatMineralName(name: string): string {
  if (!name) return '';
  const mineralName = name.toString().toLowerCase();

  // Handle common mineral formats
  const mineralMap: Record<string, string> = {
    calcium: 'Calcium',
    iron: 'Iron',
    magnesium: 'Magnesium',
    phosphorus: 'Phosphorus',
    potassium: 'Potassium',
    sodium: 'Sodium',
    zinc: 'Zinc',
    copper: 'Copper',
    manganese: 'Manganese',
    selenium: 'Selenium',
    iodine: 'Iodine',
    chromium: 'Chromium',
    molybdenum: 'Molybdenum'
  };
  return mineralMap[mineralName] || name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Normalize antioxidant data
 */
export function normalizeAntioxidants(antioxidants: Record<string, unknown>): string[] {
  if (!antioxidants) return [];
  if (Array.isArray(antioxidants)) {
    return antioxidants.map(antioxidant => formatAntioxidantName(antioxidant));
  }

  if (typeof antioxidants === 'object') {
    return Object.keys(antioxidants).map(name => formatAntioxidantName(name));
  }

  return [];
}

/**
 * Format antioxidant names for display
 */
function formatAntioxidantName(name: string): string {
  if (!name) return '';

  // Convert snake_case and camelCase to proper names
  return name
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

/**
 * Normalize culinary applications data
 */
export function normalizeCulinaryApplications()
  applications: Record<string, unknown>
): Record<string, unknown> {
  if (!applications || typeof applications !== 'object') return {};

  const normalized: Record<string, unknown> = {};

  Object.entries(applications).forEach(([method, data]) => {
    normalized[formatCulinaryMethod(method)] = normalizeCulinaryMethod(data as Record<string, unknown>);
  });

  return normalized;
}

/**
 * Format culinary method names
 */
function formatCulinaryMethod(method: string): string {
  return method
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

/**
 * Normalize individual culinary method data
 */
function normalizeCulinaryMethod(data: Record<string, unknown>): {
  notes: unknown[];
  techniques: unknown[];
  dishes: unknown[];
  tips: unknown[];
} {
  if (!data) return { notes: [], techniques: [], dishes: [], tips: [] };

  return { notes: Array.isArray(data.notes) ? data.notes , data.notes ? [data.notes] : [],
    techniques: Array.isArray(data.techniques)
      ? data.techniques
      : data.techniques
        ? [data.techniques]
        : [],
    dishes: Array.isArray(data.dishes) ? data.dishes : data.dishes ? [data.dishes] : [],
    tips: Array.isArray(data.tips) ? data.tips : data.tips ? [data.tips] : []
  };
}

/**
 * Normalize varieties data
 */
export function normalizeVarieties(varieties: Record<string, unknown>): Record<string, unknown> {
  if (!varieties || typeof varieties !== 'object') return {};

  const normalized: Record<string, unknown> = {};

  Object.entries(varieties).forEach(([variety, data]) => {
    normalized[formatVarietyName(variety)] = normalizeVarietyData(data as Record<string, unknown>);
  });

  return normalized;
}

/**
 * Format variety names
 */
function formatVarietyName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

/**
 * Normalize variety data
 */
function normalizeVarietyData(data: Record<string, unknown>): {
  appearance: unknown;
  texture: unknown;
  flavor: unknown;
  bestUses: unknown[];
  notes: unknown;
  origin: unknown;
  storage: unknown;
  ripening: unknown
} {
  if (!data || typeof data !== 'object') {
    return {
      appearance: '',
      texture: '',
      flavor: '',
      bestUses: [],
      notes: '',
      origin: '',
      storage: '',
      ripening: ''
    };
  }

  return {
    appearance: data.appearance || '',
    texture: data.texture || '',
    flavor: data.flavor || data.flavour || '',
    bestUses: Array.isArray(data.best_uses)
      ? data.best_uses
      : Array.isArray(data.bestUses)
        ? data.bestUses
        : data.best_uses || data.bestUses
          ? [data.best_uses || data.bestUses]
          : [],
    notes: data.notes || '',
    origin: data.origin || '',
    storage: data.storage || '',
    ripening: data.ripening || ''
  };
}

/**
 * Normalize storage information
 */
export function normalizeStorage(storage: Record<string, unknown>): Record<string, unknown> {
  if (!storage) return {};

  if (typeof storage === 'string') {
    return { notes: storage };
  }

  return {
    temperature: storage.temperature || '',
    duration: storage.duration || '',
    humidity: storage.humidity || '',
    container: storage.container || '',
    notes: storage.notes || '',
    fresh: storage.fresh || {},
    frozen: storage.frozen || {},
    dried: storage.dried || {}
  };
}

/**
 * Normalize preparation information
 */
export function normalizePreparation()
  preparation: Record<string, unknown>
): Record<string, unknown> {
  if (!preparation) return {};

  if (typeof preparation === 'string') {
    return { notes: preparation };
  }

  return {
    washing: preparation.washing || '',
    peeling: preparation.peeling || '',
    cutting: preparation.cutting || '',
    cooking: preparation.cooking || '',
    tips: Array.isArray(preparation.tips)
      ? preparation.tips
      : preparation.tips
        ? [preparation.tips]
        : [],
    notes: preparation.notes || ''
  };
}

/**
 * Main ingredient normalization function
 */
export function normalizeIngredientData()
  ingredient: Record<string, unknown>
): Record<string, unknown> | null {
  if (!ingredient) return null;

  // Safe type casting for nutritional profile
  const nutritionalProfile = typeof ingredient.nutritionalProfile === 'object' && ingredient.nutritionalProfile !== null;
      ? (ingredient.nutritionalProfile as Record<string, unknown>)
      : {};

  const normalized = {
    ...ingredient,
    nutritionalProfile: typeof ingredient.nutritionalProfile === 'object' && ingredient.nutritionalProfile !== null
        ? {
            ...(nutritionalProfile || {}),
            vitamins: normalizeVitamins()
              typeof nutritionalProfile.vitamins === 'object' ||
                Array.isArray(nutritionalProfile.vitamins)
                ? (nutritionalProfile.vitamins as Record<string, unknown>)
                : {}
            ),
            minerals: normalizeMinerals()
              typeof nutritionalProfile.minerals === 'object' ||
                Array.isArray(nutritionalProfile.minerals)
                ? (nutritionalProfile.minerals as Record<string, unknown>)
                : {}
            ),
            antioxidants: normalizeAntioxidants()
              typeof nutritionalProfile.antioxidants === 'object' ||
                Array.isArray(nutritionalProfile.antioxidants)
                ? (nutritionalProfile.antioxidants as Record<string, unknown>)
                : {}
            )
          }
        : undefined,
    culinaryApplications: typeof ingredient.culinaryApplications === 'object' &&
      ingredient.culinaryApplications !== null
        ? normalizeCulinaryApplications(ingredient.culinaryApplications as Record<string, unknown>)
        : {},
    varieties: typeof ingredient.varieties === 'object' && ingredient.varieties !== null
        ? normalizeVarieties(ingredient.varieties as Record<string, unknown>)
        : {},
    storage: typeof ingredient.storage === 'object' && ingredient.storage !== null
        ? normalizeStorage(ingredient.storage as Record<string, unknown>)
        : {},
    preparation: typeof ingredient.preparation === 'object' && ingredient.preparation !== null
        ? normalizePreparation(ingredient.preparation as Record<string, unknown>)
        : {}
  };

  return normalized;
}

/**
 * Safe getter for nutritional data
 */
export function safeGetNutritionalData()
  ingredient: Record<string, unknown>,
  field: string
): unknown {
  try {
    const profile = ingredient.nutritionalProfile as any;
    return profile[field] || null;
  } catch (error) {
    // logger.warn(`Error accessing nutritional field ${field}:`, error)
    return null;
  }
}

/**
 * Check if ingredient has rich nutritional data
 */
export function hasRichNutritionalData(ingredient: Record<string, unknown>): boolean {
  const profile = ingredient.nutritionalProfile as any;
  if (!profile) return false;
  const vitamins = profile.vitamins as Record<string, unknown> | unknown[];
  const hasVitamins =
    vitamins && (Array.isArray(vitamins) ? vitamins.length > 0 : Object.keys(vitamins).length > 0);
  const minerals = profile.minerals as Record<string, unknown> | unknown[];
  const hasMinerals =
    minerals && (Array.isArray(minerals) ? minerals.length > 0 : Object.keys(minerals).length > 0);
  const antioxidants = profile.antioxidants as Record<string, unknown> | unknown[];
  const hasAntioxidants = antioxidants &&;
    (Array.isArray(antioxidants) ? antioxidants.length > 0 : Object.keys(antioxidants).length > 0);
  return hasVitamins || hasMinerals || hasAntioxidants;
}

export default {
  normalizeIngredientData,
  normalizeVitamins,
  normalizeMinerals,
  normalizeAntioxidants,
  normalizeCulinaryApplications,
  normalizeVarieties,
  normalizeStorage,
  normalizePreparation,
  safeGetNutritionalData,
  hasRichNutritionalData,
  formatVitaminName,
  formatMineralName
};
