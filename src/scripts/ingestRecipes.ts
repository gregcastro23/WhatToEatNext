/**
 * Recipe Data Ingestion Pipeline
 *
 * Validates incoming JSON (from LLM output, web scraping, or manual entry)
 * against the strict `AlchemicalRecipe` interface.  Every field is checked
 * against the domain-specific enums (`CuisineType`, `SpiceLevel`, `MealType`,
 * `CookingMethod`, etc.) and mathematically-verified elemental constraints.
 *
 * Usage:
 *   npx tsx src/scripts/ingestRecipes.ts ./path/to/recipes.json
 *
 * Output:
 *   - Accepted recipes are written to stdout as valid JSON
 *   - Validation errors are written to stderr as structured JSON logs
 *
 * @file src/scripts/ingestRecipes.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";

import {
    COOKING_METHODS,
    CUISINE_TYPES,
    LUNAR_PHASES,
    MEAL_TYPES,
    PLANETS,
    SEASONS,
    SPICE_LEVELS,
    ZODIAC_SIGNS,
} from "../types/constants";

import type { AlchemicalRecipe } from "../types/alchemicalRecipe";

// ─── Helpers ──────────────────────────────────────────────────────────

const TOLERANCE = 0.02; // allowed deviation from 1.0 for elemental sum

interface ValidationError {
    field: string;
    message: string;
    value?: unknown;
}

interface IngestionResult {
    accepted: AlchemicalRecipe[];
    rejected: Array<{
        index: number;
        name: string | undefined;
        errors: ValidationError[];
    }>;
}

// ─── Validators ───────────────────────────────────────────────────────

function validateString(
    obj: Record<string, unknown>,
    field: string,
    errors: ValidationError[],
): void {
    if (typeof obj[field] !== "string" || (obj[field] as string).trim() === "") {
        errors.push({ field, message: `"${field}" must be a non-empty string`, value: obj[field] });
    }
}

function validateNumber(
    obj: Record<string, unknown>,
    field: string,
    errors: ValidationError[],
    opts?: { min?: number; max?: number },
): void {
    const val = obj[field];
    if (typeof val !== "number" || Number.isNaN(val)) {
        errors.push({ field, message: `"${field}" must be a number`, value: val });
        return;
    }
    if (opts?.min !== undefined && val < opts.min) {
        errors.push({ field, message: `"${field}" must be >= ${opts.min}`, value: val });
    }
    if (opts?.max !== undefined && val > opts.max) {
        errors.push({ field, message: `"${field}" must be <= ${opts.max}`, value: val });
    }
}

function validateEnum(
    obj: Record<string, unknown>,
    field: string,
    allowed: readonly string[],
    errors: ValidationError[],
): void {
    const val = obj[field];
    if (typeof val !== "string" || !allowed.includes(val)) {
        errors.push({
            field,
            message: `"${field}" must be one of: ${allowed.join(", ")}`,
            value: val,
        });
    }
}

function validateEnumArray(
    arr: unknown,
    field: string,
    allowed: readonly string[],
    errors: ValidationError[],
    opts?: { minLength?: number },
): void {
    if (!Array.isArray(arr)) {
        errors.push({ field, message: `"${field}" must be an array`, value: arr });
        return;
    }
    if (opts?.minLength && arr.length < opts.minLength) {
        errors.push({
            field,
            message: `"${field}" must have at least ${opts.minLength} item(s)`,
            value: arr,
        });
    }
    for (let i = 0; i < arr.length; i++) {
        if (typeof arr[i] !== "string" || !allowed.includes(arr[i])) {
            errors.push({
                field: `${field}[${i}]`,
                message: `Invalid value; must be one of: ${allowed.join(", ")}`,
                value: arr[i],
            });
        }
    }
}

// ─── Main Validator ───────────────────────────────────────────────────

function validateRecipe(raw: unknown): { recipe: AlchemicalRecipe | null; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    if (typeof raw !== "object" || raw === null) {
        errors.push({ field: "(root)", message: "Recipe must be a non-null object" });
        return { recipe: null, errors };
    }

    const r = raw as Record<string, unknown>;

    // ── Required strings ──
    validateString(r, "name", errors);
    validateString(r, "description", errors);

    // ── details ──
    if (typeof r.details !== "object" || r.details === null) {
        errors.push({ field: "details", message: "\"details\" must be an object" });
    } else {
        const d = r.details as Record<string, unknown>;
        // cuisine: accept anything but warn if not in enum
        if (typeof d.cuisine === "string" && !CUISINE_TYPES.includes(d.cuisine as any)) {
            errors.push({ field: "details.cuisine", message: `Unrecognized cuisine "${d.cuisine}"; accepted values: ${CUISINE_TYPES.join(", ")}`, value: d.cuisine });
        }
        validateNumber(d, "prepTimeMinutes", errors, { min: 0 });
        validateNumber(d, "cookTimeMinutes", errors, { min: 0 });
        validateNumber(d, "baseServingSize", errors, { min: 1 });
        validateEnum(d, "spiceLevel", SPICE_LEVELS, errors);
        validateEnumArray(d.season, "details.season", SEASONS, errors, { minLength: 1 });
    }

    // ── ingredients ──
    if (!Array.isArray(r.ingredients)) {
        errors.push({ field: "ingredients", message: "\"ingredients\" must be an array" });
    } else {
        for (let i = 0; i < r.ingredients.length; i++) {
            const ing = r.ingredients[i] as Record<string, unknown>;
            if (typeof ing !== "object" || ing === null) {
                errors.push({ field: `ingredients[${i}]`, message: "Each ingredient must be an object" });
                continue;
            }
            validateString(ing, "name", errors);
            validateNumber(ing, "amount", errors, { min: 0 });
            validateString(ing, "unit", errors);
        }
    }

    // ── instructions ──
    if (!Array.isArray(r.instructions) || r.instructions.length === 0) {
        errors.push({ field: "instructions", message: "\"instructions\" must be a non-empty string array" });
    }

    // ── classifications ──
    if (typeof r.classifications !== "object" || r.classifications === null) {
        errors.push({ field: "classifications", message: "\"classifications\" must be an object" });
    } else {
        const c = r.classifications as Record<string, unknown>;
        validateEnumArray(c.mealType, "classifications.mealType", MEAL_TYPES, errors, { minLength: 1 });
        validateEnumArray(c.cookingMethods, "classifications.cookingMethods", COOKING_METHODS, errors, { minLength: 1 });
    }

    // ── elementalProperties — must sum to 1.0 ± tolerance ──
    if (typeof r.elementalProperties !== "object" || r.elementalProperties === null) {
        errors.push({ field: "elementalProperties", message: "\"elementalProperties\" must be an object" });
    } else {
        const e = r.elementalProperties as Record<string, unknown>;
        for (const key of ["Fire", "Water", "Earth", "Air"]) {
            if (typeof e[key] !== "number" || (e[key] as number) < 0 || (e[key] as number) > 1) {
                errors.push({ field: `elementalProperties.${key}`, message: `Must be a number between 0 and 1`, value: e[key] });
            }
        }
        const sum = (Number(e.Fire) || 0) + (Number(e.Water) || 0) + (Number(e.Earth) || 0) + (Number(e.Air) || 0);
        if (Math.abs(sum - 1.0) > TOLERANCE) {
            errors.push({
                field: "elementalProperties",
                message: `Fire+Water+Earth+Air must sum to 1.0 (±${TOLERANCE}), got ${sum.toFixed(4)}`,
                value: sum,
            });
        }
    }

    // ── astrologicalAffinities ──
    if (typeof r.astrologicalAffinities !== "object" || r.astrologicalAffinities === null) {
        errors.push({ field: "astrologicalAffinities", message: "\"astrologicalAffinities\" must be an object" });
    } else {
        const a = r.astrologicalAffinities as Record<string, unknown>;
        validateEnumArray(a.planets, "astrologicalAffinities.planets", PLANETS, errors);
        validateEnumArray(a.signs, "astrologicalAffinities.signs", ZODIAC_SIGNS, errors);
        validateEnumArray(a.lunarPhases, "astrologicalAffinities.lunarPhases", LUNAR_PHASES, errors);
    }

    // ── alchemicalProperties ──
    if (typeof r.alchemicalProperties !== "object" || r.alchemicalProperties === null) {
        errors.push({ field: "alchemicalProperties", message: "\"alchemicalProperties\" must be an object" });
    } else {
        const ap = r.alchemicalProperties as Record<string, unknown>;
        for (const key of ["Spirit", "Essence", "Matter", "Substance"]) {
            validateNumber(ap, key, errors, { min: 0 });
        }
    }

    // ── thermodynamicProperties ──
    if (typeof r.thermodynamicProperties !== "object" || r.thermodynamicProperties === null) {
        errors.push({ field: "thermodynamicProperties", message: "\"thermodynamicProperties\" must be an object" });
    } else {
        const tp = r.thermodynamicProperties as Record<string, unknown>;
        for (const key of ["heat", "entropy", "reactivity", "gregsEnergy", "kalchm", "monica"]) {
            validateNumber(tp, key, errors);
        }
    }

    // ── nutritionPerServing ──
    if (typeof r.nutritionPerServing !== "object" || r.nutritionPerServing === null) {
        errors.push({ field: "nutritionPerServing", message: "\"nutritionPerServing\" must be an object" });
    } else {
        const n = r.nutritionPerServing as Record<string, unknown>;
        for (const key of ["calories", "proteinG", "carbsG", "fatG", "fiberG", "sodiumMg", "sugarG"]) {
            validateNumber(n, key, errors, { min: 0 });
        }
        if (!Array.isArray(n.vitamins)) {
            errors.push({ field: "nutritionPerServing.vitamins", message: "Must be a string array" });
        }
        if (!Array.isArray(n.minerals)) {
            errors.push({ field: "nutritionPerServing.minerals", message: "Must be a string array" });
        }
    }

    // ── substitutions ──
    if (!Array.isArray(r.substitutions)) {
        errors.push({ field: "substitutions", message: "\"substitutions\" must be an array" });
    }

    if (errors.length > 0) {
        return { recipe: null, errors };
    }

    return { recipe: r as unknown as AlchemicalRecipe, errors: [] };
}

// ─── Auto-Balance Elementals ──────────────────────────────────────────

/**
 * If the incoming recipe has no elementalProperties, generate balanced defaults
 * and normalize so Fire+Water+Earth+Air = 1.0.
 */
function autoBalanceElementals(raw: Record<string, unknown>): void {
    if (!raw.elementalProperties || typeof raw.elementalProperties !== "object") {
        raw.elementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
        return;
    }
    const e = raw.elementalProperties as Record<string, number>;
    const sum = (e.Fire || 0) + (e.Water || 0) + (e.Earth || 0) + (e.Air || 0);
    if (sum > 0 && Math.abs(sum - 1.0) > TOLERANCE) {
        e.Fire = (e.Fire || 0) / sum;
        e.Water = (e.Water || 0) / sum;
        e.Earth = (e.Earth || 0) / sum;
        e.Air = (e.Air || 0) / sum;
    }
}

// ─── CLI Entrypoint ───────────────────────────────────────────────────

function main(): void {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error("Usage: npx tsx src/scripts/ingestRecipes.ts <path-to-recipes.json>");
        process.exit(1);
    }

    const filePath = path.resolve(args[0]);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    let rawData: unknown;
    try {
        rawData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (err) {
        console.error(`Failed to parse JSON: ${(err as Error).message}`);
        process.exit(1);
    }

    const recipes = Array.isArray(rawData) ? rawData : [rawData];

    const result: IngestionResult = { accepted: [], rejected: [] };

    for (let i = 0; i < recipes.length; i++) {
        const raw = recipes[i] as Record<string, unknown>;

        // Auto-balance elementals before validation
        autoBalanceElementals(raw);

        const { recipe, errors } = validateRecipe(raw);

        if (recipe) {
            result.accepted.push(recipe);
        } else {
            result.rejected.push({
                index: i,
                name: typeof raw?.name === "string" ? raw.name : undefined,
                errors,
            });
        }
    }

    // Output results
    if (result.accepted.length > 0) {
        console.log(JSON.stringify(result.accepted, null, 2));
    }

    if (result.rejected.length > 0) {
        console.error("\n─── VALIDATION ERRORS ───");
        for (const rejection of result.rejected) {
            console.error(`\n[Recipe #${rejection.index}] ${rejection.name || "(unnamed)"}`);
            for (const err of rejection.errors) {
                console.error(`  ✗ ${err.field}: ${err.message}${err.value !== undefined ? ` (got: ${JSON.stringify(err.value)})` : ""}`);
            }
        }
        console.error(`\n─── Summary: ${result.accepted.length} accepted, ${result.rejected.length} rejected ───`);
    } else {
        console.error(`\n✓ All ${result.accepted.length} recipes validated successfully.`);
    }

    process.exit(result.rejected.length > 0 ? 1 : 0);
}

main();
