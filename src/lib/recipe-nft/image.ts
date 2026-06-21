/**
 * Recipe hero image — SERVER ONLY. Generates via Cloudflare Workers AI
 * (stable-diffusion-xl-base-1.0) and uploads the PNG to Cloudflare R2, returning
 * the DURABLE public URL (assets.alchm.kitchen/...). Mirrors
 * scripts/generate-recipe-images.ts — the canonical recipe-image pipeline — so
 * NFT art is permanent (R2-hosted), not tied to an ephemeral backend URL.
 *
 * The image URL is NOT part of the immutable contentHash (it lives only in the
 * off-chain metadata), so regeneration never affects the on-chain proof.
 *
 * Required env (same as the backfill script): CLOUDFLARE_ACCOUNT_ID,
 * CLOUDFLARE_API_TOKEN, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 * R2_BUCKET_NAME (default "alchm-assets"), NEXT_PUBLIC_R2_DOMAIN
 * (default "https://assets.alchm.kitchen"). Returns null if unconfigured.
 */

import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { redisGet, redisSet } from "@/lib/redis";
import type { ElementalShares } from "./types";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET_NAME || "alchm-assets";
const R2_DOMAIN = (process.env.NEXT_PUBLIC_R2_DOMAIN || "https://assets.alchm.kitchen").replace(/\/$/, "");
const CACHE_TTL = 60 * 60 * 24 * 30; // 30 days — the R2 object is durable.

const NEGATIVE_PROMPT =
  "text, labels, hands, packaging, watermarks, logos, fantasy elements, excessive blur, cartoon, illustration, painting";

const ELEMENT_ACCENTS: Record<keyof ElementalShares, string> = {
  Fire: "warm amber side lighting",
  Water: "cool moisture and fresh herb dewdrops",
  Earth: "earthy matte tones and natural ceramic texture",
  Air: "soft airy backlighting and open negative space",
};

export interface RecipeImageInput {
  /** Stable per-recipe id — becomes the R2 object key (recipes/nft/{id}.png). */
  id: string;
  title: string;
  description?: string;
  cuisine?: string;
  /** 0-1 elemental shares, used for photographic atmosphere accents. */
  elemental?: ElementalShares;
}

function configured(): boolean {
  return Boolean(CF_ACCOUNT_ID && CF_API_TOKEN && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);
}

function sanitizeKey(id: string): string {
  return id.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

function buildPrompt({ title, description, cuisine, elemental }: RecipeImageInput): string {
  const segments: string[] = [
    `premium culinary photograph of ${title}${cuisine ? `, ${cuisine} cuisine` : ""}`,
  ];
  if (description) {
    const snippet = description.replace(/[*_`#>]+/g, "").replace(/\s+/g, " ").trim().slice(0, 280).toLowerCase();
    if (snippet) segments.push(snippet);
  }
  segments.push(
    "beautifully plated on ceramic dish",
    "overhead 45-degree angle",
    "shallow depth of field",
    "studio lighting",
    "razor-sharp focus on the dish",
    "rich natural texture",
    "generous negative space",
    "professional food photography",
  );
  if (elemental) {
    const accents = (Object.entries(elemental) as Array<[keyof ElementalShares, number]>)
      .filter(([k, v]) => typeof v === "number" && v > 0.3 && k in ELEMENT_ACCENTS)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([k]) => ELEMENT_ACCENTS[k]);
    if (accents.length) segments.push(`subtle ${accents.join(" and ")} accent`);
  }
  return segments.join(", ");
}

let _s3: S3Client | null = null;
function r2(): S3Client {
  if (!_s3) {
    _s3 = new S3Client({
      region: "auto",
      endpoint: `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID as string, secretAccessKey: R2_SECRET_ACCESS_KEY as string },
    });
  }
  return _s3;
}

/**
 * Return a recipe's hero image URL (durable, R2-hosted). Generates via
 * Cloudflare Workers AI + uploads to R2 on a cache/CDN miss. Never throws —
 * returns null if unconfigured/unavailable so callers degrade gracefully.
 */
export async function generateRecipeImage(input: RecipeImageInput): Promise<string | null> {
  if (!input.title) return null;
  const key = `recipes/nft/${sanitizeKey(input.id)}.png`;
  const publicUrl = `${R2_DOMAIN}/${key}`;
  const cacheKey = `recipe_nft_img:${sanitizeKey(input.id)}`;

  // 1. Redis cache (URL).
  try {
    const cached = await redisGet<string>(cacheKey);
    if (cached) return cached;
  } catch {
    /* best-effort */
  }

  if (!configured()) return null;

  // 2. Already in R2? Authenticated HeadObject — reliable (avoids the flaky
  // public-CDN HEAD under Next's patched fetch that caused re-generation churn).
  try {
    await r2().send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    await redisSet(cacheKey, publicUrl, CACHE_TTL).catch(() => {});
    return publicUrl;
  } catch {
    /* not found → generate */
  }

  // 3. Generate (Workers AI SDXL) → upload PNG to R2.
  try {
    const aiUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`;
    const res = await fetch(aiUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${CF_API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: buildPrompt(input), negative_prompt: NEGATIVE_PROMPT }),
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();

    await r2().send(
      new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: new Uint8Array(buf), ContentType: "image/png" }),
    );
    await redisSet(cacheKey, publicUrl, CACHE_TTL).catch(() => {});
    return publicUrl;
  } catch {
    return null;
  }
}
