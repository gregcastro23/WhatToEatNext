import { createHash } from "node:crypto";
import { executeQuery } from "@/lib/database/connection";
import { feedDatabase } from "@/services/feedDatabaseService";
import {
  AdaptationConflict,
  AdaptationUnavailable,
  contentHash,
} from "./adaptationAgentBasis";
import {
  SAVED_ADAPTATION_SOURCE,
  SavedAdaptationSchema,
  type SavedAdaptation,
} from "./savedAdaptationSchemas";

/** UUIDv5 in the URL namespace: retries by one authenticated requester share a row. */
export function adaptationVersionId(
  requesterId: string,
  clientRequestId: string,
): string {
  const hex = createHash("sha1")
    .update(Buffer.from("6ba7b8119dad11d180b400c04fd430c8", "hex"))
    .update(
      JSON.stringify(["wten-saved-adaptation", requesterId, clientRequestId]),
    )
    .digest("hex");
  const variant = ((Number.parseInt(hex.slice(16, 17), 16) & 3) | 8).toString(
    16,
  );
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

interface SavedRow {
  id: string;
  user_id: string;
  source_recipe_id: string;
  payload: unknown;
}
function readRow(row: SavedRow): SavedAdaptation {
  const parsed = SavedAdaptationSchema.safeParse(row.payload);
  if (
    !parsed.success ||
    parsed.data.id !== row.id ||
    parsed.data.receipt.actor.id !== row.user_id ||
    parsed.data.receipt.original.id !== row.source_recipe_id ||
    parsed.data.receipt.contentHash !== contentHash(parsed.data.recipe)
  ) {
    throw new AdaptationUnavailable(
      "The saved adaptation is unreadable. Its content has not been replaced.",
    );
  }
  return parsed.data;
}

export async function loadSavedAdaptation(
  id: string,
): Promise<SavedAdaptation | null> {
  const result = await executeQuery<SavedRow>(
    `SELECT id,user_id,source_recipe_id,payload FROM user_custom_recipes
      WHERE id=$1 AND source=$2 LIMIT 1`,
    [id, SAVED_ADAPTATION_SOURCE],
  );
  return result.rows[0] ? readRow(result.rows[0]) : null;
}

export function checkAdaptationReplay(
  version: SavedAdaptation,
  requestFingerprint: string,
): SavedAdaptation {
  if (version.requestFingerprint !== requestFingerprint)
    throw new AdaptationConflict(
      "This request ID belongs to different adaptation details. Keep the original request or start a new version.",
    );
  return version;
}

export async function saveAdaptation(
  version: SavedAdaptation,
): Promise<{ version: SavedAdaptation; inserted: boolean }> {
  const data = SavedAdaptationSchema.parse(version);
  const result = await executeQuery<SavedRow>(
    `INSERT INTO user_custom_recipes(id,user_id,name,cuisine,source,source_recipe_id,payload,notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)
      ON CONFLICT (id) DO NOTHING RETURNING id,user_id,source_recipe_id,payload`,
    [
      data.id,
      data.receipt.actor.id,
      data.recipe.name,
      data.recipe.cuisine ?? null,
      SAVED_ADAPTATION_SOURCE,
      data.receipt.original.id,
      JSON.stringify(data),
      "Saved vegetarian adaptation; no rating or cooking attestation.",
    ],
  );
  if (result.rows[0])
    return { version: readRow(result.rows[0]), inserted: true };
  const original = await loadSavedAdaptation(data.id);
  if (!original)
    throw new AdaptationConflict(
      "The version ID is already in use. No existing recipe was changed.",
    );
  return {
    version: checkAdaptationReplay(original, data.requestFingerprint),
    inserted: false,
  };
}

export async function adaptationPublication(
  id: string,
): Promise<"published" | "not-published" | "unknown"> {
  try {
    const result = await executeQuery<{ present: boolean }>(
      `SELECT EXISTS(SELECT 1 FROM feed_events f
        JOIN user_custom_recipes v ON v.id=$1 AND v.source=$2
        WHERE f.event_type='recipe_adapted' AND f.actor_id=v.user_id
          AND f.metadata_payload->>'versionId'=v.id::text
          AND f.metadata_payload->>'source'=$2
          AND f.metadata_payload->>'recipeId'=v.source_recipe_id
          AND f.metadata_payload->>'action'='adapted') AS present`,
      [id, SAVED_ADAPTATION_SOURCE],
    );
    return result.rows[0]?.present === true ? "published" : "not-published";
  } catch {
    return "unknown";
  }
}

export async function publishSavedAdaptation(
  version: SavedAdaptation,
): Promise<"published" | "not-published" | "unknown"> {
  try {
    const published = await feedDatabase.createEvent(
      version.receipt.actor.id,
      "recipe_adapted",
      {
        versionId: version.id,
        recipeId: version.receipt.original.id,
        recipeName: version.receipt.original.name,
        versionName: version.recipe.name,
        originalPath: `/recipes/${encodeURIComponent(version.receipt.original.id)}`,
        versionPath: `/recipes/versions/${version.id}`,
        action: "adapted",
        source: SAVED_ADAPTATION_SOURCE,
      },
      false,
      { share: true, explicit: true },
    );
    return published ? "published" : "not-published";
  } catch {
    return "unknown";
  }
}
