/**
 * The `weekly_menus` statements. This module has no runtime imports, so the
 * real-database gate (`scripts/checkMenuPersistenceSql.mjs`) runs exactly what
 * ships.
 *
 * `nutritional_totals` is written as `{}` and never read (owner ruling
 * 2026-09-27, option a). It never held totals.
 *
 * [MEASURED 2026-09-27, prod, read-only]
 * - 36 human menus stored `createInitialMenu`'s seven all-zero days, including
 *   34 days that had meals.
 * - 27 agent menus stored the flat, model-estimated
 *   `{calories, protein, carbs, fat}` that ASOL sent, with no stated basis.
 *   Since 2026-09-04 the agent route turned that object into seven zero days.
 * - Nothing read either shape: not the planner, and not ASOL's UI.
 *
 * Day totals are computed live from `meals`. The column stays (NOT NULL, no
 * default), and each existing row is overwritten with `{}` on its next save.
 */

/** Every column a menu read returns. `nutritional_totals` is deliberately absent. */
const MENU_COLUMNS = `id, week_start_date, meals, grocery_list, inventory, weekly_budget,
       is_template, template_name, created_at, updated_at`;

/** $1 user_id, $2 week_start_date. */
export const SELECT_MENU_SQL = `SELECT ${MENU_COLUMNS}
  FROM weekly_menus
 WHERE user_id = $1 AND week_start_date = $2 AND is_template = false
 LIMIT 1`;

/** $1 user_id, $2 week_start_date, $3 meals, $4 grocery_list, $5 inventory, $6 weekly_budget. */
export const UPSERT_MENU_SQL = `INSERT INTO weekly_menus (
    user_id, week_start_date, meals, nutritional_totals, grocery_list,
    inventory, weekly_budget, is_template, template_name
  )
  VALUES ($1, $2, $3::jsonb, '{}'::jsonb, $4::jsonb, $5::jsonb, $6, false, NULL)
  ON CONFLICT (user_id, week_start_date)
  DO UPDATE SET
    meals = EXCLUDED.meals,
    nutritional_totals = '{}'::jsonb,
    grocery_list = EXCLUDED.grocery_list,
    inventory = EXCLUDED.inventory,
    weekly_budget = EXCLUDED.weekly_budget,
    is_template = false,
    template_name = NULL,
    updated_at = CURRENT_TIMESTAMP
  RETURNING ${MENU_COLUMNS}`;

/**
 * $1 user_id, $2 week_start_date, $3 meals, $4 grocery_list, $5 inventory,
 * $6 weekly_budget, $7 template_name.
 */
export const INSERT_TEMPLATE_SQL = `INSERT INTO weekly_menus (
    user_id, week_start_date, meals, nutritional_totals, grocery_list,
    inventory, weekly_budget, is_template, template_name
  )
  VALUES ($1, $2, $3::jsonb, '{}'::jsonb, $4::jsonb, $5::jsonb, $6, true, $7)
  RETURNING ${MENU_COLUMNS}`;

/** $1 user_id. */
export const SELECT_TEMPLATES_SQL = `SELECT ${MENU_COLUMNS}
  FROM weekly_menus
 WHERE user_id = $1 AND is_template = true
 ORDER BY updated_at DESC`;
