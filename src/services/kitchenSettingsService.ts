/**
 * Kitchen settings persistence service.
 *
 * Persists durable user kitchen configuration and physical parameters
 * (e.g. kitchen elevation, station pressure, adjusted recipe core times)
 * to PostgreSQL (table `user_profiles`).
 *
 * Ephemeral SpacetimeDB telemetry is never treated as the record of truth;
 * when a cook chooses to save their kitchen elevation or core time adjustments,
 * this service executes the durable write via the `pg` driver.
 *
 * @file src/services/kitchenSettingsService.ts
 */

import { executeQuery } from "@/lib/database/connection";
import {
  normaliseToElevationBasis,
  type PostgresElevationBasis,
} from "@/lib/environment/elevationProvenance";

export interface RecipeCoreTimeAdjustment {
  recipeId: string;
  methodId?: string;
  adjustedCoreMinutes: number;
  nominalCoreMinutes?: number;
  notes?: string;
}

export interface PersistKitchenSettingsInput {
  userId: string;
  /** `undefined` / `null` both mean "leave whatever is stored alone". */
  kitchenElevationM?: number | null;
  kitchenElevationBasis?: PostgresElevationBasis | string | null;
  kitchenSettings?: Record<string, unknown>;
  recipeAdjustments?: RecipeCoreTimeAdjustment[];
}

export interface KitchenSettingsRow {
  userId: string;
  kitchenElevationM: number | null;
  kitchenElevationBasis: string | null;
  kitchenSettings: Record<string, unknown>;
  updatedAt: Date;
}

/**
 * The five columns this service reads back, as Postgres actually returns them.
 *
 * `kitchen_elevation_m` is `NUMERIC(7,2)`, and node-postgres hands NUMERIC back
 * as a **string** to avoid the precision loss of a float round-trip — hence the
 * explicit `Number()` in the mapper rather than a cast. Typing the row also
 * removes the `no-unsafe-member-access` cloud that an untyped `rows[0]` drags
 * behind it.
 */
interface KitchenSettingsDbRow {
  user_id: string;
  kitchen_elevation_m: string | null;
  kitchen_elevation_basis: string | null;
  kitchen_settings: Record<string, unknown> | null;
  updated_at: string | Date;
}

const RETURNED_COLUMNS =
  "user_id, kitchen_elevation_m, kitchen_elevation_basis, kitchen_settings, updated_at";

/**
 * Read the rows of a query as this file's row type.
 *
 * `executeQuery` declares a type parameter but discards it — the signature is
 * `executeQuery<_T = any>(...): Promise<QueryResult<any>>`, so passing
 * `<KitchenSettingsDbRow>` looks like typing and achieves nothing; every field
 * access downstream stays `any`. The assertion is therefore made once, here,
 * where the column list it depends on is three lines away, instead of decaying
 * into unchecked member access at every call site.
 *
 * It is an assertion about `RETURNING`/`SELECT` shape, not a validation. The
 * guarantee is the shared {@link RETURNED_COLUMNS} constant, which is why both
 * statements are built from it rather than spelling the columns out twice.
 */
async function selectKitchenRows(
  sql: string,
  params: unknown[],
): Promise<KitchenSettingsDbRow[]> {
  const { rows } = await executeQuery(sql, params);
  return rows as KitchenSettingsDbRow[];
}

function mapRow(row: KitchenSettingsDbRow): KitchenSettingsRow {
  return {
    userId: row.user_id,
    kitchenElevationM: row.kitchen_elevation_m === null ? null : Number(row.kitchen_elevation_m),
    kitchenElevationBasis: row.kitchen_elevation_basis,
    kitchenSettings: row.kitchen_settings ?? {},
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Create or update the caller's durable kitchen settings.
 *
 * ⚠️ NULL MEANS "DON'T TOUCH", ON BOTH BRANCHES OF THE UPSERT.
 *
 * An earlier revision did an UPDATE, checked for zero rows, then a separate
 * INSERT ... ON CONFLICT. The two paths disagreed: the UPDATE wrapped every
 * column in `COALESCE($n, existing)` so a null preserved the stored value,
 * while the conflict path assigned bare `EXCLUDED.*` — so the SAME call that
 * preserved an elevation on one path erased it on the other, decided only by
 * whether a profile row happened to exist. It was also racy: another request
 * could insert between the UPDATE and the INSERT.
 *
 * One statement now, with `COALESCE(EXCLUDED.col, user_profiles.col)` in the
 * conflict clause so both paths mean the same thing.
 */
export async function persistKitchenSettings(
  input: PersistKitchenSettingsInput,
): Promise<KitchenSettingsRow | null> {
  const { userId, kitchenElevationM, kitchenElevationBasis, kitchenSettings, recipeAdjustments } =
    input;

  // Accepts either vocabulary. NOT `provenanceToElevationBasis`, which maps
  // 'MEASURED' -> 'COMPUTED' because it only understands the Spacetime spelling.
  const validatedBasis = normaliseToElevationBasis(kitchenElevationBasis);

  const settingsPayload: Record<string, unknown> = {
    ...kitchenSettings,
    ...(recipeAdjustments && recipeAdjustments.length > 0 ? { recipeAdjustments } : {}),
    lastFlushedAt: new Date().toISOString(),
  };

  const sql = `
    INSERT INTO user_profiles (
      user_id, kitchen_elevation_m, kitchen_elevation_basis, kitchen_settings, updated_at
    ) VALUES (
      $1::uuid, $2::numeric, $3::varchar, $4::jsonb, NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      kitchen_elevation_m     = COALESCE(EXCLUDED.kitchen_elevation_m, user_profiles.kitchen_elevation_m),
      kitchen_elevation_basis = COALESCE(EXCLUDED.kitchen_elevation_basis, user_profiles.kitchen_elevation_basis),
      kitchen_settings        = COALESCE(user_profiles.kitchen_settings, '{}'::jsonb) || EXCLUDED.kitchen_settings,
      updated_at              = NOW()
    RETURNING ${RETURNED_COLUMNS};
  `;

  const rows = await selectKitchenRows(sql, [
    userId,
    kitchenElevationM ?? null,
    validatedBasis,
    JSON.stringify(settingsPayload),
  ]);

  const [row] = rows;
  return row ? mapRow(row) : null;
}

export async function getKitchenSettings(userId: string): Promise<KitchenSettingsRow | null> {
  const sql = `
    SELECT ${RETURNED_COLUMNS}
    FROM user_profiles
    WHERE user_id = $1::uuid;
  `;
  const rows = await selectKitchenRows(sql, [userId]);
  const [row] = rows;
  return row ? mapRow(row) : null;
}
