/**
 * Agentic ingredient enrichment backfill.
 *
 * The homepage recommender reads static TypeScript ingredient data through the
 * unified ingredient adapter, so this script targets `src/data/ingredients/**`.
 * It only fills missing fields and never overwrites authored data.
 *
 * Usage:
 *   bun scripts/batchEnrichIngredients.ts --limit=10
 *   bun scripts/batchEnrichIngredients.ts --apply --limit=10 --yes
 *   bun scripts/batchEnrichIngredients.ts --apply --include-images --limit=5 --yes
 *
 * Environment:
 *   PLANETARY_KINETICS_URL=https://agents.alchm.kitchen
 *   PLANETARY_INGREDIENT_ENRICHMENT_URL=https://agents.alchm.kitchen/api/enrich-ingredient
 *   PLANETARY_IMAGE_ENDPOINT=https://agents.alchm.kitchen/api/generate-ingredient-image
 *   PLANETARY_AGENTS_API_KEY=<optional bearer token>
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import {
  ObjectLiteralExpression,
  Project,
  PropertyAssignment,
  SyntaxKind,
} from "ts-morph";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const INGREDIENTS_DIR = path.join(REPO_ROOT, "src", "data", "ingredients");

const SKIP_FILES = new Set([
  "index.ts",
  "types.ts",
  "ingredients.ts",
  "ingredientSummaries.ts",
  "flavorProfiles.ts",
  "elementalProperties.ts",
]);

interface Options {
  apply: boolean;
  yes: boolean;
  includeImages: boolean;
  forceImages: boolean;
  limit: number;
  delayMs: number;
  onlySlug?: string;
}

interface Candidate {
  slug: string;
  name: string;
  category: string;
  file: string;
  object: ObjectLiteralExpression;
  missingDescription: boolean;
  missingImage: boolean;
}

interface EnrichmentResult {
  description?: string;
  imageUrl?: string;
}

interface ImageGenerationResult {
  imageUrl?: string;
  fallback?: boolean;
  fallbackReason?: string;
}

function parseArgs(): Options {
  const args = new Set(process.argv.slice(2));
  const getValue = (name: string, fallback: number): number => {
    const raw = process.argv.find((arg) => arg.startsWith(`${name}=`));
    if (!raw) return fallback;
    const value = Number(raw.split("=")[1]);
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  };

  const onlyRaw = process.argv.find((arg) => arg.startsWith("--only="));
  const onlySlug = onlyRaw ? onlyRaw.split("=")[1]?.trim() || undefined : undefined;
  return {
    apply: args.has("--apply"),
    yes: args.has("--yes"),
    includeImages: args.has("--include-images"),
    forceImages: args.has("--force-images"),
    limit: getValue("--limit", 25),
    delayMs: getValue("--delay-ms", 1200),
    onlySlug,
  };
}

function stripQuotes(value: string): string {
  return value.replace(/^["'`]|["'`]$/g, "");
}

function getProp(
  obj: ObjectLiteralExpression,
  name: string,
): PropertyAssignment | undefined {
  for (const prop of obj.getProperties()) {
    const assignment = prop.asKind(SyntaxKind.PropertyAssignment);
    if (!assignment) continue;
    if (stripQuotes(assignment.getName()) === name) return assignment;
  }
  return undefined;
}

function getStringProp(obj: ObjectLiteralExpression, name: string): string {
  const initializer = getProp(obj, name)?.getInitializer();
  if (!initializer) return "";
  return stripQuotes(initializer.getText()).trim();
}

function hasUsableStringProp(
  obj: ObjectLiteralExpression,
  names: string[],
): boolean {
  return names.some((name) => getStringProp(obj, name).length >= 30);
}

function hasImageProp(obj: ObjectLiteralExpression): boolean {
  return ["image_url", "imageUrl", "image"].some(
    (name) => getStringProp(obj, name).length > 0,
  );
}

function listIngredientFiles(): string[] {
  const files: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (
        entry.isFile() &&
        entry.name.endsWith(".ts") &&
        !SKIP_FILES.has(entry.name)
      ) {
        files.push(fullPath);
      }
    }
  };
  walk(INGREDIENTS_DIR);
  return files.sort();
}

function collectCandidates(project: Project, options: Options): Candidate[] {
  const candidates: Candidate[] = [];

  for (const file of listIngredientFiles()) {
    const sourceFile = project.addSourceFileAtPath(file);
    for (const declaration of sourceFile.getVariableDeclarations()) {
      const root = declaration
        .getInitializer()
        ?.asKind(SyntaxKind.ObjectLiteralExpression);
      if (!root) continue;

      for (const prop of root.getProperties()) {
        const assignment = prop.asKind(SyntaxKind.PropertyAssignment);
        if (!assignment) continue;
        const object = assignment
          .getInitializer()
          ?.asKind(SyntaxKind.ObjectLiteralExpression);
        if (!object) continue;

        // Earlier this code required a `name` property, which silently skipped
        // every entry in coverageCurationOverrides.ts (51 ingredients keyed by
        // slug only — mirepoix, mirin, chili_flakes, radishes…). Fall back to
        // the slug so those entries are included. Still skip pure boilerplate
        // entries that have *no* identifying metadata at all.
        if (
          !getProp(object, "name") &&
          !getProp(object, "category") &&
          !getProp(object, "description")
        ) {
          continue;
        }

        const slug = stripQuotes(assignment.getName());
        const name = getStringProp(object, "name") || slug.replace(/_/g, " ");
        const category = getStringProp(object, "category") || "ingredient";
        const missingDescription = !hasUsableStringProp(object, [
          "description",
          "flavor",
          "flavorDescription",
        ]);
        const missingImage = !hasImageProp(object);

        // --only=<slug> narrows the set to a single ingredient (e.g. for
        // targeted fixes like the lamb-face regeneration).
        if (options.onlySlug && slug !== options.onlySlug) continue;

        if (missingDescription || (options.includeImages && (missingImage || options.forceImages))) {
          candidates.push({
            slug,
            name,
            category,
            file,
            object,
            missingDescription,
            missingImage,
          });
        }
      }
    }
  }

  return candidates;
}

function expressionToValue(
  initializer: import("ts-morph").Expression,
): unknown {
  const stringLiteral =
    initializer.asKind(SyntaxKind.StringLiteral) ||
    initializer.asKind(SyntaxKind.NoSubstitutionTemplateLiteral);
  if (stringLiteral) return stripQuotes(stringLiteral.getText());

  const numericLiteral = initializer.asKind(SyntaxKind.NumericLiteral);
  if (numericLiteral) return Number(numericLiteral.getText());

  if (initializer.getKind() === SyntaxKind.TrueKeyword) return true;
  if (initializer.getKind() === SyntaxKind.FalseKeyword) return false;
  if (initializer.getKind() === SyntaxKind.NullKeyword) return null;

  const arrayLiteral = initializer.asKind(SyntaxKind.ArrayLiteralExpression);
  if (arrayLiteral) {
    return arrayLiteral
      .getElements()
      .map((element) => expressionToValue(element));
  }

  const objectLiteral = initializer.asKind(SyntaxKind.ObjectLiteralExpression);
  if (objectLiteral) {
    const value: Record<string, unknown> = {};
    for (const prop of objectLiteral.getProperties()) {
      const assignment = prop.asKind(SyntaxKind.PropertyAssignment);
      if (!assignment) continue;
      const assignmentInitializer = assignment.getInitializer();
      if (!assignmentInitializer) continue;
      value[stripQuotes(assignment.getName())] = expressionToValue(
        assignmentInitializer,
      );
    }
    return value;
  }

  return undefined;
}

function extractValueProp(obj: ObjectLiteralExpression, name: string): unknown {
  const initializer = getProp(obj, name)?.getInitializer();
  if (!initializer) return undefined;
  try {
    return expressionToValue(initializer) ?? JSON.parse(initializer.getText());
  } catch {
    return undefined;
  }
}

function optionalObject(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function optionalStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const strings = value.map((item) => String(item).trim()).filter(Boolean);
  return strings.length ? strings.slice(0, 4) : undefined;
}

function compactPayload<T extends Record<string, unknown>>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as T;
}

function endpointFromEnv(pathname: string, explicitEnv: string): string {
  const explicit = process.env[explicitEnv];
  if (explicit) return explicit;
  const baseUrl =
    process.env.PLANETARY_KINETICS_URL || "https://agents.alchm.kitchen";
  return `${baseUrl.replace(/\/$/, "")}${pathname}`;
}

async function postJson(url: string, payload: unknown): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (process.env.PLANETARY_AGENTS_API_KEY) {
    headers.Authorization = `Bearer ${process.env.PLANETARY_AGENTS_API_KEY}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }

  return response.json();
}

async function enrichIngredient(
  candidate: Candidate,
): Promise<EnrichmentResult> {
  const enrichmentUrl = endpointFromEnv(
    "/api/enrich-ingredient",
    "PLANETARY_INGREDIENT_ENRICHMENT_URL",
  );
  const payload = {
    name: candidate.name,
    slug: candidate.slug,
    category: candidate.category,
    elementalProperties: extractValueProp(
      candidate.object,
      "elementalProperties",
    ),
    qualities: extractValueProp(candidate.object, "qualities"),
    culinaryProfile: extractValueProp(candidate.object, "culinaryProfile"),
    task: "Write a concise, premium, alchemically aligned culinary synopsis. Avoid markdown and avoid medical claims.",
  };

  const data = await postJson(enrichmentUrl, payload);
  return {
    description: data.description || data.synopsis || data.text,
    imageUrl: data.image_url || data.imageUrl || data.url,
  };
}

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

async function generateIngredientImage(
  candidate: Candidate,
  description: string,
): Promise<ImageGenerationResult> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
  const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || "alchm-assets";
  const r2Domain = process.env.NEXT_PUBLIC_R2_DOMAIN || "https://assets.alchm.kitchen";

  if (!accountId || !apiToken) {
    console.warn("  ⚠ Missing Cloudflare Workers AI credentials (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN)");
    return { fallback: true, fallbackReason: "missing credentials" };
  }
  if (!r2AccessKeyId || !r2SecretAccessKey) {
    console.warn("  ⚠ Missing Cloudflare R2 credentials (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)");
    return { fallback: true, fallbackReason: "missing credentials" };
  }

  // Category-aware framing. Without it SDXL renders "lamb" as a live sheep
  // (face included). For animal-source proteins we explicitly anchor on the
  // butcher cut. For seafood, the same trick — show the cut/fillet, not the
  // living creature.
  const lowerName = candidate.name.toLowerCase();
  const lowerCategory = (candidate.category || "").toLowerCase();
  const isAnimalProtein =
    lowerCategory === "protein" ||
    lowerCategory === "meat" ||
    lowerCategory === "poultry" ||
    lowerCategory === "seafood" ||
    /\b(lamb|beef|pork|chicken|duck|turkey|veal|venison|rabbit|goat|fish|salmon|tuna|cod|trout|halibut|shrimp|prawn|crab|lobster)\b/.test(
      lowerName,
    );

  const formClause = isAnimalProtein
    ? `raw butcher's cut of ${candidate.name}, prime cuts only, no animal head, no face, no eyes, no live animal`
    : `${candidate.name}`;

  const promptSegments = [
    `premium culinary photograph of ${formClause}`,
    candidate.category && !isAnimalProtein ? `(${candidate.category})` : "",
    "centered on dark slate surface",
    "studio lighting",
    "razor-sharp focus",
    "rich natural texture",
    "generous negative space for card cropping",
    "professional food photography",
  ].filter(Boolean);

  const prompt = promptSegments.join(", ");
  const negativePrompt = [
    "live animal",
    "animal face",
    "animal head",
    "eyes",
    "fur",
    "feathers",
    "scales of living fish",
    "whole carcass",
    "hands",
    "people",
    "person",
    "text",
    "labels",
    "watermark",
    "logo",
    "fantasy elements",
    "cartoon",
    "illustration",
    "painting",
  ].join(", ");

  const aiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`;

  try {
    const aiResponse = await fetch(aiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt, negative_prompt: negativePrompt })
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`Workers AI Error: ${aiResponse.status} ${errText}`);
    }

    const imageBuffer = await aiResponse.arrayBuffer();

    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey
      }
    });

    const key = `ingredients/${candidate.slug || candidate.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.png`;

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: new Uint8Array(imageBuffer),
      ContentType: "image/png"
    }));

    return { imageUrl: `${r2Domain}/${key}` };
  } catch (error) {
    console.error("  ✗ Cloudflare Workers AI / R2 generation failed:", error);
    return { fallback: true, fallbackReason: String(error) };
  }
}

function upsertStringProp(
  obj: ObjectLiteralExpression,
  name: string,
  value: string,
): boolean {
  if (!value.trim()) return false;
  const existing = getProp(obj, name);
  if (existing) {
    const init = existing.getInitializer();
    if (
      init &&
      (init.asKind(SyntaxKind.StringLiteral)?.getLiteralValue().trim() === "" ||
        init.asKind(SyntaxKind.NoSubstitutionTemplateLiteral)?.getLiteralValue().trim() === "")
    ) {
      init.replaceWithText(JSON.stringify(value.trim()));
      return true;
    }
    return false;
  }
  obj.insertPropertyAssignment(0, {
    name,
    initializer: JSON.stringify(value.trim()),
  });
  return true;
}

async function confirm(options: Options, count: number): Promise<boolean> {
  if (!options.apply || options.yes) return true;
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(
    `This will call Planetary Agents for ${count} ingredient(s) and edit local TypeScript files. Continue? (y/N) `,
  );
  rl.close();
  return answer.trim().toLowerCase() === "y";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const options = parseArgs();
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { noEmit: true, skipLibCheck: true },
  });

  const candidates = collectCandidates(project, options);
  const selected = candidates.slice(0, options.limit || candidates.length);

  console.log(
    JSON.stringify(
      {
        mode: options.apply ? "apply" : "dry-run",
        totalCandidates: candidates.length,
        selected: selected.length,
        includeImages: options.includeImages,
        missingDescriptions: candidates.filter((c) => c.missingDescription)
          .length,
        missingImages: candidates.filter((c) => c.missingImage).length,
        sample: selected.slice(0, 10).map((candidate) => ({
          name: candidate.name,
          file: path.relative(REPO_ROOT, candidate.file),
          missingDescription: candidate.missingDescription,
          missingImage: candidate.missingImage,
        })),
      },
      null,
      2,
    ),
  );

  if (!options.apply || selected.length === 0) return;
  if (!(await confirm(options, selected.length))) {
    console.log("Aborted.");
    return;
  }

  let descriptionsAdded = 0;
  let imagesAdded = 0;
  let failures = 0;
  let imageAttempts = 0;
  let imageFallbacks = 0;
  const fallbackCandidates: Candidate[] = [];
  const touchedFiles = new Set<string>();

  for (const [index, candidate] of selected.entries()) {
    console.log(`[${index + 1}/${selected.length}] ${candidate.name}`);
    try {
      let result: EnrichmentResult = {};
      if (candidate.missingDescription) {
        result = await enrichIngredient(candidate);
      }

      const existingDescription =
        getStringProp(candidate.object, "description") ||
        getStringProp(candidate.object, "flavor") ||
        getStringProp(candidate.object, "flavorDescription");
      const description = result.description || existingDescription;

      if (
        candidate.missingDescription &&
        result.description &&
        upsertStringProp(candidate.object, "description", result.description)
      ) {
        descriptionsAdded += 1;
        touchedFiles.add(candidate.file);
      }

      let imageUrl = result.imageUrl;
      if (options.includeImages && (candidate.missingImage || options.forceImages) && !imageUrl) {
        imageAttempts += 1;
        const imageResult = await generateIngredientImage(
          candidate,
          description,
        );
        if (imageResult.fallback) {
          imageFallbacks += 1;
          fallbackCandidates.push(candidate);
          console.warn(
            `  ⚠ fallback ${candidate.slug}: ${imageResult.fallbackReason}`,
          );
        } else if (imageResult.imageUrl) {
          imageUrl = imageResult.imageUrl;
          console.log(`  ✓ generated ${candidate.slug}`);
        }
      }
      if (
        options.includeImages &&
        (candidate.missingImage || options.forceImages) &&
        imageUrl &&
        upsertStringProp(candidate.object, "image_url", imageUrl)
      ) {
        imagesAdded += 1;
        touchedFiles.add(candidate.file);
      }
    } catch (error) {
      failures += 1;
      console.error(
        `  ✗ ${candidate.slug}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    if (index < selected.length - 1) await sleep(options.delayMs);
  }

  for (const sourceFile of project.getSourceFiles()) {
    if (touchedFiles.has(sourceFile.getFilePath())) sourceFile.saveSync();
  }

  if (
    options.includeImages &&
    imageAttempts > 0 &&
    imageFallbacks / imageAttempts > 0.2 &&
    fallbackCandidates.length > 0
  ) {
    console.warn(
      `Fallback rate ${imageFallbacks}/${imageAttempts} exceeded 20%; retrying ${fallbackCandidates.length} item(s) after 60s.`,
    );
    await sleep(60_000);

    for (const [index, candidate] of fallbackCandidates.entries()) {
      try {
        const description =
          getStringProp(candidate.object, "description") ||
          getStringProp(candidate.object, "flavor") ||
          getStringProp(candidate.object, "flavorDescription");
        const imageResult = await generateIngredientImage(
          candidate,
          description,
        );
        if (imageResult.fallback) {
          console.warn(
            `  ⚠ fallback ${candidate.slug}: ${imageResult.fallbackReason}`,
          );
        } else if (
          imageResult.imageUrl &&
          upsertStringProp(candidate.object, "image_url", imageResult.imageUrl)
        ) {
          imagesAdded += 1;
          touchedFiles.add(candidate.file);
          console.log(`  ✓ generated ${candidate.slug}`);
        }
      } catch (error) {
        failures += 1;
        console.error(
          `  ✗ ${candidate.slug}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }

      if (index < fallbackCandidates.length - 1) await sleep(options.delayMs);
    }

    for (const sourceFile of project.getSourceFiles()) {
      if (touchedFiles.has(sourceFile.getFilePath())) sourceFile.saveSync();
    }
  }

  console.log(
    `Done. descriptions=${descriptionsAdded}, images=${imagesAdded}, files=${touchedFiles.size}, failures=${failures}, imageFallbacks=${imageFallbacks}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
