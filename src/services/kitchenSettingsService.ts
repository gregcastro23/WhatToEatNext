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
import { provenanceToElevationBasis, type PostgresElevationBasis } from "@/lib/environment/elevationProvenance";
import { _logger } from "@/lib/logger";

export interface PersistKitchenSettingsInput {
  userId: string;
  kitchenElevationM?: number | null;
  kitchenElevationBasis?: PostgresElevationBasis | string | null;
  kitchenSettings?: Record<string, unknown>;
  recipeAdjustments?: Array<{
    recipeId: string;
    methodId?: string;
    adjustedCoreMinutes: number;
    nominalCoreMinutes?: number;
    notes?: string;
  }>;
}

export interface KitchenSettingsRow {
  userId: string;
  kitchenElevationM: number | null;
  kitchenElevationBasis: string | null;
  kitchenSettings: Record<string, unknown>;
  updatedAt: Date;
}

export async function persistKitchenSettings(
  input: PersistKitchenSettingsInput,
): Promise<KitchenSettingsRow | null> {
  const { userId, kitchenElevationM, kitchenElevationBasis, kitchenSettings = {}, recipeAdjustments } = input;

  let validatedBasis: string | null = null;
  if (kitchenElevationBasis) {
    validatedBasis = provenanceToElevationBasis(kitchenElevationBasis as any);
  }

  const settingsPayload = {
    ...kitchenSettings,
    ...(recipeAdjustments && recipeAdjustments.length > 0 ? { recipeAdjustments } : {}),
    lastFlushedAt: new Date().toISOString(),
  };

  const sql = `
    UPDATE user_profiles
    SET
      kitchen_elevation_m = COALESCE($2::numeric, kitchen_elevation_m),
      kitchen_elevation_basis = COALESCE($3::varchar, kitchen_elevation_basis),
      kitchen_settings = COALESCE(user_profiles.kitchen_settings, '{}'::jsonb) || $4::jsonb,
      updated_at = NOW()
    WHERE user_id = $1::uuid
    RETURNING user_id, kitchen_elevation_m, kitchen_elevation_basis, kitchen_settings, updated_at;
  `;

  const { rows } = await executeQuery(sql, [
    userId,
    kitchenElevationM !== undefined ? kitchenElevationM : null,
    validatedBasis,
    JSON.stringify(settingsPayload),
  ]);

  if (rows.length === 0) {
    // If user_profile doesn't exist yet, insert one
    const insertSql = `
      INSERT INTO user_profiles (
        user_id, kitchen_elevation_m, kitchen_elevation_basis, kitchen_settings, updated_at
      ) VALUES (
        $1::uuid, $2::numeric, $3::varchar, $4::jsonb, NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        kitchen_elevation_m = EXCLUDED.kitchen_elevation_m,
        kitchen_elevation_basis = EXCLUDED.kitchen_elevation_basis,
        kitchen_settings = COALESCE(user_profiles.kitchen_settings, '{}'::jsonb) || EXCLUDED.kitchen_settings,
        updated_at = NOW()
      RETURNING user_id, kitchen_elevation_m, kitchen_elevation_basis, kitchen_settings, updated_at;
    `;
    const inserted = await executeQuery(insertSql, [
      userId,
      kitchenElevationM ?? null,
      validatedBasis,
      JSON.stringify(settingsPayload),
    ]);
    if (inserted.rows.length === 0) return null;
    const [r] = inserted.rows;
    return {
      userId: r.user_id,
      kitchenElevationM: r.kitchen_elevation_m !== null ? Number(r.kitchen_elevation_m) : null,
      kitchenElevationBasis: r.kitchen_elevation_basis,
      kitchenSettings: (r.kitchen_settings as Record<string, unknown>) ?? {},
      updatedAt: new Date(r.updated_at),
    };
  }

  const [r] = rows;
  return {
    userId: r.user_id,
    kitchenElevationM: r.kitchen_elevation_m !== null ? Number(r.kitchen_elevation_m) : null,
    kitchenElevationBasis: r.kitchen_elevation_basis,
    kitchenSettings: (r.kitchen_settings as Record<string, unknown>) ?? {},
    updatedAt: new Date(r.updated_at),
  };
}

export async function getKitchenSettings(userId: string): Promise<KitchenSettingsRow | null> {
  const sql = `
    SELECT user_id, kitchen_elevation_m, kitchen_elevation_basis, kitchen_settings, updated_at
    FROM user_profiles
    WHERE user_id = $1::uuid;
  `;
  const { rows } = await executeQuery(sql, [userId]);
  if (rows.length === 0) return null;
  const [r] = rows;
  return {
    userId: r.user_id,
    kitchenElevationM: r.kitchen_elevation_m !== null ? Number(r.kitchen_elevation_m) : null,
    kitchenElevationBasis: r.kitchen_elevation_basis,
    kitchenSettings: (r.kitchen_settings as Record<string, unknown>) ?? {},
    updatedAt: new Date(r.updated_at),
  };
}
