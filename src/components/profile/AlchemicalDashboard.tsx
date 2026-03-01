import React from 'react';

interface AlchemicalDashboardProps {
  data: any;
}

const StatBar = ({ label, value, color, description }: { label: string; value: number; color: string; description?: string }) => {
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

/**
 * Normalizes data from either:
 *  A) Python backend format: { alchemical_quantities, natal_chart, birth_data }
 *  B) DB profile format:     { natalChart: { alchemicalProperties, elementalBalance, planetaryPositions, dominantElement, birthData } }
 */
function normalizeData(data: any) {
  // Format A – Python backend / legacy
  if (data?.alchemical_quantities) {
    const { alchemical_quantities, natal_chart, birth_data } = data;
    return {
      spirit: alchemical_quantities.spirit ?? 0,
      essence: alchemical_quantities.essence ?? 0,
      matter: alchemical_quantities.matter ?? 0,
      substance: alchemical_quantities.substance ?? 0,
      elementalBalance: alchemical_quantities.elemental_balance ?? { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      dominantElement: Object.entries((alchemical_quantities.elemental_balance ?? {}) as Record<string, number>)
        .reduce((a, b) => (a[1] > b[1] ? a : b), ['Fire', 0])[0],
      planetaryPositions: natal_chart ?? {},
      location: birth_data?.city_name
        ? `${birth_data.city_name}${birth_data.state_country ? ', ' + birth_data.state_country : ''}`
        : null,
    };
  }

  // Format B – DB profile (NatalChart from /api/onboarding)
  const chart = data?.natalChart;
  if (chart) {
    const alch = chart.alchemicalProperties ?? {};
    const elBal = chart.elementalBalance ?? { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

    // Normalize ESMS: they may be raw counts (e.g. 4, 7, 6, 2) – convert to 0..1
    const esmsTotal = (alch.Spirit ?? 0) + (alch.Essence ?? 0) + (alch.Matter ?? 0) + (alch.Substance ?? 0);
    const norm = esmsTotal > 1 ? esmsTotal : 1; // avoid division by zero; if already 0-1 keep as-is

    // Build positions from the chart's planetaryPositions (Record<Planet, ZodiacSign>)
    // or from the planets array
    let positions: Record<string, any> = {};
    if (chart.planetaryPositions && typeof chart.planetaryPositions === 'object') {
      // If values are simple strings (sign names), wrap them
      for (const [planet, val] of Object.entries(chart.planetaryPositions)) {
        if (typeof val === 'string') {
          positions[planet] = { sign: val, degree: 0, minute: 0 };
        } else {
          positions[planet] = val;
        }
      }
    }

    const bd = data.birthData ?? chart.birthData;
    const location = bd?.cityName
      ? `${bd.cityName}${bd.stateCountry ? ', ' + bd.stateCountry : ''}`
      : null;

    return {
      spirit: (alch.Spirit ?? 0) / norm,
      essence: (alch.Essence ?? 0) / norm,
      matter: (alch.Matter ?? 0) / norm,
      substance: (alch.Substance ?? 0) / norm,
      elementalBalance: elBal,
      dominantElement: chart.dominantElement ?? 'Fire',
      planetaryPositions: positions,
      location,
    };
  }

  // Fallback
  return {
    spirit: 0.25, essence: 0.25, matter: 0.25, substance: 0.25,
    elementalBalance: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    dominantElement: 'Fire',
    planetaryPositions: {},
    location: null,
  };
}

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
        {/* ESMS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-purple-500">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Alchemical Constitution</h3>
          <StatBar label="Spirit" value={spirit} color="bg-red-500" description="The spark of action and thought" />
          <StatBar label="Essence" value={essence} color="bg-blue-400" description="The flow of feeling and connection" />
          <StatBar label="Matter" value={matter} color="bg-green-600" description="The physical form and nourishment" />
          <StatBar label="Substance" value={substance} color="bg-orange-500" description="The building blocks and fuel" />
        </div>

        {/* Elements */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-blue-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Elemental Balance</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-200">
              Dominant: {dominantElement}
            </span>
          </div>
          <StatBar label="Fire" value={elementalBalance.Fire ?? 0} color="bg-red-500" />
          <StatBar label="Earth" value={elementalBalance.Earth ?? 0} color="bg-green-600" />
          <StatBar label="Air" value={elementalBalance.Air ?? 0} color="bg-yellow-400" />
          <StatBar label="Water" value={elementalBalance.Water ?? 0} color="bg-blue-500" />
        </div>
      </div>

      {/* Natal chart positions */}
      {Object.keys(planetaryPositions).length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Natal Chart Positions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(planetaryPositions).map(([planet, details]: [string, any]) => (
              <div key={planet} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-xs text-gray-500 uppercase font-semibold">{planet}</div>
                <div className="text-lg font-medium text-purple-900 capitalize">
                  {typeof details === 'string' ? details : details.sign}
                </div>
                {typeof details === 'object' && details.degree !== undefined && (
                  <div className="text-xs text-gray-600">
                    {details.degree}&deg; {details.minute}&apos; {details.isRetrograde ? '\u211E' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
