import { z } from "zod";
import { parseEach } from "@/lib/api/json";
import { _logger } from "@/lib/logger";
import { isPlanet, isZodiacSignType } from "@/types/constants";
import type {
  NatalChart,
  BirthData,
  PlanetInfo,
  Planet,
  ZodiacSignType,
  Element,
  ElementalProperties,
  AlchemicalProperties,
} from "@/types/natalChart";
import {
  BirthDataSchema,
  NatalChartSchema,
  GroupMemberSchema,
  DiningGroupSchema,
} from "./commensalResponseSchemas";

export const TokenEconomyStateSchema = z
  .object({
    balances: z.object({
      spirit: z.number(),
      essence: z.number(),
      matter: z.number(),
      substance: z.number(),
    }),
    isPremium: z.boolean(),
    streakCount: z.number(),
    lastDailyClaimAt: z.string().nullable().optional(),
  })
  .passthrough();

export const SavedChartSchema = z
  .object({
    id: z.string(),
    ownerId: z.string().optional(),
    label: z.string(),
    chartType: z.enum(["primary", "cosmic_identity", "manual"]).optional(),
    birthData: BirthDataSchema.optional(),
    natalChart: NatalChartSchema.optional(),
    isPrimary: z.boolean().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();

export const ServerProfileDataSchema = z
  .object({
    id: z.string().optional(),
    userId: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional(),
    preferences: z.record(z.string(), z.unknown()).optional(),
    dietaryPreferences: z.record(z.string(), z.unknown()).optional(),
    onboardingComplete: z.boolean().optional(),
    birthData: BirthDataSchema.optional().catch((ctx) => {
      if (ctx.input !== undefined && ctx.input !== null) {
        _logger.error("[ServerProfileDataSchema] Failed to parse birthData:", ctx.error);
      }
      return undefined;
    }),
    natalChart: NatalChartSchema.optional().catch((ctx) => {
      if (ctx.input !== undefined && ctx.input !== null) {
        _logger.error("[ServerProfileDataSchema] Failed to parse natalChart:", ctx.error);
      }
      return undefined;
    }),
    groupMembers: z.unknown().optional().transform((items) => {
      if (items === undefined) return undefined;
      if (!Array.isArray(items)) return [];
      return parseEach(items, (item) => GroupMemberSchema.parse(item), {
        onError: (err) => _logger.error("[ServerProfileDataSchema] Failed to parse groupMember:", err),
      }).items;
    }),
    diningGroups: z.unknown().optional().transform((items) => {
      if (items === undefined) return undefined;
      if (!Array.isArray(items)) return [];
      return parseEach(items, (item) => DiningGroupSchema.parse(item), {
        onError: (err) => _logger.error("[ServerProfileDataSchema] Failed to parse diningGroup:", err),
      }).items;
    }),
    savedCharts: z.unknown().optional().transform((items) => {
      if (items === undefined) return undefined;
      if (!Array.isArray(items)) return [];
      return parseEach(items, (item) => SavedChartSchema.parse(item), {
        onError: (err) => _logger.error("[ServerProfileDataSchema] Failed to parse savedChart:", err),
      }).items;
    }),
    tokenEconomy: TokenEconomyStateSchema.optional().catch(undefined),
    stats: z.record(z.string(), z.unknown()).optional().catch(undefined),
  })
  .passthrough();

export const ServerProfileResponseSchema = z
  .object({
    success: z.boolean().optional(),
    profile: ServerProfileDataSchema.optional(),
    message: z.string().optional(),
  })
  .passthrough();

export type ServerProfileResponseWire = z.infer<typeof ServerProfileResponseSchema>;
export type ServerProfileDataWire = z.infer<typeof ServerProfileDataSchema>;

function isDominantElement(val: unknown): val is Element {
  return val === "Fire" || val === "Earth" || val === "Air" || val === "Water";
}

function isTimezoneBasis(val: unknown): val is BirthData["timezoneBasis"] {
  return (
    val === "DERIVED_FROM_COORDINATES" ||
    val === "STORED_IANA_STRING" ||
    val === "ABSENT"
  );
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

function toZodiacSignType(sign: unknown): ZodiacSignType {
  if (typeof sign === "string") {
    const lower = sign.toLowerCase();
    if (isZodiacSignType(lower)) {
      return lower;
    }
  }
  return "aries";
}

function extractBirthData(wire: z.infer<typeof NatalChartSchema>): BirthData {
  return {
    dateTime: wire.birthData?.dateTime ?? "",
    latitude: wire.birthData?.latitude ?? 0,
    longitude: wire.birthData?.longitude ?? 0,
    ...(wire.birthData?.utcInstant ? { utcInstant: wire.birthData.utcInstant } : {}),
    ...(wire.birthData?.timezone ? { timezone: wire.birthData.timezone } : {}),
    ...(wire.birthData?.timezoneBasis && isTimezoneBasis(wire.birthData.timezoneBasis)
      ? { timezoneBasis: wire.birthData.timezoneBasis }
      : {}),
    ...(wire.birthData?.location ? { location: wire.birthData.location } : {}),
  };
}

function extractPlanetaryMap(
  wire: z.infer<typeof NatalChartSchema>,
  planets: PlanetInfo[],
  ascendant: ZodiacSignType,
): Record<Planet, ZodiacSignType> {
  const map: Record<Planet, ZodiacSignType> = {
    Sun: "aries",
    Moon: "taurus",
    Mercury: "gemini",
    Venus: "cancer",
    Mars: "leo",
    Jupiter: "virgo",
    Saturn: "libra",
    Uranus: "scorpio",
    Neptune: "sagittarius",
    Pluto: "capricorn",
    Ascendant: ascendant,
  };
  if (wire.planetaryPositions) {
    for (const [k, v] of Object.entries(wire.planetaryPositions)) {
      if (isPlanet(k)) map[k] = toZodiacSignType(v);
    }
  }
  for (const p of planets) {
    map[p.name] = p.sign;
  }
  return map;
}

function extractBalances(wire: z.infer<typeof NatalChartSchema>): {
  elemental: ElementalProperties;
  alchemical: AlchemicalProperties;
} {
  const e = isRecord(wire.elementalBalance) ? wire.elementalBalance : {};
  const a = isRecord(wire.alchemicalProperties) ? wire.alchemicalProperties : {};
  return {
    elemental: {
      Fire: typeof e.Fire === "number" ? e.Fire : 0.25,
      Earth: typeof e.Earth === "number" ? e.Earth : 0.25,
      Air: typeof e.Air === "number" ? e.Air : 0.25,
      Water: typeof e.Water === "number" ? e.Water : 0.25,
    },
    alchemical: {
      Spirit: typeof a.Spirit === "number" ? a.Spirit : 0.25,
      Essence: typeof a.Essence === "number" ? a.Essence : 0.25,
      Matter: typeof a.Matter === "number" ? a.Matter : 0.25,
      Substance: typeof a.Substance === "number" ? a.Substance : 0.25,
    },
  };
}

export function toDomainNatalChart(wire: z.infer<typeof NatalChartSchema>): NatalChart {
  const planets: PlanetInfo[] = (wire.planets ?? []).map((p) => ({
    name: isPlanet(p.name) ? p.name : "Sun",
    sign: toZodiacSignType(p.sign),
    position: typeof p.position === "number" ? p.position : 0,
  }));
  const ascendant = toZodiacSignType(wire.ascendant);
  const { elemental, alchemical } = extractBalances(wire);

  return {
    ...(wire.id !== undefined ? { id: wire.id } : {}),
    ...(wire.name !== undefined ? { name: wire.name } : {}),
    birthData: extractBirthData(wire),
    planets,
    ascendant,
    planetaryPositions: extractPlanetaryMap(wire, planets, ascendant),
    dominantElement: isDominantElement(wire.dominantElement) ? wire.dominantElement : "Fire",
    dominantModality: wire.dominantModality ?? "Cardinal",
    elementalBalance: elemental,
    alchemicalProperties: alchemical,
    calculatedAt: typeof wire.calculatedAt === "string" ? wire.calculatedAt : new Date().toISOString(),
  };
}

export interface DomainUserProfile {
  userId: string;
  name?: string;
  email?: string;
  preferences?: Record<string, unknown>;
  dietaryPreferences?: Record<string, unknown>;
  onboardingComplete?: boolean;
  birthData?: z.infer<typeof BirthDataSchema>;
  natalChart?: z.infer<typeof NatalChartSchema>;
  groupMembers?: Array<z.infer<typeof GroupMemberSchema>>;
  diningGroups?: Array<z.infer<typeof DiningGroupSchema>>;
  savedCharts?: Array<z.infer<typeof SavedChartSchema>>;
  tokenEconomy?: z.infer<typeof TokenEconomyStateSchema>;
  stats?: Record<string, unknown>;
}

export function toDomainUserProfile(
  wire: ServerProfileDataWire,
  fallbackUserId?: string,
): DomainUserProfile {
  const result: DomainUserProfile = {
    userId: wire.userId ?? wire.id ?? fallbackUserId ?? "",
  };
  if (wire.name !== undefined) result.name = wire.name;
  if (wire.email !== undefined) result.email = wire.email;
  if (wire.preferences !== undefined) result.preferences = wire.preferences;
  if (wire.dietaryPreferences !== undefined) result.dietaryPreferences = wire.dietaryPreferences;
  if (wire.onboardingComplete !== undefined) result.onboardingComplete = wire.onboardingComplete;
  if (wire.birthData !== undefined) result.birthData = wire.birthData;
  if (wire.natalChart !== undefined) {
    result.natalChart = wire.natalChart;
  }
  if (wire.groupMembers !== undefined) result.groupMembers = wire.groupMembers;
  if (wire.diningGroups !== undefined) result.diningGroups = wire.diningGroups;
  if (wire.savedCharts !== undefined) result.savedCharts = wire.savedCharts;
  if (wire.tokenEconomy !== undefined) result.tokenEconomy = wire.tokenEconomy;
  if (wire.stats !== undefined) result.stats = wire.stats;
  return result;
}
