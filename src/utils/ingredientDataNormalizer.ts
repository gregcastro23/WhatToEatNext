import type { IngredientMapping } from '@/types/alchemy';
import { isNutritionalProfile } from '@/types/guards';

// ========== INGREDIENT DATA NORMALIZATION UTILITIES ==========

/**
 * Normalize vitamin data to a consistent format
 * Handles both array format ['c', 'k'] and object format {B12: 0.85, niacin: 0.43}
 */
export function normalizeVitamins(vitamins: Record<string, unknown>): Array<{ name: string; value?: number; unit?: string }> {
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
export function normalizeMinerals(minerals: Record<string, unknown>): Array<{ name: string; value?: number; unit?: string }> {
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
export function normalizeCulinaryApplications(applications: Record<string, unknown>): Record<string, any> {
  if (!applications || typeof applications !== 'object') return {};
  
  const normalized: Record<string, any> = {};
  
  Object.entries(applications).forEach(([method, data]) => {
    normalized[formatCulinaryMethod(method)] = normalizeCulinaryMethod(data);
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
function normalizeCulinaryMethod(data: Record<string, unknown>): any {
  if (!data) return {};
  
  return {
    notes: Array.isArray(data.notes) ? data.notes : (data.notes ? [data.notes] : []),
    techniques: Array.isArray(data.techniques) ? data.techniques : (data.techniques ? [data.techniques] : []),
    dishes: Array.isArray(data.dishes) ? data.dishes : (data.dishes ? [data.dishes] : []),
    tips: Array.isArray(data.tips) ? data.tips : (data.tips ? [data.tips] : [])
  };
}

/**
 * Normalize varieties data
 */
export function normalizeVarieties(varieties: Record<string, unknown>): Record<string, any> {
  if (!varieties || typeof varieties !== 'object') return {};
  
  const normalized: Record<string, any> = {};
  
  Object.entries(varieties).forEach(([variety, data]) => {
    normalized[formatVarietyName(variety)] = normalizeVarietyData(data);
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
function normalizeVarietyData(data: Record<string, unknown>): any {
  if (!data || typeof data !== 'object') return {};
  
  return {
    appearance: data.appearance || '',
    texture: data.texture || '',
    flavor: data.flavor || data.flavour || '',
    bestUses: Array.isArray(data.best_uses) ? data.best_uses : 
              Array.isArray(data.bestUses) ? data.bestUses :
              (data.best_uses || data.bestUses ? [data.best_uses || data.bestUses] : []),
    notes: data.notes || '',
    origin: data.origin || '',
    storage: data.storage || '',
    ripening: data.ripening || ''
  };
}

/**
 * Normalize storage information
 */
export function normalizeStorage(storage: Record<string, unknown>): any {
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
export function normalizePreparation(preparation: Record<string, unknown>): any {
  if (!preparation) return {};
  
  if (typeof preparation === 'string') {
    return { notes: preparation };
  }
  
  return {
    washing: preparation.washing || '',
    peeling: preparation.peeling || '',
    cutting: preparation.cutting || '',
    cooking: preparation.cooking || '',
    tips: Array.isArray(preparation.tips) ? preparation.tips : 
          (preparation.tips ? [preparation.tips] : []),
    notes: preparation.notes || ''
  };
}

/**
 * Main ingredient normalization function
 */
export function normalizeIngredientData(ingredient: Record<string, unknown>): any {
  if (!ingredient) return null;

  // Narrow the nutritionalProfile using type-guard when possible.
  const rawProfile = (ingredient as any).nutritionalProfile;
  const nutritionalProfile = isNutritionalProfile(rawProfile)
    ? {
        ...rawProfile,
        vitamins: normalizeVitamins((rawProfile as any).vitamins),
        minerals: normalizeMinerals((rawProfile as any).minerals),
        antioxidants: normalizeAntioxidants((rawProfile as any).antioxidants)
      }
    : undefined;

  const normalized = {
    ...ingredient,
    nutritionalProfile,
    culinaryApplications: normalizeCulinaryApplications((ingredient as any).culinaryApplications),
    varieties: normalizeVarieties((ingredient as any).varieties),
    storage: normalizeStorage((ingredient as any).storage),
    preparation: normalizePreparation((ingredient as any).preparation)
  };
  
  return normalized;
}

/**
 * Safe getter for nutritional data
 */
export function safeGetNutritionalData(ingredient: Record<string, unknown>, field: string): any {
  try {
    return ingredient?.nutritionalProfile?.[field] || null;
  } catch (error) {
    // console.warn(`Error accessing nutritional field ${field}:`, error);
    return null;
  }
}

/**
 * Check if ingredient has rich nutritional data
 */
export function hasRichNutritionalData(ingredient: Record<string, unknown>): boolean {
  const profile = ingredient?.nutritionalProfile;
  if (!profile) return false;
  
  const hasVitamins = profile.vitamins && (
    Array.isArray(profile.vitamins) ? profile.vitamins.length > 0 :
    Object.keys(profile.vitamins).length > 0
  );
  
  const hasMinerals = profile.minerals && (
    Array.isArray(profile.minerals) ? profile.minerals.length > 0 :
    Object.keys(profile.minerals).length > 0
  );
  
  const hasAntioxidants = profile.antioxidants && (
    Array.isArray(profile.antioxidants) ? profile.antioxidants.length > 0 :
    Object.keys(profile.antioxidants).length > 0
  );
  
  return hasVitamins || hasMinerals || hasAntioxidants;
}

// Local fallback formatters (the centralized utils don't currently export these)
export function formatVitaminName(name: string): string {
  if (!name) return '';
  return String(name)
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

export function formatMineralName(name: string): string {
  return formatVitaminName(name);
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