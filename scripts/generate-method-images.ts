/**
 * scripts/generate-method-images.ts
 *
 * Backfill the "Molecular Alchemy" hero diagrams for every cooking method that
 * is missing one. Mirrors scripts/generate-recipe-images.ts — calls Cloudflare
 * Workers AI directly (FLUX-1-schnell by default; --model sdxl for the weaker
 * stable-diffusion-xl-base-1.0) — but instead of plated food photographs it
 * renders the precise scientific cutaway-diagram style
 * already shipped for roasting / grilling / emulsification, and writes the
 * result as a local WebP under public/images/methods/<key>.webp (committed to
 * the repo — NOT uploaded to R2; the hub + detail pages reference /images/...).
 *
 * The set of methods needing an image is derived programmatically from the live
 * data: every key in `allCookingMethods` whose `AlchemicalMethodProfile.image`
 * is unset (or points at a file that does not exist on disk). Idempotent — skips
 * methods that already have a working image unless --force / --only is passed.
 *
 * Prompts: per-method SDXL prompt + imageAlt are read from
 * scripts/data/method-image-prompts.json when present (authored from the
 * profile fields), with a deterministic fallback builder that assembles a prompt
 * straight from the profile (epithet, tagline, molecularInteractions, accent).
 *
 * Required env vars (real generation only — NOT needed for --dry-run):
 *   CLOUDFLARE_ACCOUNT_ID  — Cloudflare account
 *   CLOUDFLARE_API_TOKEN   — Workers AI token (Account → AI → Use REST API)
 *
 * Optional flags:
 *   --dry-run          Print the prompt + target path, don't call the AI
 *   --only <k1,k2>     Restrict to these method keys (comma-separated)
 *   --limit <n>        Cap the number of methods processed (default: all missing)
 *   --force            Regenerate even if a working image already exists
 *   --delay <ms>       Inter-request delay (default: 1500)
 *   --steps <n>        SDXL inference steps (default: 20)
 *
 * Examples:
 *   bun --env-file=.env.local run scripts/generate-method-images.ts --dry-run
 *   bun --env-file=.env.local run scripts/generate-method-images.ts --only tilt_skillet
 *   bun --env-file=.env.local run scripts/generate-method-images.ts
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { allCookingMethods } from "@/data/cooking/methods";
import { getAlchemicalProfile } from "@/data/cooking/profiles";
import type { AlchemicalMethodProfile } from "@/types/cookingMethod";

// ── env ────────────────────────────────────────────────────────────────────
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

const IMAGE_DIR = path.join(process.cwd(), "public/images/methods");
const PROMPTS_JSON = path.join(process.cwd(), "scripts/data/method-image-prompts.json");

// ── args ───────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(name);
const value = (name: string) => {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : undefined;
};
const isDryRun = flag("--dry-run");
const force = flag("--force");
const onlyKeys = value("--only")
  ?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const limit = Number(value("--limit") ?? "0") || 0;
const delayMs = Number(value("--delay") ?? "1500");

// Model: FLUX-1-schnell is far stronger at coherent labeled scientific diagrams
// than SDXL (the default). SDXL kept drifting into sci-fi/abstract renders.
//   flux  → @cf/black-forest-labs/flux-1-schnell (JSON base64, steps ≤ 8, no negative prompt)
//   sdxl  → @cf/stabilityai/stable-diffusion-xl-base-1.0 (raw bytes, num_steps, negative prompt)
const MODEL = (value("--model") ?? "flux").toLowerCase();
const MODEL_ID =
  MODEL === "sdxl"
    ? "@cf/stabilityai/stable-diffusion-xl-base-1.0"
    : "@cf/black-forest-labs/flux-1-schnell";
const steps = Number(value("--steps") ?? (MODEL === "sdxl" ? "20" : "8"));

// CF creds are only required for real generation, not --dry-run.
if (!isDryRun) {
  const missing: string[] = [];
  if (!CF_ACCOUNT_ID) missing.push("CLOUDFLARE_ACCOUNT_ID");
  if (!CF_API_TOKEN) missing.push("CLOUDFLARE_API_TOKEN");
  if (missing.length) {
    console.error(
      `\nMissing required env var(s): ${missing.join(", ")}\n\n` +
        `These power Cloudflare Workers AI (SDXL). Add them to .env.local (or pass\n` +
        `a different --env-file) and re-run, or use --dry-run to preview prompts:\n` +
        `  CLOUDFLARE_ACCOUNT_ID  — Cloudflare dashboard → account id\n` +
        `  CLOUDFLARE_API_TOKEN   — dashboard → AI → "Use REST API" → create token\n`,
    );
    process.exit(1);
  }
}

// ── accent → palette (matches the shipped roasting/grilling/emulsification diagrams) ──
const ACCENT_PALETTE: Record<string, string> = {
  solar: "glowing solar orange and gold",
  ember: "volcanic orange and deep charcoal",
  emerald: "emerald green and silver",
  plasma: "electric magenta and cyan plasma",
  aqueous: "cool aqueous blue and teal",
  violet: "deep violet and indigo",
};

const NEGATIVE_PROMPT =
  "text, words, letters, labels, captions, watermark, signature, logo, " +
  "photograph of plated food, raw ingredients, human, hands, fingers, face, " +
  "cartoon, childish, low detail, blurry, jpeg artifacts, " +
  "title text, heading, large typography, gibberish letters, garbled text, " +
  // fight the washed-out / antique-engraving look — we want vivid dark HUD
  "grayscale, monochrome, desaturated, washed out, pale, low contrast, sepia, " +
  "antique engraving, pencil sketch, blueprint, white background, flat lighting, " +
  "dull, muted colors, " +
  // break the homogeneous radial look — force varied, apparatus-specific composition
  "circular mandala, radial symmetry, concentric rings, kaleidoscope, symmetrical pattern, " +
  // keep it SCIENCE, not science-fiction — accurate textbook diagram, not fantasy render
  "science fiction, sci-fi, video game render, fantasy, magical aura, energy hologram, " +
  "glowing plasma orb, surreal, abstract, dramatic cinematic glow, lens flare, " +
  // keep the dark field consistent with the shipped set
  "white background, light background, pink background, beige background, paper texture, " +
  "glossy 3d product render";

// Dominant glow color per accent — placed in the high-weight prefix tokens so
// each diagram is dominated by its method's accent (not SDXL's default cyan).
const ACCENT_GLOW: Record<string, string> = {
  solar: "warm orange and amber",
  ember: "orange and crimson",
  emerald: "emerald green and teal",
  plasma: "magenta and cyan",
  aqueous: "blue and teal",
  violet: "violet and indigo",
};

// Visual frame matching the shipped diagrams (combustion/roasting/braising/
// fermentation): a vivid dark BESPOKE scientific cutaway — each method drawn as
// its OWN apparatus/process (a pot, an overhead element, a still column), NOT a
// generic centered mandala. The authored per-method content drives composition.
const STYLE_SUFFIX =
  ", annotated cutaway cross-section with leader lines and callouts, " +
  "labeled molecular inset panels, heat-transfer arrows, measurement gauges and curve graphs, " +
  "accurate scientific illustration, precise and exact, clean detailed linework, sharp focus";

/** Wrap a core process prompt in the vivid dark scientific-diagram frame. The
 *  prefix sets the dark/neon look + accent palette; the authored content (which
 *  describes each method's specific apparatus) drives the unique composition.
 *  Strips the pale "schematic technical illustration" cues the authored prompts
 *  end with. */
function frame(core: string, accent: string): string {
  const glow = ACCENT_GLOW[accent] ?? "amber and gold";
  const prefix =
    `precise scientific cross-section cutaway diagram, accurate technical illustration, ` +
    `realistic proportions, solid dark background, ` +
    `${glow} accent technical linework and clear labels, `;
  const trimmed = core
    .replace(/,?\s*schematic technical illustration/gi, "")
    .replace(/,?\s*razor-sharp(\s+focus)?/gi, "")
    .replace(/,?\s*no text/gi, "")
    .replace(/,?\s*on a dark obsidian field/gi, "")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .trim()
    .replace(/[,\s]+$/, "");
  return `${prefix}${trimmed}${STYLE_SUFFIX}`;
}

// ── authored prompt overrides (scripts/data/method-image-prompts.json) ───────
type PromptEntry = { sdxlPrompt?: string; imageAlt?: string };
let AUTHORED: Record<string, PromptEntry> = {};
if (fs.existsSync(PROMPTS_JSON)) {
  try {
    AUTHORED = JSON.parse(fs.readFileSync(PROMPTS_JSON, "utf8"));
  } catch (err) {
    console.warn(
      `Could not parse ${path.relative(process.cwd(), PROMPTS_JSON)} — using deterministic prompts. ${
        err instanceof Error ? err.message : err
      }`,
    );
  }
}

function displayName(key: string, profile?: AlchemicalMethodProfile): string {
  const fromData = (allCookingMethods as Record<string, { name?: string }>)[key]?.name;
  return (profile?.displayName ?? fromData ?? key).replace(/_/g, " ");
}

function firstSentence(s: string): string {
  const clean = s.replace(/\s+/g, " ").trim();
  const m = clean.match(/^(.*?[.!?])(\s|$)/);
  return (m ? m[1] : clean).trim();
}

/** Deterministic fallback prompt built straight from the profile fields. */
function buildMethodPrompt(key: string, profile: AlchemicalMethodProfile): string {
  const name = displayName(key, profile);
  const palette = ACCENT_PALETTE[profile.accent] ?? "glowing alchemical gold";
  const interactions = (profile.molecularInteractions ?? [])
    .slice(0, 2)
    .map((m) => m.title)
    .filter(Boolean);
  const segments: string[] = [
    `high-fidelity scientific alchemical diagram of ${name}`,
    profile.epithet,
    firstSentence(profile.tagline),
  ];
  if (interactions.length) {
    segments.push(`molecular-level inset showing ${interactions.join(" and ")}`);
  }
  segments.push(
    `rendered as ${palette} alchemical symbols and annotations`,
    "on a dark obsidian field",
    "schematic technical illustration",
    "razor-sharp focus",
    "high detail",
    "no text",
  );
  return segments.join(", ");
}

/** Deterministic fallback alt text in the shipped voice. */
function buildMethodAlt(key: string, profile: AlchemicalMethodProfile): string {
  const name = displayName(key, profile);
  const palette = ACCENT_PALETTE[profile.accent] ?? "glowing alchemical";
  const interactions = (profile.molecularInteractions ?? [])
    .slice(0, 2)
    .map((m) => m.title.toLowerCase())
    .filter(Boolean);
  const tail = interactions.length
    ? `, with ${interactions.join(" and ")} rendered as glowing ${palette} alchemical symbols on an obsidian field`
    : ` rendered in glowing ${palette} alchemical symbols on an obsidian field`;
  return `Scientific diagram of ${name} (${profile.epithet}): ${firstSentence(profile.tagline).replace(/\.$/, "")}${tail}.`;
}

function resolve(key: string, profile: AlchemicalMethodProfile): { prompt: string; alt: string } {
  const authored = AUTHORED[key];
  return {
    prompt: frame(authored?.sdxlPrompt?.trim() || buildMethodPrompt(key, profile), profile.accent),
    alt: authored?.imageAlt?.trim() || buildMethodAlt(key, profile),
  };
}

// ── helpers ────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function generateWebp(prompt: string, outPath: string): Promise<number> {
  const aiUrl =
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${MODEL_ID}`;
  // SDXL accepts num_steps + negative_prompt and returns raw image bytes.
  // FLUX-schnell takes prompt + steps (≤8), ignores negatives, and returns
  // JSON { result: { image: "<base64>" } }.
  const body =
    MODEL === "sdxl"
      ? { prompt, negative_prompt: NEGATIVE_PROMPT, num_steps: steps }
      : { prompt, steps: Math.min(steps, 8) };
  const res = await fetch(aiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Workers AI ${res.status}: ${txt.slice(0, 200)}`);
  }

  let raw: Buffer;
  if (MODEL === "sdxl") {
    raw = Buffer.from(await res.arrayBuffer());
  } else {
    const json = (await res.json()) as { result?: { image?: string } };
    const b64 = json.result?.image;
    if (!b64) throw new Error("FLUX response missing result.image");
    raw = Buffer.from(b64, "base64");
  }
  const webp = await sharp(raw).webp({ quality: 82 }).toBuffer();
  fs.writeFileSync(outPath, webp);
  return webp.byteLength;
}

// ── main ───────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
  const onDisk = new Set(fs.readdirSync(IMAGE_DIR));

  // Build the work list: every registry method whose profile.image is unset or
  // points at a missing file. --only overrides the filter; --force ignores the
  // "already has a working image" skip.
  const allKeys = Object.keys(allCookingMethods).sort();
  const targets: { key: string; profile: AlchemicalMethodProfile }[] = [];
  const skipped: string[] = [];

  for (const key of allKeys) {
    if (onlyKeys && !onlyKeys.includes(key)) continue;
    const profile = getAlchemicalProfile(key);
    if (!profile) {
      skipped.push(`${key} (no AlchemicalMethodProfile)`);
      continue;
    }
    const file = profile.image ? path.basename(profile.image) : null;
    const hasWorkingImage = !!file && onDisk.has(file);
    if (hasWorkingImage && !force && !onlyKeys) {
      continue; // already covered
    }
    targets.push({ key, profile });
  }

  const work = limit > 0 ? targets.slice(0, limit) : targets;

  console.log(
    `Cooking-method diagram backfill\n` +
      `  cloudflare acct : ${CF_ACCOUNT_ID ?? "(unset — dry-run)"}\n` +
      `  model           : ${MODEL_ID}\n` +
      `  output dir      : ${path.relative(process.cwd(), IMAGE_DIR)}/\n` +
      `  authored prompts: ${Object.keys(AUTHORED).length ? `${PROMPTS_JSON} (${Object.keys(AUTHORED).length} keys)` : "none (deterministic)"}\n` +
      `  dry-run         : ${isDryRun}\n` +
      `  force           : ${force}\n` +
      `  only            : ${onlyKeys?.join(", ") ?? "(all missing)"}\n` +
      `  steps           : ${steps}\n` +
      `  targets         : ${work.length}${limit ? ` (limited from ${targets.length})` : ""}\n`,
  );
  if (skipped.length) console.log(`  (skipped: ${skipped.join("; ")})\n`);
  if (work.length === 0) {
    console.log("Nothing to generate — every method already has a working image.");
    return;
  }

  let ok = 0;
  let failed = 0;
  for (let i = 0; i < work.length; i++) {
    const { key, profile } = work[i];
    const { prompt, alt } = resolve(key, profile);
    const outPath = path.join(IMAGE_DIR, `${key}.webp`);
    const rel = path.relative(process.cwd(), outPath);
    const tag = `[${i + 1}/${work.length}]`;

    if (isDryRun) {
      console.log(`${tag} DRY  ${key}`);
      console.log(`         → ${rel}`);
      console.log(`         → image: "/images/methods/${key}.webp"`);
      console.log(`         → imageAlt: ${alt}`);
      console.log(`         → prompt: ${prompt.slice(0, 200)}${prompt.length > 200 ? "…" : ""}\n`);
      continue;
    }

    try {
      const bytes = await generateWebp(prompt, outPath);
      console.log(`${tag} OK   ${key}  →  ${rel} (${(bytes / 1024).toFixed(0)} KB)`);
      ok++;
    } catch (err) {
      console.error(`${tag} FAIL ${key} — ${err instanceof Error ? err.message : err}`);
      failed++;
    }
    if (i < work.length - 1) await sleep(delayMs);
  }

  console.log(`\nDone. ok=${ok} failed=${failed}`);
  if (ok > 0 && !isDryRun) {
    console.log(
      `\nNext: wire each generated key's image + imageAlt into its profile in\n` +
        `src/data/cooking/profiles/<category>.ts (image: "/images/methods/<key>.webp").`,
    );
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
