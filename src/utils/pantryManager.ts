/**
 * Pantry Manager
 * Simple localStorage-based pantry tracking for Phase 3
 *
 * @file src/utils/pantryManager.ts
 * @created 2026-01-11 (Phase 3)
 */

import { createLogger } from "@/utils/logger";

const logger = createLogger("PantryManager");

const PANTRY_STORAGE_KEY = "alchm_pantry";

/**
 * Pantry item interface
 */
export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  addedDate: Date;
  expirationDate?: Date;
  notes?: string;
}

/**
 * Pantry statistics
 */
export interface PantryStats {
  totalItems: number;
  expiringIn7Days: number;
  expired: number;
  categoryCounts: Record<string, number>;
}

/**
 * Get all pantry items from localStorage
 *
 * @returns Array of pantry items
 */
export function getPantry(): PantryItem[] {
  try {
    const stored = localStorage.getItem(PANTRY_STORAGE_KEY);
    if (!stored) return [];

    const items = JSON.parse(stored);

    // Convert date strings back to Date objects
    return items.map((item: any) => ({
      ...item,
      addedDate: new Date(item.addedDate),
      expirationDate: item.expirationDate
        ? new Date(item.expirationDate)
        : undefined,
    }));
  } catch (error) {
    logger.error("Failed to load pantry from localStorage:", error);
    return [];
  }
}

/**
 * Save pantry items to localStorage
 *
 * @param items - Pantry items to save
 */
function savePantry(items: PantryItem[]): void {
  try {
    localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(items));
    logger.debug(`Saved ${items.length} items to pantry`);
  } catch (error) {
    logger.error("Failed to save pantry to localStorage:", error);
    throw new Error("Failed to save pantry");
  }
}

/**
 * Add item to pantry
 *
 * @param item - Item to add (without id, will be generated)
 * @returns The added item with generated id
 */
export function addItem(
  item: Omit<PantryItem, "id" | "addedDate"> & {
    addedDate?: Date;
  },
): PantryItem {
  try {
    const pantry = getPantry();

    // Check if item already exists
    const existingIndex = pantry.findIndex(
      (i) =>
        i.name.toLowerCase() === item.name.toLowerCase() &&
        i.unit === item.unit,
    );

    if (existingIndex >= 0) {
      // Update quantity of existing item
      pantry[existingIndex].quantity += item.quantity;
      savePantry(pantry);
      logger.info(`Updated existing pantry item: ${item.name}`);
      return pantry[existingIndex];
    }

    // Add new item
    const newItem: PantryItem = {
      ...item,
      id: generateId(),
      addedDate: item.addedDate || new Date(),
    };

    pantry.push(newItem);
    savePantry(pantry);

    logger.info(`Added new pantry item: ${item.name}`);
    return newItem;
  } catch (error) {
    logger.error("Failed to add item to pantry:", error);
    throw error;
  }
}

/**
 * Add multiple items to pantry
 *
 * @param items - Items to add
 * @returns Array of added items
 */
export function addItems(
  items: Array<
    Omit<PantryItem, "id" | "addedDate"> & {
      addedDate?: Date;
    }
  >,
): PantryItem[] {
  return items.map((item) => addItem(item));
}

/**
 * Remove item from pantry by id
 *
 * @param id - Item id to remove
 */
export function removeItem(id: string): void {
  try {
    const pantry = getPantry();
    const filtered = pantry.filter((item) => item.id !== id);

    if (filtered.length === pantry.length) {
      logger.warn(`Item with id ${id} not found in pantry`);
      return;
    }

    savePantry(filtered);
    logger.info(`Removed item from pantry: ${id}`);
  } catch (error) {
    logger.error("Failed to remove item from pantry:", error);
    throw error;
  }
}

/**
 * Remove item from pantry by name
 *
 * @param name - Item name to remove
 */
export function removeItemByName(name: string): void {
  try {
    const pantry = getPantry();
    const filtered = pantry.filter(
      (item) => item.name.toLowerCase() !== name.toLowerCase(),
    );

    if (filtered.length === pantry.length) {
      logger.warn(`Item with name "${name}" not found in pantry`);
      return;
    }

    savePantry(filtered);
    logger.info(`Removed item from pantry: ${name}`);
  } catch (error) {
    logger.error("Failed to remove item from pantry:", error);
    throw error;
  }
}

/**
 * Update item in pantry
 *
 * @param id - Item id to update
 * @param updates - Partial updates to apply
 */
export function updateItem(
  id: string,
  updates: Partial<Omit<PantryItem, "id">>,
): void {
  try {
    const pantry = getPantry();
    const index = pantry.findIndex((item) => item.id === id);

    if (index === -1) {
      logger.warn(`Item with id ${id} not found in pantry`);
      return;
    }

    pantry[index] = {
      ...pantry[index],
      ...updates,
    };

    savePantry(pantry);
    logger.info(`Updated pantry item: ${id}`);
  } catch (error) {
    logger.error("Failed to update item in pantry:", error);
    throw error;
  }
}

/**
 * Check if item exists in pantry (case-insensitive)
 *
 * @param name - Item name to check
 * @returns True if item exists
 */
export function hasItem(name: string): boolean {
  const pantry = getPantry();
  return pantry.some((item) => item.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get item from pantry by name (case-insensitive)
 *
 * @param name - Item name to find
 * @returns Item if found, undefined otherwise
 */
export function getItem(name: string): PantryItem | undefined {
  const pantry = getPantry();
  return pantry.find((item) => item.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get items by category
 *
 * @param category - Category to filter by
 * @returns Array of items in category
 */
export function getItemsByCategory(category: string): PantryItem[] {
  const pantry = getPantry();
  return pantry.filter(
    (item) => item.category.toLowerCase() === category.toLowerCase(),
  );
}

/**
 * Clear all items from pantry
 */
export function clearPantry(): void {
  try {
    localStorage.removeItem(PANTRY_STORAGE_KEY);
    logger.info("Cleared pantry");
  } catch (error) {
    logger.error("Failed to clear pantry:", error);
    throw error;
  }
}

/**
 * Get pantry statistics
 *
 * @returns Pantry statistics
 */
export function getPantryStats(): PantryStats {
  const pantry = getPantry();
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const stats: PantryStats = {
    totalItems: pantry.length,
    expiringIn7Days: 0,
    expired: 0,
    categoryCounts: {},
  };

  pantry.forEach((item) => {
    // Count by category
    stats.categoryCounts[item.category] =
      (stats.categoryCounts[item.category] || 0) + 1;

    // Check expiration
    if (item.expirationDate) {
      if (item.expirationDate < now) {
        stats.expired++;
      } else if (item.expirationDate < sevenDaysFromNow) {
        stats.expiringIn7Days++;
      }
    }
  });

  return stats;
}

/**
 * Get items expiring soon (within specified days)
 *
 * @param days - Number of days to check
 * @returns Array of items expiring within specified days
 */
export function getExpiringItems(days: number = 7): PantryItem[] {
  const pantry = getPantry();
  const now = new Date();
  const cutoffDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return pantry.filter((item) => {
    if (!item.expirationDate) return false;
    return item.expirationDate >= now && item.expirationDate <= cutoffDate;
  });
}

/**
 * Get expired items
 *
 * @returns Array of expired items
 */
export function getExpiredItems(): PantryItem[] {
  const pantry = getPantry();
  const now = new Date();

  return pantry.filter((item) => {
    if (!item.expirationDate) return false;
    return item.expirationDate < now;
  });
}

/**
 * Search pantry items by name (fuzzy search)
 *
 * @param query - Search query
 * @returns Array of matching items
 */
export function searchItems(query: string): PantryItem[] {
  const pantry = getPantry();
  const lowerQuery = query.toLowerCase();

  return pantry.filter((item) => item.name.toLowerCase().includes(lowerQuery));
}

/**
 * Export pantry to JSON
 *
 * @returns JSON string of pantry
 */
export function exportPantryJSON(): string {
  const pantry = getPantry();
  return JSON.stringify(pantry, null, 2);
}

/**
 * Import pantry from JSON
 *
 * @param jsonString - JSON string to import
 * @param merge - If true, merge with existing pantry; if false, replace
 */
export function importPantryJSON(
  jsonString: string,
  merge: boolean = false,
): void {
  try {
    const imported = JSON.parse(jsonString);

    if (!Array.isArray(imported)) {
      throw new Error("Invalid pantry data: expected array");
    }

    // Validate items
    const items: PantryItem[] = imported.map((item: any) => ({
      ...item,
      id: item.id || generateId(),
      addedDate: new Date(item.addedDate),
      expirationDate: item.expirationDate
        ? new Date(item.expirationDate)
        : undefined,
    }));

    if (merge) {
      const existing = getPantry();
      const merged = [...existing];

      items.forEach((item) => {
        const existingIndex = merged.findIndex((i) => i.id === item.id);
        if (existingIndex >= 0) {
          merged[existingIndex] = item;
        } else {
          merged.push(item);
        }
      });

      savePantry(merged);
      logger.info(`Merged ${items.length} items into pantry`);
    } else {
      savePantry(items);
      logger.info(`Imported ${items.length} items to pantry`);
    }
  } catch (error) {
    logger.error("Failed to import pantry:", error);
    throw error;
  }
}

/**
 * Generate unique id for pantry item
 *
 * @returns Unique id string
 */
function generateId(): string {
  return `pantry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Default pantry manager object (for backward compatibility)
 */
export const PantryManager = {
  getPantry,
  addItem,
  addItems,
  removeItem,
  removeItemByName,
  updateItem,
  hasItem,
  getItem,
  getItemsByCategory,
  clearPantry,
  getPantryStats,
  getExpiringItems,
  getExpiredItems,
  searchItems,
  exportPantryJSON,
  importPantryJSON,
};

export default PantryManager;
