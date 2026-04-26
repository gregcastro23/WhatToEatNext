import { alchemize } from "@/services/RealAlchemizeService";
import { createLogger } from "@/utils/logger";
import { unstable_cache } from "next/cache";

const logger = createLogger("HistoricalStatsService");

const BACKEND_URL =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
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
        const interval_hours = 12;

        // Timeout controller since we're calling external Python backend
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(`${BACKEND_URL}/api/planetary/positions/bulk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                start_date: start.toISOString(),
                end_date: end.toISOString(),
                interval_hours,
                zodiacSystem: "tropical"
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            throw new Error(`Bulk positions failed: ${res.status}`);
        }

        const payload = await res.json();
        if (!payload.success || !payload.data) {
            throw new Error("Invalid structure from bulk query");
        }

        const dateKeys = Object.keys(payload.data).sort();

        // We need 'prev' positions for `alchemize`, so we take the first as reference and drop it
        const datasets: {
            date: Date;
            positions: any;
            prevPositions: any;
        }[] = [];

        for (let i = 1; i < dateKeys.length; i++) {
            datasets.push({
                date: new Date(dateKeys[i]),
                positions: payload.data[dateKeys[i]],
                prevPositions: payload.data[dateKeys[i - 1]]
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
            const reactivity = alch.thermodynamicProperties.reactivity;
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
    async () => {
        return generateHistoricalStats();
    },
    ['historical-alchemical-stats'],
    { revalidate: 43200, tags: ['historical-stats'] }
);
