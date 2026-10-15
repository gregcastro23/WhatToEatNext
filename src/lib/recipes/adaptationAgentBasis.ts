import { createHash } from "node:crypto";
import { z } from "zod";
import { executeQuery } from "@/lib/database/connection";
import {
  ChartPlacementSchema,
  HistoricalPreferencesSchema,
  type SavedAdaptation,
} from "./savedAdaptationSchemas";

export class AdaptationUnavailable extends Error {}
export class AdaptationConflict extends Error {}

export function contentHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

const signs = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];
const sign = z
  .string()
  .toLowerCase()
  .refine((value) => signs.includes(value), "Unknown chart sign");
const PlacementsSchema = z.array(ChartPlacementSchema.extend({ sign })).min(5)
  .refine(rows => new Set(rows.map(row => row.planet.toLowerCase())).size >= 5, "Five distinct saved bodies are required");
const DegreePlacementsSchema = z.array(z.object({
  planet: z.string().min(1), sign, degree: z.number().finite().min(0).lt(30),
})).transform(rows => rows.map(row => ({ planet: row.planet, sign: row.sign, position: signs.indexOf(row.sign) * 30 + row.degree }))).pipe(PlacementsSchema);
const AgentChartSchema = z
  .object({
    planets: z.record(
      z.string(),
      z.object({ sign, degree: z.number().finite().min(0).lt(30) }),
    ),
  })
  .transform((value) =>
    Object.entries(value.planets).map(([planet, placement]) => ({
      planet,
      sign: placement.sign,
      position: signs.indexOf(placement.sign) * 30 + placement.degree,
    })),
  );
const HumanChartSchema = z
  .object({
    planets: z
      .array(
        z.object({
          name: z.string().min(1),
          sign,
          position: z.number().finite().min(0).lt(360),
        }),
      )
      .min(5),
  })
  .transform((value) =>
    value.planets.map((p) => ({
      planet: p.name,
      sign: p.sign,
      position: p.position,
    })),
  );

type ChartBasis = SavedAdaptation["receipt"]["basis"]["chart"];
export interface AdaptationAgentBasis {
  actor: SavedAdaptation["receipt"]["actor"];
  chart: ChartBasis;
  preferences: SavedAdaptation["receipt"]["basis"]["preferences"];
}

export function readSavedChart(
  natalPositions: unknown,
  natalChart: unknown,
): ChartBasis {
  // Historical sync stores sign+degree; newer sync also stores absolute position.
  // A missing degree is never replaced by zero, and the dead longitude key is ignored.
  const stored = z.union([PlacementsSchema, DegreePlacementsSchema]).safeParse(natalPositions);
  if (stored.success)
    return {
      source: "user_profiles.natal_positions",
      digest: contentHash(stored.data),
      placements: stored.data,
    };
  const chart = z
    .union([HumanChartSchema, AgentChartSchema])
    .pipe(PlacementsSchema)
    .safeParse(natalChart);
  if (!chart.success)
    throw new AdaptationUnavailable(
      "This agent has no usable saved chart for an adaptation.",
    );
  return {
    source: "user_profiles.natal_chart",
    digest: contentHash(chart.data),
    placements: chart.data,
  };
}

interface AgentBasisRow {
  id: string;
  name: string | null;
  natal_positions: unknown;
  natal_chart: unknown;
  dietary_preferences: unknown;
}

export async function loadAdaptationAgent(
  slug: string,
): Promise<AdaptationAgentBasis> {
  const result = await executeQuery<AgentBasisRow>(
    `SELECT u.id, COALESCE(up.name,u.name) AS name, up.natal_positions, up.natal_chart, up.dietary_preferences
       FROM users u JOIN user_profiles up ON up.user_id=u.id
      WHERE u.is_agent=true AND lower(u.email)=lower($1)||'@agentic.alchm.kitchen' LIMIT 1`,
    [slug],
  );
  const [row] = result.rows;
  if (!row)
    throw new AdaptationUnavailable(
      "The selected agent's saved profile is unavailable.",
    );
  const values = HistoricalPreferencesSchema.safeParse(row.dietary_preferences);
  if (!values.success)
    throw new AdaptationUnavailable(
      "This agent has no usable saved food preferences for an adaptation.",
    );
  const name = z.string().trim().min(1).safeParse(row.name);
  if (!name.success)
    throw new AdaptationUnavailable(
      "The selected agent's name is unavailable.",
    );
  return {
    actor: { id: row.id, slug, name: name.data },
    chart: readSavedChart(row.natal_positions, row.natal_chart),
    preferences: {
      source: "user_profiles.dietary_preferences",
      digest: contentHash(values.data),
      values: values.data,
    },
  };
}
