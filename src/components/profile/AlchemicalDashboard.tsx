import React from "react";
import type { NatalChart } from "@/types/natalChart";
import { extractPlanetaryPositions } from "@/utils/astrology/chartDataUtils";

interface LegacyAlchemicalQuantities {
  spirit?: number;
  essence?: number;
  matter?: number;
  substance?: number;
  elemental_balance?: { Fire?: number; Water?: number; Earth?: number; Air?: number };
}

interface LegacyBirthData {
  city_name?: string;
  state_country?: string;
}

interface LegacyPlanetObject {
  sign?: string;
  degree?: number;
  minute?: number;
  isRetrograde?: boolean;
}

interface LegacyProfilePayload {
  alchemical_quantities?: LegacyAlchemicalQuantities;
  natal_chart?: Record<string, LegacyPlanetObject | string>;
  birth_data?: LegacyBirthData;
}

interface StandardProfilePayload {
  natalChart?: NatalChart;
  birthData?: { cityName?: string; stateCountry?: string };
}

export type AlchemicalDashboardInput = LegacyProfilePayload | StandardProfilePayload | null | undefined;

interface AlchemicalDashboardProps {
  data: AlchemicalDashboardInput;
}

interface PositionDetail {
  sign: string;
  degree?: number;
  minute?: number;
  isRetrograde?: boolean;
}

interface NormalizedAlchemicalData {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
  elementalBalance: { Fire: number; Water: number; Earth: number; Air: number };
  dominantElement: string;
  planetaryPositions: Record<string, PositionDetail>;
  location: string | null;
}

const StatBar: React.FC<{ label: string; value: number; color: string; description?: string }> = ({
  label,
  value,
  color,
  description,
}) => {
  const pct = Math.min(Math.abs(value) * 100, 100);
  return (
    <div className="mb-3" title={description}>
      <div className="flex justify-between text-sm font-medium mb-1 text-gray-700">
        <span>{label}</span>
        <span>{pct.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {description && <p className="text-xs text-gray-500 mt-1 italic">{description}</p>}
    </div>
  );
};

function normalizeLegacyPositions(rawPositions: Record<string, LegacyPlanetObject | string>): Record<string, PositionDetail> {
  const positions: Record<string, PositionDetail> = {};
  for (const [planet, val] of Object.entries(rawPositions)) {
    if (typeof val === "string") {
      positions[planet] = { sign: val, degree: 0, minute: 0 };
    } else {
      positions[planet] = {
        sign: val.sign ?? "Aries",
        degree: val.degree,
        minute: val.minute,
        isRetrograde: val.isRetrograde,
      };
    }
  }
  return positions;
}

function extractLegacyLocation(bd?: LegacyBirthData): string | null {
  if (!bd?.city_name) return null;
  return `${bd.city_name}${bd.state_country ? `, ${bd.state_country}` : ""}`;
}

function extractLegacyElementalBalance(quantities?: LegacyAlchemicalQuantities): { Fire: number; Water: number; Earth: number; Air: number } {
  const rawBal = quantities?.elemental_balance;
  return {
    Fire: rawBal?.Fire ?? 0.25,
    Water: rawBal?.Water ?? 0.25,
    Earth: rawBal?.Earth ?? 0.25,
    Air: rawBal?.Air ?? 0.25,
  };
}

function normalizeLegacyData(data: LegacyProfilePayload): NormalizedAlchemicalData {
  const quantities = data.alchemical_quantities;
  const elBal = extractLegacyElementalBalance(quantities);
  const positions = normalizeLegacyPositions(data.natal_chart ?? {});

  return {
    spirit: quantities?.spirit ?? 0.25,
    essence: quantities?.essence ?? 0.25,
    matter: quantities?.matter ?? 0.25,
    substance: quantities?.substance ?? 0.25,
    elementalBalance: elBal,
    dominantElement: Object.entries(elBal)
      .reduce((a, b) => (a[1] > b[1] ? a : b), ["Fire", 0])[0],
    planetaryPositions: positions,
    location: extractLegacyLocation(data.birth_data),
  };
}

function extractChartLocation(
  chart: NatalChart,
  birthData?: { cityName?: string; stateCountry?: string },
): string | null {
  const bd = birthData ?? chart.birthData;
  const cityName = "cityName" in bd ? bd.cityName : undefined;
  const stateCountry = "stateCountry" in bd ? bd.stateCountry : undefined;
  if (!cityName) return null;
  return `${cityName}${stateCountry ? `, ${stateCountry}` : ""}`;
}

function normalizeStandardChart(chart: NatalChart, birthData?: { cityName?: string; stateCountry?: string }): NormalizedAlchemicalData {
  const alch = chart.alchemicalProperties;
  const esmsTotal = alch.Spirit + alch.Essence + alch.Matter + alch.Substance;
  const norm = esmsTotal > 1 ? esmsTotal : 1;

  const rawPositions = extractPlanetaryPositions(chart);
  const positions: Record<string, PositionDetail> = {};
  for (const [planet, val] of Object.entries(rawPositions)) {
    positions[planet] = { sign: val, degree: 0, minute: 0 };
  }

  return {
    spirit: alch.Spirit / norm,
    essence: alch.Essence / norm,
    matter: alch.Matter / norm,
    substance: alch.Substance / norm,
    elementalBalance: chart.elementalBalance,
    dominantElement: chart.dominantElement,
    planetaryPositions: positions,
    location: extractChartLocation(chart, birthData),
  };
}

function normalizeData(data: AlchemicalDashboardInput): NormalizedAlchemicalData {
  if (!data) {
    return {
      spirit: 0.25, essence: 0.25, matter: 0.25, substance: 0.25,
      elementalBalance: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      dominantElement: "Fire",
      planetaryPositions: {},
      location: null,
    };
  }

  if ("alchemical_quantities" in data && data.alchemical_quantities) {
    return normalizeLegacyData(data);
  }

  if ("natalChart" in data && data.natalChart) {
    return normalizeStandardChart(data.natalChart, data.birthData);
  }

  return {
    spirit: 0.25, essence: 0.25, matter: 0.25, substance: 0.25,
    elementalBalance: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    dominantElement: "Fire",
    planetaryPositions: {},
    location: null,
  };
}

const AlchemicalConstitutionCard: React.FC<{ spirit: number; essence: number; matter: number; substance: number }> = ({
  spirit,
  essence,
  matter,
  substance,
}) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-purple-500">
    <h3 className="text-lg font-bold text-gray-800 mb-4">Alchemical Constitution</h3>
    <StatBar label="Spirit" value={spirit} color="bg-red-500" description="The spark of action and thought" />
    <StatBar label="Essence" value={essence} color="bg-blue-400" description="The flow of feeling and connection" />
    <StatBar label="Matter" value={matter} color="bg-green-600" description="The physical form and nourishment" />
    <StatBar label="Substance" value={substance} color="bg-orange-500" description="The building blocks and fuel" />
  </div>
);

const ElementalBalanceCard: React.FC<{ elementalBalance: { Fire: number; Water: number; Earth: number; Air: number }; dominantElement: string }> = ({
  elementalBalance,
  dominantElement,
}) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-blue-500">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold text-gray-800">Elemental Balance</h3>
      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-200">
        Dominant: {dominantElement}
      </span>
    </div>
    <StatBar label="Fire" value={elementalBalance.Fire} color="bg-red-500" />
    <StatBar label="Earth" value={elementalBalance.Earth} color="bg-green-600" />
    <StatBar label="Air" value={elementalBalance.Air} color="bg-yellow-400" />
    <StatBar label="Water" value={elementalBalance.Water} color="bg-blue-500" />
  </div>
);

const PlanetaryPositionsGrid: React.FC<{ positions: Record<string, PositionDetail> }> = ({ positions }) => {
  const entries = Object.entries(positions);
  if (entries.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Natal Chart Positions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {entries.map(([planet, details]) => (
          <div key={planet} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-xs text-gray-500 uppercase font-semibold">{planet}</div>
            <div className="text-lg font-medium text-purple-900 capitalize">
              {details.sign}
            </div>
            {details.degree !== undefined && (
              <div className="text-xs text-gray-600">
                {details.degree}&deg; {details.minute ?? 0}&apos; {details.isRetrograde ? "\u211E" : ""}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const AlchemicalDashboard: React.FC<AlchemicalDashboardProps> = ({ data }) => {
  const {
    spirit, essence, matter, substance,
    elementalBalance, dominantElement,
    planetaryPositions, location,
  } = normalizeData(data);

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {location && (
        <div className="text-center text-sm font-medium text-purple-600 bg-purple-50 py-2 rounded-xl shadow-sm">
          Calculated for: {location}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <AlchemicalConstitutionCard spirit={spirit} essence={essence} matter={matter} substance={substance} />
        <ElementalBalanceCard elementalBalance={elementalBalance} dominantElement={dominantElement} />
      </div>

      <PlanetaryPositionsGrid positions={planetaryPositions} />
    </div>
  );
};
