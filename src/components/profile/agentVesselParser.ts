/**
 * Wire parser for the `vessel` block of GET /api/users/[userId].
 *
 * Producer: `src/app/api/users/[userId]/route.ts`, external-agent path lines
 * 213-227 and DB path lines 449-499. Both build the block from
 * `computeAgentProgression` (`src/lib/agents/levelingService.ts:94`; result type
 * `AgentProgressionProfile` at :42-59) plus `resolveAgentAppearance`
 * (`src/lib/agents/vessel-appearance-manifest.ts:861`,
 * `VesselAppearanceProfile` at :80). `vessel` is `null` for non-agent users
 * (route.ts:449-463), so a missing block is a normal answer, not drift.
 *
 * The block is ancillary: `AgentProfile` recomputes a vessel client-side when it
 * receives `null`. So anything malformed here degrades to `null` (or drops the
 * optional `appearance` / one stat entry) and is REPORTED through `issues`; it
 * never fails the whole profile. Unknown keys are not copied.
 */

import type { AgentVesselData } from "@/components/profile/AgentVesselCard";
import type { VesselAppearanceProfile } from "@/lib/agents/vessel-appearance-manifest";
import { isJsonRecord } from "@/lib/api/json";

type Status = AgentVesselData["progressionStatus"];

interface AppearanceUrls {
  portraitSvgDataUri?: string;
  portraitUrl?: string;
  avatarModelUrl?: string;
  headMeshUrl?: string;
}

interface VesselScalars {
  level: number;
  totalXp: number;
  xpToNextLevel: number | null;
  levelBoost: number;
  baseOverall: number;
  trainedOverall: number;
  currentOverall: number;
  transitDelta: number;
}

function finite(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function status(value: unknown): Status | null {
  return value === "live" || value === "estimated" || value === "unavailable" ? value : null;
}

/** `VesselEra` is a CLOSED union (the style fields beside it are open `| string`). */
function parseEra(value: unknown): VesselAppearanceProfile["era"] | null {
  switch (value) {
    case "ancient":
    case "renaissance":
    case "enlightenment":
    case "romantic":
    case "modern":
    case "astral":
      return value;
    default:
      return null;
  }
}

/** Finite-number entries of a record; a bad entry is dropped and reported. */
function numberRecord(value: unknown, path: string, issues: string[]): Record<string, number> | null {
  if (!isJsonRecord(value)) return null;
  const out: Record<string, number> = {};
  for (const [key, entry] of Object.entries(value)) {
    const n = finite(entry);
    if (n === null) issues.push(`${path}.${key}: not a finite number`);
    else out[key] = n;
  }
  return out;
}

function parseArchetype(value: unknown): AgentVesselData["archetype"] | null {
  if (!isJsonRecord(value)) return null;
  const { title, primary, secondary } = value;
  if (typeof title !== "string" || typeof primary !== "string" || typeof secondary !== "string") return null;
  return { title, primary, secondary };
}

function parseFace(value: unknown): { jawWidth: number; browDepth: number; cranialHeight: number } | null {
  if (!isJsonRecord(value)) return null;
  const jawWidth = finite(value.jawWidth);
  const browDepth = finite(value.browDepth);
  const cranialHeight = finite(value.cranialHeight);
  if (jawWidth === null || browDepth === null || cranialHeight === null) return null;
  return { jawWidth, browDepth, cranialHeight };
}

function parsePalette(value: unknown): VesselAppearanceProfile["paletteOverrides"] | null {
  if (!isJsonRecord(value)) return null;
  const primaryGarmentHex = text(value.primaryGarmentHex);
  const secondaryTrimHex = text(value.secondaryTrimHex);
  const hairOrCrownHex = text(value.hairOrCrownHex);
  const skinOrMaterialToneHex = text(value.skinOrMaterialToneHex);
  if (primaryGarmentHex === null || secondaryTrimHex === null) return null;
  if (hairOrCrownHex === null || skinOrMaterialToneHex === null) return null;
  return { primaryGarmentHex, secondaryTrimHex, hairOrCrownHex, skinOrMaterialToneHex };
}

/** An optional string field: a string, or absent. A wrong type is reported and treated as absent. */
function optionalText(record: Record<string, unknown>, key: string, issues: string[]): string | null {
  const raw = record[key];
  if (raw === undefined) return null;
  if (typeof raw === "string") return raw;
  issues.push(`vessel.appearance.${key}: not a string`);
  return null;
}

function optionalUrls(record: Record<string, unknown>, issues: string[]): AppearanceUrls {
  const portraitSvgDataUri = optionalText(record, "portraitSvgDataUri", issues);
  const portraitUrl = optionalText(record, "portraitUrl", issues);
  const avatarModelUrl = optionalText(record, "avatarModelUrl", issues);
  const headMeshUrl = optionalText(record, "headMeshUrl", issues);
  return {
    ...(portraitSvgDataUri !== null ? { portraitSvgDataUri } : {}),
    ...(portraitUrl !== null ? { portraitUrl } : {}),
    ...(avatarModelUrl !== null ? { avatarModelUrl } : {}),
    ...(headMeshUrl !== null ? { headMeshUrl } : {}),
  };
}

function parseAppearance(value: unknown, issues: string[]): VesselAppearanceProfile | null {
  if (!isJsonRecord(value)) return null;
  const { headSilhouette, garmentSilhouette } = value;
  const era = parseEra(value.era);
  const signatureRelic = text(value.signatureRelic);
  const crownStyle = isJsonRecord(headSilhouette) ? text(headSilhouette.crownStyle) : null;
  const faceProportion = isJsonRecord(headSilhouette) ? parseFace(headSilhouette.faceProportion) : null;
  const mantleStyle = isJsonRecord(garmentSilhouette) ? text(garmentSilhouette.mantleStyle) : null;
  const collarStyle = isJsonRecord(garmentSilhouette) ? text(garmentSilhouette.collarStyle) : null;
  const paletteOverrides = parsePalette(value.paletteOverrides);
  if (era === null || signatureRelic === null || paletteOverrides === null) return null;
  if (crownStyle === null || faceProportion === null) return null;
  if (mantleStyle === null || collarStyle === null) return null;
  return {
    era,
    headSilhouette: { crownStyle, faceProportion },
    garmentSilhouette: { mantleStyle, collarStyle },
    signatureRelic,
    paletteOverrides,
    ...optionalUrls(value, issues),
  };
}

function parseScalars(value: Record<string, unknown>): VesselScalars | null {
  const level = finite(value.level);
  const totalXp = finite(value.totalXp);
  const levelBoost = finite(value.levelBoost);
  const baseOverall = finite(value.baseOverall);
  const trainedOverall = finite(value.trainedOverall);
  const currentOverall = finite(value.currentOverall);
  const transitDelta = finite(value.transitDelta);
  // null is a real answer here (max level); only a non-null non-number is a defect.
  const xpToNextLevel = finite(value.xpToNextLevel);
  if (xpToNextLevel === null && value.xpToNextLevel !== null) return null;
  if (level === null || totalXp === null || levelBoost === null) return null;
  if (baseOverall === null || trainedOverall === null || currentOverall === null) return null;
  if (transitDelta === null) return null;
  return { level, totalXp, xpToNextLevel, levelBoost, baseOverall, trainedOverall, currentOverall, transitDelta };
}

/** An optional `Record<string, number>`: absent is fine, a non-object is reported. */
function optionalNumberRecord(value: unknown, path: string, issues: string[]): Record<string, number> | null {
  if (value === undefined) return null;
  const parsed = numberRecord(value, path, issues);
  if (parsed === null) issues.push(`${path}: not an object, dropped`);
  return parsed;
}

/**
 * `null` when there is no vessel (normal for humans) or when the block is
 * malformed; the second case also pushes a reason onto `issues`.
 */
export function parseAgentVessel(value: unknown, issues: string[]): AgentVesselData | null {
  if (value === undefined || value === null) return null;
  if (!isJsonRecord(value)) {
    issues.push("vessel: not an object");
    return null;
  }
  const scalars = parseScalars(value);
  const progressionStatus = status(value.progressionStatus);
  const archetype = parseArchetype(value.archetype);
  const stats = numberRecord(value.stats, "vessel.stats", issues);
  if (scalars === null || progressionStatus === null || archetype === null || stats === null) {
    issues.push("vessel: a required field is missing or mistyped");
    return null;
  }
  const statDeltas = optionalNumberRecord(value.statDeltas, "vessel.statDeltas", issues);
  const appearance = value.appearance === undefined ? null : parseAppearance(value.appearance, issues);
  if (value.appearance !== undefined && appearance === null) issues.push("vessel.appearance: malformed, dropped");
  return {
    ...scalars,
    progressionStatus,
    archetype,
    stats,
    ...(statDeltas !== null ? { statDeltas } : {}),
    ...(appearance !== null ? { appearance } : {}),
  };
}
