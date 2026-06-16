import { useCallback, useEffect, useRef, useState } from "react";
import { alchemize } from "@/calculations/core/alchemicalEngine";
import { calculateKinetics } from "@/calculations/kinetics";
import { useUser } from "@/contexts/UserContext";
import { AspectsService } from "@/services/AspectsService";
import {
  getCurrentPlanetaryPositions,
  getPlanetaryPositionsForDateTime,
} from "@/services/astrologizeApi";
import type { PlanetaryAspect, PlanetaryPosition } from "@/types/celestial";
import type { KineticMetrics } from "@/types/kinetics";
import {
  aggregateZodiacElementals,
  calculateEnhancedAlchemicalFromPlanets,
  isSectDiurnal,
} from "@/utils/planetaryAlchemyMapping";

/**
 * useChartData Hook
 *
 * Fetches planetary positions from the astrologize API and computes aspects,
 * alchemical (ESMS / elemental / thermodynamic) properties, and planetary
 * kinetics (P=IV) client-side from the fetched positions. Mirrors the
 * calculation pipeline used by /api/alchemize and usePlanetaryKinetics so the
 * math stays consistent across the app.
 */
type PlanetPosition = PlanetaryPosition;

// Default location (New York City) so the hook never hangs waiting on a
// location the caller forgot to supply.
const DEFAULT_LOCATION = { latitude: 40.7128, longitude: -74.006 };

// Define the expected structure of AlchemicalResult
export interface AlchemicalResult {
  // Properties expected by AlchemicalDisplay.tsx
  elementalProperties: Record<string, number>;
  thermodynamicProperties: {
    heat: number;
    entropy: number;
    reactivity: number;
    gregsEnergy?: number;
  };
  esms: Record<string, number>;
  kalchm: number;
  monica: number;
  score: number;
  metadata?: {
    dominantElement?: string;
    sunSign?: string;
    source?: string;
    chartRuler?: string;
    dominantModality?: string;
  };
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}
// Define the return type of the useChartData hook
export interface ChartData {
  positions: Record<string, PlanetPosition> | null;
  aspects: PlanetaryAspect[];
  alchemical: AlchemicalResult | null;
  kinetics: KineticMetrics | null;
  timestamp: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
export interface ChartDataOptions {
  dateTime?: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  zodiacSystem?: "tropical" | "sidereal";
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

const ELEMENTS = ["Fire", "Water", "Earth", "Air"] as const;

/** Capitalize a lowercase sign ("aries" -> "Aries") for ZODIAC_ELEMENTS lookups. */
function capitalizeSign(sign: unknown): string {
  const s = String(sign ?? "").toLowerCase();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/**
 * Build planet -> sign maps from fetched positions.
 * - lower:   lowercase signs (kinetics engine + alchemize ESMS expect these)
 * - capital: Capitalized signs (aggregateZodiacElementals / ZODIAC_ELEMENTS expect these)
 */
function buildSignMaps(positions: Record<string, PlanetPosition>): {
  lower: Record<string, string>;
  capital: Record<string, string>;
} {
  const lower: Record<string, string> = {};
  const capital: Record<string, string> = {};
  for (const [planet, pos] of Object.entries(positions)) {
    if (!pos || pos.sign == null) continue;
    const lowerSign = String(pos.sign).toLowerCase();
    lower[planet] = lowerSign;
    capital[planet] = capitalizeSign(lowerSign);
  }
  return { lower, capital };
}

export function useChartData(options: ChartDataOptions = {}): ChartData {
  const {
    dateTime,
    location: optionLocation,
    zodiacSystem = "tropical",
    autoRefresh = false,
    refreshInterval = 60000, // 1 minute default
  } = options;
  const { currentUser } = useUser();
  const userLocation = currentUser?.birthData
    ? {
        latitude: currentUser.birthData.latitude,
        longitude: currentUser.birthData.longitude,
      }
    : undefined;
  // Determine the location to use: option > user > NYC default (never null,
  // so the page can't hang on a missing location).
  const location = optionLocation || userLocation || DEFAULT_LOCATION;

  const [positions, setPositions] = useState<Record<
    string,
    PlanetPosition
  > | null>(null);
  const [aspects, setAspects] = useState<PlanetaryAspect[]>([]);
  const [alchemical, setAlchemical] = useState<AlchemicalResult | null>(null);
  const [kinetics, setKinetics] = useState<KineticMetrics | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stabilize fetch dependencies so the effect doesn't re-run on every render
  // (the location object identity changes when the page passes a literal).
  const latitude = location.latitude;
  const longitude = location.longitude;
  const dateTimeMs = dateTime ? dateTime.getTime() : null;

  const fetchChartData = useCallback(async () => {
    const loc = { latitude, longitude };
    if (
      !loc ||
      typeof loc.latitude !== "number" ||
      typeof loc.longitude !== "number" ||
      Number.isNaN(loc.latitude) ||
      Number.isNaN(loc.longitude)
    ) {
      setError("Location data is required to fetch chart data.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestedDate =
        dateTimeMs != null ? new Date(dateTimeMs) : new Date();

      // 1. Fetch planetary positions (astrologize API, with built-in
      //    circuit-breaker + astronomy-engine fallback so it never hangs).
      const fetchedPositions =
        dateTimeMs != null
          ? await getPlanetaryPositionsForDateTime(
              requestedDate,
              loc,
              zodiacSystem,
            )
          : await getCurrentPlanetaryPositions(loc, zodiacSystem);

      if (!fetchedPositions || Object.keys(fetchedPositions).length === 0) {
        throw new Error("No planetary positions returned");
      }

      // 2. Derive aspects from positions (reuses calculateAspects).
      const { aspects: derivedAspects } =
        AspectsService.calculateFromPositions(fetchedPositions);

      // 3. Build planet -> sign maps (casing matters; see buildSignMaps).
      const { lower, capital } = buildSignMaps(fetchedPositions);

      // 4. Alchemical properties.
      //    ESMS via the same path /api/alchemize uses (lowercase signs).
      const diurnal = isSectDiurnal(requestedDate);
      const esms = calculateEnhancedAlchemicalFromPlanets(lower, diurnal);
      //    Elemental properties need Capitalized signs (ZODIAC_ELEMENTS).
      const elementalProperties = aggregateZodiacElementals(capital);

      // 5. Kinetics (P=IV). The engine expects lowercase signs. A single
      //    snapshot (timeInterval=1, no previous frame) resolves velocities /
      //    momenta to 0 and derives charge/V/I/P from current state — the same
      //    first-frame behavior as usePlanetaryKinetics.
      const kineticMetrics: KineticMetrics = calculateKinetics({
        currentPlanetaryPositions: lower,
        timeInterval: 1,
        currentPlanet: "Sun",
      });

      // 6. Display-facing thermodynamics + kalchm/monica come straight from the
      //    canonical alchemical engine (alchemize) for EXACT values — heat,
      //    entropy, reactivity, gregsEnergy, kalchm and monica via its precise
      //    thermodynamic formulas, replacing the prior proxy approximation. The
      //    engine maps each planet through its own planetInfo/signInfo model,
      //    including the Ascendant (it carries a planetInfo entry), so it grounds
      //    day charts the same way the enhanced mapping does. The ESMS shown
      //    below stay on the richer enhanced (sect/dignity) mapping. All values
      //    are guarded against NaN/Infinity via safe().
      const spirit = esms.Spirit;
      const essence = esms.Essence;
      const matter = esms.Matter;
      const substance = esms.Substance;

      const safe = (n: number) => (Number.isFinite(n) ? n : 0);

      const engineMetrics = alchemize(lower);
      const heat = safe(engineMetrics.heat);
      const entropy = safe(engineMetrics.entropy);
      const reactivity = safe(engineMetrics.reactivity);
      const gregsEnergy = safe(engineMetrics.gregsEnergy);
      const kalchm = safe(engineMetrics.kalchm);
      const monica = safe(engineMetrics.monica);

      const dominantElement =
        ELEMENTS.slice().sort(
          (a, b) =>
            (elementalProperties[b] ?? 0) - (elementalProperties[a] ?? 0),
        )[0] ?? "Earth";
      const sunSign = lower.Sun;

      const alchemicalResult: AlchemicalResult = {
        elementalProperties: {
          Fire: safe(elementalProperties.Fire),
          Water: safe(elementalProperties.Water),
          Earth: safe(elementalProperties.Earth),
          Air: safe(elementalProperties.Air),
        },
        thermodynamicProperties: {
          heat,
          entropy,
          reactivity,
          gregsEnergy,
        },
        esms: {
          Spirit: safe(spirit),
          Essence: safe(essence),
          Matter: safe(matter),
          Substance: safe(substance),
        },
        kalchm,
        monica,
        score: safe(gregsEnergy),
        metadata: {
          dominantElement,
          sunSign,
          source: "astrologize + planetaryAlchemyMapping + alchemicalEngine",
        },
        spirit: safe(spirit),
        essence: safe(essence),
        matter: safe(matter),
        substance: safe(substance),
      };

      // 7. Commit all state.
      setPositions(fetchedPositions);
      // calculateAspects (via AspectsService) emits its own structurally-
      // compatible PlanetaryAspect type; bridge it to the celestial type the
      // page + PlanetaryChart consume. Runtime fields (planet1/planet2/type/orb)
      // are identical.
      setAspects(derivedAspects as unknown as PlanetaryAspect[]);
      setAlchemical(alchemicalResult);
      setKinetics(kineticMetrics);
      setTimestamp(requestedDate.toISOString());
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Chart data fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude, dateTimeMs, zodiacSystem]);

  const refetch = useCallback(() => {
    void fetchChartData();
  }, [fetchChartData]);

  // Fetch on mount and whenever location / dateTime / zodiacSystem change.
  useEffect(() => {
    void fetchChartData();
  }, [fetchChartData]);

  // Auto-refresh interval (only when enabled). Cleaned up on unmount / change.
  const fetchRef = useRef(fetchChartData);
  fetchRef.current = fetchChartData;
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = Math.max(5000, refreshInterval || 60000);
    const id = setInterval(() => {
      void fetchRef.current();
    }, interval);
    return () => clearInterval(id);
  }, [autoRefresh, refreshInterval]);

  return {
    positions,
    aspects,
    alchemical,
    kinetics,
    timestamp,
    isLoading,
    error,
    refetch,
  };
}
