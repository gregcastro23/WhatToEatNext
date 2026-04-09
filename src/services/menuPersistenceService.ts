import "server-only";

import type {
  DayOfWeek,
  DailyNutritionTotals,
  GroceryItem,
  MealSlot,
  WeeklyMenu,
} from "@/types/menuPlanner";
import { _logger } from "@/lib/logger";

const isServerWithDB = (): boolean => {
  return typeof window === "undefined" && !!process.env.DATABASE_URL;
};

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
  nutritionalTotals: Record<DayOfWeek, DailyNutritionTotals>;
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
  nutritionalTotals: Record<DayOfWeek, DailyNutritionTotals>;
  groceryList: GroceryItem[];
  inventory: string[];
  weeklyBudget: number | null;
}

interface WeeklyMenuRow {
  id: string;
  week_start_date: Date | string;
  meals: unknown;
  nutritional_totals: unknown;
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
    nutritionalTotals: parseJsonField<Record<DayOfWeek, DailyNutritionTotals>>(
      row.nutritional_totals,
      {} as Record<DayOfWeek, DailyNutritionTotals>,
    ),
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

    const result = await db.executeQuery<WeeklyMenuRow>(
      `SELECT id, week_start_date, meals, nutritional_totals, grocery_list,
              inventory, weekly_budget, is_template, template_name, created_at, updated_at
       FROM weekly_menus
       WHERE user_id = $1 AND week_start_date = $2 AND is_template = false
       LIMIT 1`,
      [userId, weekStartDate],
    );

    if (result.rows.length === 0) return null;
    return mapRowToPersistedMenu(result.rows[0] as WeeklyMenuRow);
  }

  async upsertMenu(
    userId: string,
    menuData: UpsertMenuInput,
  ): Promise<PersistedWeeklyMenu> {
    const db = await getDbModule();
    if (!db) {
      throw new Error("Database is not available");
    }

    const result = await db.executeQuery<WeeklyMenuRow>(
      `INSERT INTO weekly_menus (
         user_id,
         week_start_date,
         meals,
         nutritional_totals,
         grocery_list,
         inventory,
         weekly_budget,
         is_template,
         template_name
       )
       VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb, $7, false, NULL)
       ON CONFLICT (user_id, week_start_date)
       DO UPDATE SET
         meals = EXCLUDED.meals,
         nutritional_totals = EXCLUDED.nutritional_totals,
         grocery_list = EXCLUDED.grocery_list,
         inventory = EXCLUDED.inventory,
         weekly_budget = EXCLUDED.weekly_budget,
         is_template = false,
         template_name = NULL,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, week_start_date, meals, nutritional_totals, grocery_list,
                 inventory, weekly_budget, is_template, template_name, created_at, updated_at`,
      [
        userId,
        menuData.weekStartDate,
        JSON.stringify(menuData.meals),
        JSON.stringify(menuData.nutritionalTotals),
        JSON.stringify(menuData.groceryList),
        JSON.stringify(menuData.inventory),
        menuData.weeklyBudget,
      ],
    );

    return mapRowToPersistedMenu(result.rows[0] as WeeklyMenuRow);
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

    const result = await db.executeQuery<WeeklyMenuRow>(
      `INSERT INTO weekly_menus (
         user_id,
         week_start_date,
         meals,
         nutritional_totals,
         grocery_list,
         inventory,
         weekly_budget,
         is_template,
         template_name
       )
       VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb, $7, true, $8)
       ON CONFLICT (user_id, week_start_date)
       DO UPDATE SET
         meals = EXCLUDED.meals,
         nutritional_totals = EXCLUDED.nutritional_totals,
         grocery_list = EXCLUDED.grocery_list,
         inventory = EXCLUDED.inventory,
         weekly_budget = EXCLUDED.weekly_budget,
         is_template = true,
         template_name = EXCLUDED.template_name,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, week_start_date, meals, nutritional_totals, grocery_list,
                 inventory, weekly_budget, is_template, template_name, created_at, updated_at`,
      [
        userId,
        templateData.menu.weekStartDate,
        JSON.stringify(templateData.menu.meals),
        JSON.stringify(templateData.menu.nutritionalTotals),
        JSON.stringify(templateData.menu.groceryList),
        JSON.stringify(templateData.menu.inventory),
        templateData.menu.weeklyBudget,
        templateData.name,
      ],
    );

    return mapRowToPersistedMenu(result.rows[0] as WeeklyMenuRow);
  }

  async getTemplates(userId: string): Promise<PersistedWeeklyMenu[]> {
    const db = await getDbModule();
    if (!db) return [];

    const result = await db.executeQuery<WeeklyMenuRow>(
      `SELECT id, week_start_date, meals, nutritional_totals, grocery_list,
              inventory, weekly_budget, is_template, template_name, created_at, updated_at
       FROM weekly_menus
       WHERE user_id = $1 AND is_template = true
       ORDER BY updated_at DESC`,
      [userId],
    );

    return result.rows.map((row) => mapRowToPersistedMenu(row as WeeklyMenuRow));
  }
}

export type MenuPayload = WeeklyMenu & {
  inventory?: string[];
  weeklyBudget?: number | null;
};

export const menuPersistenceService = new MenuPersistenceService();
