import { _logger } from "@/lib/logger";
import type { GroceryItem, MealSlot, WeeklyMenu } from "@/types/menuPlanner";
import {
  INSERT_TEMPLATE_SQL,
  SELECT_MENU_SQL,
  SELECT_TEMPLATES_SQL,
  UPSERT_MENU_SQL,
} from "./menuPersistenceQueries";

const isServerWithDB = (): boolean => typeof window === "undefined" && !!process.env.DATABASE_URL;

let dbModule: typeof import("@/lib/database") | null = null;
const getDbModule = async () => {
  if (!dbModule && isServerWithDB()) {
    try {
      dbModule = await import("@/lib/database");
    } catch (_error) {
      _logger.warn("Database module not available for menu persistence");
    }
  }
  return dbModule;
};

export interface PersistedWeeklyMenu {
  id: string;
  weekStartDate: Date;
  meals: MealSlot[];
  groceryList: GroceryItem[];
  inventory: string[];
  weeklyBudget: number | null;
  isTemplate: boolean;
  templateName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertMenuInput {
  weekStartDate: Date;
  meals: MealSlot[];
  groceryList: GroceryItem[];
  inventory: string[];
  weeklyBudget: number | null;
}

interface WeeklyMenuRow {
  id: string;
  week_start_date: Date | string;
  meals: unknown;
  grocery_list: unknown;
  inventory: unknown;
  weekly_budget: number | null;
  is_template: boolean;
  template_name: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function mapRowToPersistedMenu(row: WeeklyMenuRow): PersistedWeeklyMenu {
  return {
    id: row.id,
    weekStartDate: new Date(row.week_start_date),
    meals: parseJsonField<MealSlot[]>(row.meals, []),
    groceryList: parseJsonField<GroceryItem[]>(row.grocery_list, []),
    inventory: parseJsonField<string[]>(row.inventory, []),
    weeklyBudget: row.weekly_budget,
    isTemplate: row.is_template,
    templateName: row.template_name,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

class MenuPersistenceService {
  async getMenu(
    userId: string,
    weekStartDate: Date,
  ): Promise<PersistedWeeklyMenu | null> {
    const db = await getDbModule();
    if (!db) return null;

    const result = await db.executeQuery<WeeklyMenuRow>(SELECT_MENU_SQL, [
      userId,
      weekStartDate,
    ]);

    const [row] = result.rows;
    if (!row) return null;
    return mapRowToPersistedMenu(row);
  }

  async upsertMenu(
    userId: string,
    menuData: UpsertMenuInput,
  ): Promise<PersistedWeeklyMenu> {
    const db = await getDbModule();
    if (!db) {
      throw new Error("Database is not available");
    }

    const result = await db.executeQuery<WeeklyMenuRow>(UPSERT_MENU_SQL, [
      userId,
      menuData.weekStartDate,
      JSON.stringify(menuData.meals),
      JSON.stringify(menuData.groceryList),
      JSON.stringify(menuData.inventory),
      menuData.weeklyBudget,
    ]);

    const [row] = result.rows;
    if (!row) {
      throw new Error("upsertMenu: returning row missing");
    }
    return mapRowToPersistedMenu(row);
  }

  async saveTemplate(
    userId: string,
    templateData: {
      name: string;
      menu: UpsertMenuInput;
    },
  ): Promise<PersistedWeeklyMenu> {
    const db = await getDbModule();
    if (!db) {
      throw new Error("Database is not available");
    }

    const result = await db.executeQuery<WeeklyMenuRow>(INSERT_TEMPLATE_SQL, [
      userId,
      templateData.menu.weekStartDate,
      JSON.stringify(templateData.menu.meals),
      JSON.stringify(templateData.menu.groceryList),
      JSON.stringify(templateData.menu.inventory),
      templateData.menu.weeklyBudget,
      templateData.name,
    ]);

    const [row] = result.rows;
    if (!row) {
      throw new Error("saveTemplate: returning row missing");
    }
    return mapRowToPersistedMenu(row);
  }

  async getTemplates(userId: string): Promise<PersistedWeeklyMenu[]> {
    const db = await getDbModule();
    if (!db) return [];

    const result = await db.executeQuery<WeeklyMenuRow>(SELECT_TEMPLATES_SQL, [
      userId,
    ]);

    return result.rows.map((row) => mapRowToPersistedMenu(row));
  }
}

export type MenuPayload = WeeklyMenu & {
  inventory?: string[];
  weeklyBudget?: number | null;
};

export const menuPersistenceService = new MenuPersistenceService();
