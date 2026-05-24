/**
 * scripts/generate-recipe-images.ts
 *
 * Backfill recipe-specific images for every public recipe missing an image_url.
 * Mirrors scripts/batchEnrichIngredients.ts — calls Cloudflare Workers AI
 * (stable-diffusion-xl-base-1.0) directly, uploads the PNG to Cloudflare R2,
 * then writes the URL to both `recipes.image_url` and the denormalized
 * `recipes.read_model.image_url` field.
 *
 * Idempotent — skips rows that already have an image_url. Safe to re-run.
 *
 * Required env vars:
 *   DATABASE_URL                — Postgres connection string
 *   CLOUDFLARE_ACCOUNT_ID       — Cloudflare account
 *   CLOUDFLARE_API_TOKEN        — Workers AI token (Account → API Tokens)
 *   R2_ACCESS_KEY_ID            — R2 S3 credential
 *   R2_SECRET_ACCESS_KEY        — R2 S3 credential
 *   R2_BUCKET_NAME              — defaults to "alchm-assets"
 *   NEXT_PUBLIC_R2_DOMAIN       — defaults to "https://assets.alchm.kitchen"
 *
 * Optional flags:
 *   --dry-run            Print the prompt and target path, don't call the AI
 *   --limit <n>          Cap the number of recipes processed (default: all)
 *   --cuisine <name>     Restrict to a single cuisine (case-insensitive)
 *   --delay <ms>         Inter-request delay (default: 1500)
 *
 * Examples:
 *   bun --env-file=.env.production.local run scripts/generate-recipe-images.ts --dry-run --limit 5
 *   bun --env-file=.env.production.local run scripts/generate-recipe-images.ts --cuisine french
 *   bun --env-file=.env.production.local run scripts/generate-recipe-images.ts
 */

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Redis } from "@upstash/redis";
import pkg from "pg";

const { Pool } = pkg;

// ── env ────────────────────────────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL;
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET_NAME || "alchm-assets";
const R2_DOMAIN = (
  process.env.NEXT_PUBLIC_R2_DOMAIN || "https://assets.alchm.kitchen"
).replace(/\/$/, "");

// DATABASE_URL is always required (dry-run still queries the catalog).
if (!DATABASE_URL) {
  console.error("Missing required env var: DATABASE_URL");
  process.exit(1);
}
// CF + R2 creds are only required for real generation, not --dry-run.
const isDryRunFlag = process.argv.includes("--dry-run");
if (!isDryRunFlag) {
  const missing: string[] = [];
  if (!CF_ACCOUNT_ID) missing.push("CLOUDFLARE_ACCOUNT_ID");
  if (!CF_API_TOKEN) missing.push("CLOUDFLARE_API_TOKEN");
  if (!R2_ACCESS_KEY_ID) missing.push("R2_ACCESS_KEY_ID");
  if (!R2_SECRET_ACCESS_KEY) missing.push("R2_SECRET_ACCESS_KEY");
  if (missing.length) {
    console.error(`Missing required env vars: ${missing.join(", ")}`);
    process.exit(1);
  }
}

// ── types ──────────────────────────────────────────────────────────────────
type Element = "Fire" | "Water" | "Earth" | "Air";
interface RecipeRow {
  id: string;
  name: string;
  description: string | null;
  cuisine: string | null;
  category: string | null;
  elemental_properties: Record<string, number> | null;
}

// ── args ───────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(name);
const value = (name: string) => {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : undefined;
};
const isDryRun = flag("--dry-run");
const limit = Number(value("--limit") ?? "0") || 0;
const cuisineFilter = value("--cuisine")?.toLowerCase();
const delayMs = Number(value("--delay") ?? "1500");

// ── prompt builder ─────────────────────────────────────────────────────────
// Same accents as PA's ingredient generator, applied to plated dishes.
const ELEMENT_ACCENTS: Record<Element, string> = {
  Fire: "warm amber side lighting",
  Water: "cool moisture and fresh herb dewdrops",
  Earth: "earthy matte tones and natural ceramic texture",
  Air: "soft airy backlighting and open negative space",
};
const NEGATIVE_PROMPT =
  "text, labels, hands, packaging, watermarks, logos, fantasy elements, " +
  "excessive blur, cartoon, illustration, painting";

/**
 * Pull the first ~2 sentences of the recipe description, normalized for prompt
 * use: stripped of markdown, collapsed whitespace, lowercased, capped at 280
 * chars. SDXL handles long prompts via dual CLIP encoders, so we can afford
 * the extra context — and the descriptions carry the dish-specific cues
 * (textures, signature ingredients, presentation) that turn a generic plate
 * into a recognizable one.
 */
function extractDescriptionSnippet(raw: string): string {
  const clean = raw
    .replace(/[*_`#>]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return "";
  const sentences = clean.split(/(?<=[.!?])\s+/);
  let snippet = "";
  for (const s of sentences) {
    if (!s) continue;
    const next = snippet ? `${snippet} ${s}` : s;
    if (next.length > 280) break;
    snippet = next;
    if (snippet.length >= 200) break;
  }
  if (!snippet) snippet = clean.slice(0, 280).trim();
  return snippet.toLowerCase();
}

function buildRecipePrompt(r: RecipeRow): string {
  const segments: string[] = [];

  let subject = `premium culinary photograph of ${r.name}`;
  if (r.cuisine) subject += `, ${r.cuisine} cuisine`;
  segments.push(subject);

  if (r.description) {
    const snippet = extractDescriptionSnippet(r.description);
    if (snippet) segments.push(snippet);
  }

  // Plated food photography (vs. raw-ingredient framing)
  segments.push(
    "beautifully plated on ceramic dish",
    "overhead 45-degree angle",
    "shallow depth of field",
    "studio lighting",
    "razor-sharp focus on the dish",
    "rich natural texture",
    "generous negative space for card cropping",
    "professional food photography",
  );

  // Dominant element(s) → photographic atmosphere
  const ep = r.elemental_properties;
  if (ep) {
    const accents = (
      Object.entries(ep) as Array<[string, number]>
    )
      .filter(([k, v]) => typeof v === "number" && v > 0.3 && k in ELEMENT_ACCENTS)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([k]) => ELEMENT_ACCENTS[k as Element]);
    if (accents.length) segments.push(`subtle ${accents.join(" and ")} accent`);
  }

  return segments.join(", ");
}

// ── helpers ────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL!.includes(".railway.internal")
    ? false
    : { rejectUnauthorized: false },
});

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
  },
});

async function generateAndUpload(r: RecipeRow): Promise<string> {
  const prompt = buildRecipePrompt(r);

  const aiUrl =
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}` +
    `/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`;

  const res = await fetch(aiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, negative_prompt: NEGATIVE_PROMPT }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Workers AI ${res.status}: ${txt.slice(0, 200)}`);
  }
  const buf = await res.arrayBuffer();

  const key = `recipes/${r.id}.png`;
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: new Uint8Array(buf),
      ContentType: "image/png",
    }),
  );

  return `${R2_DOMAIN}/${key}`;
}

// ── main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(
    `Recipe image backfill\n` +
      `  cloudflare acct  : ${CF_ACCOUNT_ID}\n` +
      `  r2 bucket        : ${R2_BUCKET}\n` +
      `  r2 public domain : ${R2_DOMAIN}\n` +
      `  dry-run          : ${isDryRun}\n` +
      `  limit            : ${limit || "all"}\n` +
      `  cuisine filter   : ${cuisineFilter ?? "none"}\n` +
      `  delay            : ${delayMs}ms\n`,
  );

  const where: string[] = [
    "is_public = true",
    "(image_url IS NULL OR image_url = '')",
  ];
  const params: unknown[] = [];
  if (cuisineFilter) {
    params.push(cuisineFilter);
    // cuisine is an enum (cuisine_type) — cast to text for LOWER().
    where.push(`LOWER(cuisine::text) = $${params.length}`);
  }
  let sql = `
    SELECT id, name, description, cuisine, category,
           COALESCE(read_model->'elemental_properties', NULL) AS elemental_properties
    FROM recipes
    WHERE ${where.join(" AND ")}
    ORDER BY name
  `;
  if (limit > 0) sql += ` LIMIT ${limit}`;

  const { rows } = await pool.query<RecipeRow>(sql, params);
  console.log(`Found ${rows.length} recipes needing images.\n`);
  if (rows.length === 0) {
    await pool.end();
    return;
  }

  let ok = 0;
  let failed = 0;
  let dry = 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const tag = `[${i + 1}/${rows.length}]`;
    const label = `${r.name}${r.cuisine ? ` (${r.cuisine})` : ""}`;

    if (isDryRun) {
      const prompt = buildRecipePrompt(r);
      console.log(`${tag} DRY  ${label}`);
      console.log(`         → recipes/${r.id}.png`);
      console.log(`         → ${prompt.slice(0, 140)}${prompt.length > 140 ? "…" : ""}`);
      dry++;
      continue;
    }

    try {
      const url = await generateAndUpload(r);
      await pool.query(
        `UPDATE recipes
         SET image_url = $1::text,
             read_model = CASE
               WHEN read_model IS NULL THEN read_model
               ELSE jsonb_set(read_model, '{image_url}', to_jsonb($1::text), true)
             END,
             updated_at = NOW()
         WHERE id = $2`,
        [url, r.id],
      );
      console.log(`${tag} OK   ${label}  →  ${url}`);
      ok++;
    } catch (err) {
      console.error(
        `${tag} FAIL ${label} — ${err instanceof Error ? err.message : err}`,
      );
      failed++;
    }

    if (i < rows.length - 1) await sleep(delayMs);
  }

  console.log(
    `\nDone. ok=${ok} failed=${failed}${isDryRun ? ` dry=${dry}` : ""}`,
  );

  // Bust the Next.js recipe-catalog Redis cache so the frontend picks up new
  // image_urls immediately (otherwise the API serves stale data for up to 5
  // minutes per LocalRecipeService's REDIS_TTL_SECONDS).
  if (!isDryRun && ok > 0) {
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (upstashUrl && upstashToken) {
      try {
        const redis = new Redis({ url: upstashUrl, token: upstashToken });
        await redis.del("recipes:catalog:all");
        console.log("Cache bust: recipes:catalog:all");
      } catch (err) {
        console.warn(
          `Cache bust failed (frontend will refresh within 5 min): ${err instanceof Error ? err.message : err}`,
        );
      }
    }
  }

  await pool.end();
}

main().catch(async (err) => {
  console.error("Fatal:", err);
  await pool.end().catch(() => {});
  process.exit(1);
});
