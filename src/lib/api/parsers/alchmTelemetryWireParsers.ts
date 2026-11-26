/**
 * Pure runtime wire parsers for alchemical telemetry & dashboard recommendation routes.
 *
 * @file src/lib/api/parsers/alchmTelemetryWireParsers.ts
 */

import {
  isPlainObject,
  readFiniteNumber,
  readString,
  readStringRecord,
} from "./wirePrimitives";

export interface HealthPayload {
  status?: string;
  services?: Record<string, string>;
  timestamp?: string;
}

export interface PlanetaryContributionPosition {
  sign: string;
  degree: number;
  minute: number;
  exactLongitude: number;
  isRetrograde: boolean;
}

export interface PlanetaryContributionData {
  name: string;
  position: PlanetaryContributionPosition;
  esms: { Spirit: number; Essence: number; Matter: number; Substance: number };
  signElement?: string;
  sectElement: string;
  signQuality: string;
  transition: {
    nextSign: string;
    estimatedDate: Date | string;
    daysUntil: number;
    direction: "forward" | "retrograde";
  };
}

export interface PlanetaryContributionsData {
  planets: PlanetaryContributionData[];
  isDiurnal: boolean;
  timestamp: string;
}

export interface TrendPoint {
  time: string;
  iso?: string;
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
  Fire?: number;
  Water?: number;
  Earth?: number;
  Air?: number;
  isDiurnal?: boolean;
}

/** Producer: `src/app/api/health/route.ts:35-65` */
export function parseHealthPayload(raw: unknown): HealthPayload | null {
  if (!isPlainObject(raw)) return null;
  const out: HealthPayload = {};
  if (typeof raw.status === "string") out.status = raw.status;
  if (typeof raw.timestamp === "string") out.timestamp = raw.timestamp;
  const services = readStringRecord(raw.services);
  if (services) out.services = services;
  return out;
}

function parseEsms(raw: unknown): { Spirit: number; Essence: number; Matter: number; Substance: number } | null {
  if (!isPlainObject(raw)) return null;
  const Spirit = readFiniteNumber(raw.Spirit);
  const Essence = readFiniteNumber(raw.Essence);
  const Matter = readFiniteNumber(raw.Matter);
  const Substance = readFiniteNumber(raw.Substance);
  if (Spirit === undefined || Essence === undefined || Matter === undefined || Substance === undefined) {
    return null;
  }
  return { Spirit, Essence, Matter, Substance };
}

function parsePlanetaryPosition(raw: unknown): PlanetaryContributionPosition | null {
  if (!isPlainObject(raw)) return null;
  const sign = readString(raw.sign);
  const degree = readFiniteNumber(raw.degree);
  const minute = readFiniteNumber(raw.minute);
  const exactLongitude = readFiniteNumber(raw.exactLongitude);
  if (!sign || degree === undefined || minute === undefined || exactLongitude === undefined || typeof raw.isRetrograde !== "boolean") {
    return null;
  }
  return { sign, degree, minute, exactLongitude, isRetrograde: raw.isRetrograde };
}

function parseTransition(raw: unknown): PlanetaryContributionData["transition"] | null {
  if (!isPlainObject(raw)) return null;
  const nextSign = readString(raw.nextSign);
  const estimatedDate = readString(raw.estimatedDate);
  const daysUntil = readFiniteNumber(raw.daysUntil);
  const direction = raw.direction === "forward" || raw.direction === "retrograde" ? raw.direction : undefined;
  if (!nextSign || !estimatedDate || daysUntil === undefined || !direction) return null;
  return { nextSign, estimatedDate, daysUntil, direction };
}

function parsePlanetRow(raw: unknown): PlanetaryContributionData | null {
  if (!isPlainObject(raw)) return null;
  const name = readString(raw.name);
  const position = parsePlanetaryPosition(raw.position);
  const esms = parseEsms(raw.esms);
  const sectElement = readString(raw.sectElement);
  const signQuality = readString(raw.signQuality);
  const transition = parseTransition(raw.transition);
  if (!name || !position || !esms || !sectElement || !signQuality || !transition) return null;
  const item: PlanetaryContributionData = { name, position, esms, sectElement, signQuality, transition };
  if (typeof raw.signElement === "string") item.signElement = raw.signElement;
  return item;
}

/** Producer: `src/app/api/alchm-quantities/planetary/route.ts:148-153` */
export function parsePlanetaryContributionsResponse(raw: unknown): PlanetaryContributionsData {
  if (!isPlainObject(raw) || !Array.isArray(raw.planets) || typeof raw.isDiurnal !== "boolean" || typeof raw.timestamp !== "string") {
    throw new TypeError("Invalid planetary contributions payload");
  }
  const planets = raw.planets.map(parsePlanetRow).filter((p): p is PlanetaryContributionData => p !== null);
  if (raw.planets.length > 0 && planets.length === 0) {
    throw new TypeError("All planetary contribution rows were malformed");
  }
  return { planets, isDiurnal: raw.isDiurnal, timestamp: raw.timestamp };
}

function parseTrendPoint(raw: unknown): TrendPoint | null {
  if (!isPlainObject(raw)) return null;
  const time = readString(raw.time);
  const esms = parseEsms(raw);
  if (!time || !esms) return null;
  const point: TrendPoint = { time, ...esms };
  if (typeof raw.iso === "string") point.iso = raw.iso;
  const fire = readFiniteNumber(raw.Fire);
  const water = readFiniteNumber(raw.Water);
  const earth = readFiniteNumber(raw.Earth);
  const air = readFiniteNumber(raw.Air);
  if (fire !== undefined) point.Fire = fire;
  if (water !== undefined) point.Water = water;
  if (earth !== undefined) point.Earth = earth;
  if (air !== undefined) point.Air = air;
  if (typeof raw.isDiurnal === "boolean") point.isDiurnal = raw.isDiurnal;
  return point;
}

/** Producer: `src/app/api/alchm-quantities/trends/route.ts:98-126` */
export function parseAlchmTrendsResponse(raw: unknown): TrendPoint[] {
  if (!isPlainObject(raw) || !Array.isArray(raw.trends)) {
    throw new TypeError("Invalid alchemical trends payload");
  }
  const parsed = raw.trends.map(parseTrendPoint).filter((t): t is TrendPoint => t !== null);
  if (raw.trends.length > 0 && parsed.length === 0) {
    throw new TypeError("All trend rows were malformed");
  }
  return parsed;
}
