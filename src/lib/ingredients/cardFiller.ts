/**
 * Which card values are filler. Many catalog cards carry values written for a
 * whole category or generated to fill a slot ("mix, fold, bloom, dissolve",
 * "Check package for specific shelf life"). A value that many different cards
 * share verbatim says nothing about this one, so the culinary card hides it
 * (owner ruling 2026-11-25: show real data, hide filler, say what is missing).
 */

/**
 * [MEASURED 2026-11-25] The shared cooking-method, tip, flavor, pairing, sensory
 * and storage values each cover 25 to 336 of the 1,002 cards; values authored
 * for one ingredient or a small family are shared by far fewer.
 */
export const TEMPLATE_CARD_COUNT = 15;

/** Fields checked for sharing, as paths into a catalog card record. */
export const TEMPLATE_FIELDS = [
  "culinaryProfile.cookingMethods",
  "culinaryProfile.preparationTips",
  "culinaryProfile.flavorProfile",
  "culinaryProfile.cuisineAffinity",
  "pairingRecommendations",
  "sensoryProfile",
  "storage",
] as const;

export type TemplateField = (typeof TEMPLATE_FIELDS)[number];

export type CardRecord = Readonly<Record<string, unknown>>;

export function readPath(record: CardRecord, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => (typeof value === "object" && value !== null ? Reflect.get(value, key) : undefined), record);
}

export type TemplateIndex = ReadonlyMap<TemplateField, ReadonlySet<string>>;

/** The values of each field that {@link TEMPLATE_CARD_COUNT} or more cards share. */
export function buildTemplateIndex(records: readonly CardRecord[]): TemplateIndex {
  return new Map(
    TEMPLATE_FIELDS.map((field) => {
      const counts = new Map<string, number>();
      for (const record of records) {
        const value = readPath(record, field);
        if (value === undefined || value === null) continue;
        const key = JSON.stringify(value);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      const shared = [...counts].filter(([, count]) => count >= TEMPLATE_CARD_COUNT).map(([key]) => key);
      return [field, new Set(shared)];
    }),
  );
}

/** The field's value, or undefined when it is missing or shared filler. */
export function ownValue(record: CardRecord, field: TemplateField, templates: TemplateIndex): unknown {
  const value = readPath(record, field);
  if (value === undefined || value === null) return undefined;
  return templates.get(field)?.has(JSON.stringify(value)) ? undefined : value;
}

/** "Worldwide" is no origin, and every season is no season. */
export function meaningfulOrigins(origins: readonly string[]): string[] {
  return origins.filter((origin) => !/^(cultivated )?worldwide$/i.test(origin.trim()));
}

export function meaningfulSeasons(seasons: readonly string[]): string[] {
  const folded = new Set(seasons.map((season) => season.trim().toLowerCase().replace("autumn", "fall")));
  if (folded.has("all") || ["spring", "summer", "fall", "winter"].every((season) => folded.has(season))) return [];
  return [...folded];
}
