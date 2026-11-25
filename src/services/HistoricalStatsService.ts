import { unstable_cache } from "next/cache";
import { readJson } from "@/lib/api/json";
import { alchemize, type PlanetaryPosition } from "@/services/RealAlchemizeService";
import { createLogger } from "@/utils/logger";

const logger = createLogger("HistoricalStatsService");

const BACKEND_URL =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:8000";

export interface StatSummary {
    mean: number;
    variance: number;
    stdDev: number;
}

export interface HistoricalContext {
    timeframeDays: number;
    dataPoints: number;
    metrics: {
        Spirit: StatSummary;
        Essence: StatSummary;
        Matter: StatSummary;
        Substance: StatSummary;
        heat: StatSummary;
        entropy: StatSummary;
        reactivity: StatSummary;
        kalchm: StatSummary;
        monica: StatSummary;
        charge: StatSummary;
        power: StatSummary;
        currentFlow: StatSummary;
    };
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
    return typeof val === "object" && val !== null && !Array.isArray(val);
}

function isFiniteNumber(val: unknown): val is number {
    return typeof val === "number" && Number.isFinite(val);
}

function parsePlanetaryPosition(raw: unknown): PlanetaryPosition | null {
    if (!isPlainObject(raw)) return null;
    if (typeof raw.sign !== "string" || !isFiniteNumber(raw.degree)) {
        return null;
    }
    const minute = isFiniteNumber(raw.minute) ? raw.minute : 0;
    const pos: PlanetaryPosition = {
        sign: raw.sign,
        degree: raw.degree,
        minute,
    };
    if (typeof raw.isRetrograde === "boolean") pos.isRetrograde = raw.isRetrograde;
    if (isFiniteNumber(raw.exactLongitude)) pos.exactLongitude = raw.exactLongitude;
    if (isFiniteNumber(raw.distance)) pos.distance = raw.distance;
    return pos;
}

/**
 * Strip any non-planet-object entries from a raw positions dict.
 *
 * The Python backend used to embed `_aspects` (an array) directly
 * inside the positions dict. That caused `alchemize()` to receive a
 * mixed dict and silently corrupt alchemical math. The backend fix
 * moves aspects to a top-level key, but we filter defensively here
 * too so stale cache data or future drift can't re-introduce the bug.
 */
export function sanitizePositions(raw: unknown): Record<string, PlanetaryPosition> {
    if (!isPlainObject(raw)) return {};
    const result: Record<string, PlanetaryPosition> = {};
    for (const [key, val] of Object.entries(raw)) {
        const pos = parsePlanetaryPosition(val);
        if (pos) {
            result[key] = pos;
        }
    }
    return result;
}

export interface BulkPositionsPayload {
    success: true;
    data: Record<string, Record<string, PlanetaryPosition>>;
}

export function parseBulkPositionsPayload(raw: unknown): BulkPositionsPayload {
    if (!isPlainObject(raw) || raw.success !== true || !isPlainObject(raw.data)) {
        throw new Error("Invalid structure from bulk query");
    }
    const data: Record<string, Record<string, PlanetaryPosition>> = {};
    for (const [dateKey, rawPositions] of Object.entries(raw.data)) {
        data[dateKey] = sanitizePositions(rawPositions);
    }
    return { success: true, data };
}

function calculateMeanAndVariance(values: number[]): StatSummary {
    if (values.length === 0) return { mean: 0, variance: 0, stdDev: 0 };

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;

    let squaredDiffSum = 0;
    for (const v of values) {
        squaredDiffSum += Math.pow(v - mean, 2);
    }

    const variance = squaredDiffSum / values.length;
    const stdDev = Math.sqrt(variance);

    return { mean, variance, stdDev };
}

async function generateHistoricalStats(): Promise<HistoricalContext | null> {
    try {
        const end = new Date();
        // 30 day trailing window
        const start = new Date(end.getTime() - (30 * 24 * 60 * 60 * 1000));

        logger.info(`Fetching trailing 30 days bulk positions from ${start.toISOString()} to ${end.toISOString()}`);

        // 12-hour resolution yields 60 datapoints, an ideal statistical volume
        const intervalHours = 12;

        // Timeout controller since we're calling external Python backend
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(`${BACKEND_URL}/api/planetary/positions/bulk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                start_date: start.toISOString(),
                end_date: end.toISOString(),
                interval_hours: intervalHours,
                zodiacSystem: "tropical"
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            throw new Error(`Bulk positions failed: ${res.status}`);
        }

        const payload = await readJson(res, { parse: parseBulkPositionsPayload });

        const dateKeys = Object.keys(payload.data).sort();

        // We need 'prev' positions for `alchemize`, so we take the first as reference and drop it
        const datasets: Array<{
            date: Date;
            positions: Record<string, PlanetaryPosition>;
            prevPositions: Record<string, PlanetaryPosition>;
        }> = [];

        for (let i = 1; i < dateKeys.length; i++) {
            const curKey = dateKeys[i];
            const prevKey = dateKeys[i - 1];
            if (!curKey || !prevKey) continue;
            const curPositions = payload.data[curKey];
            const prevPositions = payload.data[prevKey];
            if (!curPositions || !prevPositions) continue;
            datasets.push({
                date: new Date(curKey),
                positions: curPositions,
                prevPositions,
            });
        }

        const arrays = {
            Spirit: [] as number[],
            Essence: [] as number[],
            Matter: [] as number[],
            Substance: [] as number[],
            heat: [] as number[],
            entropy: [] as number[],
            reactivity: [] as number[],
            kalchm: [] as number[],
            monica: [] as number[],
            charge: [] as number[],
            power: [] as number[],
            currentFlow: [] as number[],
        };

        for (const d of datasets) {
            // Local evaluation of physics per time-step
            const alch = alchemize(d.positions, d.prevPositions, d.date);

            arrays.Spirit.push(alch.esms.Spirit);
            arrays.Essence.push(alch.esms.Essence);
            arrays.Matter.push(alch.esms.Matter);
            arrays.Substance.push(alch.esms.Substance);

            arrays.heat.push(alch.thermodynamicProperties.heat);
            arrays.entropy.push(alch.thermodynamicProperties.entropy);
            arrays.reactivity.push(alch.thermodynamicProperties.reactivity);
            arrays.kalchm.push(alch.kalchm);
            arrays.monica.push(alch.monica);

            const charge = alch.esms.Matter + alch.esms.Substance;
            const energy = alch.thermodynamicProperties.gregsEnergy;
            const { reactivity } = alch.thermodynamicProperties;
            const potential = charge > 0 ? energy / charge : 0;
            const flow = reactivity * charge * 0.1;
            const p = flow * potential;

            arrays.charge.push(charge);
            arrays.currentFlow.push(flow);
            arrays.power.push(p);
        }

        return {
            timeframeDays: 30,
            dataPoints: arrays.kalchm.length,
            metrics: {
                Spirit: calculateMeanAndVariance(arrays.Spirit),
                Essence: calculateMeanAndVariance(arrays.Essence),
                Matter: calculateMeanAndVariance(arrays.Matter),
                Substance: calculateMeanAndVariance(arrays.Substance),
                heat: calculateMeanAndVariance(arrays.heat),
                entropy: calculateMeanAndVariance(arrays.entropy),
                reactivity: calculateMeanAndVariance(arrays.reactivity),
                kalchm: calculateMeanAndVariance(arrays.kalchm),
                monica: calculateMeanAndVariance(arrays.monica),
                charge: calculateMeanAndVariance(arrays.charge),
                power: calculateMeanAndVariance(arrays.power),
                currentFlow: calculateMeanAndVariance(arrays.currentFlow),
            }
        };
    } catch (error) {
        logger.error("Failed to generate historical statistics", { error });
        return null;
    }
}

/**
 * Fetch trailing 30 day statistics, cached aggressively by Next.js ISR.
 * Revalidates every 12 hours (43200 seconds)
 */
export const getCachedHistoricalStats = unstable_cache(
    async () => generateHistoricalStats(),
    ['historical-alchemical-stats'],
    { revalidate: 43200, tags: ['historical-stats'] }
);
