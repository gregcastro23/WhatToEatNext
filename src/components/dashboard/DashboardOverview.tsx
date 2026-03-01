'use client';

import React, { useEffect, useState } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import type { NatalChart } from '@/types/natalChart';

interface DashboardOverviewProps {
  profileData: any;
  natalChart: NatalChart;
  email: string;
}

interface ChartComparisonData {
  overallHarmony: number;
  elementalHarmony: number;
  alchemicalAlignment: number;
  planetaryResonance: number;
  insights: {
    favorableElements: string[];
    challengingElements: string[];
    harmonicPlanets: string[];
    recommendations: string[];
  };
}

interface PersonalizedData {
  chartComparison: ChartComparisonData;
  recommendations: {
    favorableElements: string[];
    challengingElements: string[];
    harmonicPlanets: string[];
    insights: string[];
    suggestedCuisines: string[];
    suggestedCookingMethods: string[];
  };
}

const ELEMENT_COLORS: Record<string, { bg: string; text: string; border: string; bar: string }> = {
  Fire: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', bar: 'bg-red-500' },
  Water: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', bar: 'bg-blue-500' },
  Earth: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', bar: 'bg-green-600' },
  Air: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', bar: 'bg-yellow-400' },
};

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  profileData,
  natalChart,
  email,
}) => {
  const { state, getDominantElement, getAlchemicalHarmony, getThermodynamicState } = useAlchemical();
  const [personalData, setPersonalData] = useState<PersonalizedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!email || !natalChart) {
      setIsLoading(false);
      return;
    }

    async function loadData() {
      try {
        const res = await fetch('/api/personalized-recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, includeChartAnalysis: true }),
        });
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data) {
            setPersonalData(result.data);
          }
        }
      } catch (err) {
        console.error('Failed to load personalized data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [email, natalChart]);

  // Normalize ESMS from natal chart
  const alch = natalChart.alchemicalProperties || { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
  const esmsTotal = alch.Spirit + alch.Essence + alch.Matter + alch.Substance;
  const esmsNorm = esmsTotal > 0 ? esmsTotal : 1;

  const elemental = natalChart.elementalBalance || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

  const thermodynamic = getThermodynamicState();

  return (
    <div className="space-y-6">
      {/* Top Row: Harmony Scores */}
      {personalData?.chartComparison ? (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Cosmic Harmony</h3>
            <span className="text-xs text-gray-400">
              Natal chart vs current transits
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <HarmonyGauge
              label="Overall"
              value={personalData.chartComparison.overallHarmony}
              color="#8b5cf6"
            />
            <HarmonyGauge
              label="Elemental"
              value={personalData.chartComparison.elementalHarmony}
              color="#f97316"
            />
            <HarmonyGauge
              label="Alchemical"
              value={personalData.chartComparison.alchemicalAlignment}
              color="#3b82f6"
            />
            <HarmonyGauge
              label="Planetary"
              value={personalData.chartComparison.planetaryResonance}
              color="#22c55e"
            />
          </div>
        </div>
      ) : isLoading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
          <span className="ml-3 text-sm text-gray-500">Calculating cosmic harmony...</span>
        </div>
      ) : null}

      {/* Two-Column: ESMS + Elemental */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Alchemical Constitution (ESMS) */}
        <div className="bg-white rounded-xl shadow-sm p-5 border-t-4 border-purple-500">
          <h3 className="text-base font-bold text-gray-800 mb-3">Alchemical Constitution</h3>
          <div className="space-y-3">
            {[
              { key: 'Spirit', val: alch.Spirit, color: 'bg-red-500', desc: 'The spark of action and thought' },
              { key: 'Essence', val: alch.Essence, color: 'bg-blue-400', desc: 'The flow of feeling and connection' },
              { key: 'Matter', val: alch.Matter, color: 'bg-green-600', desc: 'The physical form and nourishment' },
              { key: 'Substance', val: alch.Substance, color: 'bg-orange-500', desc: 'The building blocks and fuel' },
            ].map((item) => {
              const pct = Math.min((item.val / esmsNorm) * 100, 100);
              return (
                <div key={item.key} title={item.desc}>
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>{item.key}</span>
                    <span>{pct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${item.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Elemental Balance */}
        <div className="bg-white rounded-xl shadow-sm p-5 border-t-4 border-blue-500">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-bold text-gray-800">Elemental Balance</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              Dominant: {natalChart.dominantElement || getDominantElement()}
            </span>
          </div>
          <div className="space-y-3">
            {(['Fire', 'Water', 'Earth', 'Air'] as const).map((el) => {
              const val = elemental[el] ?? 0;
              const pct = Math.min(val * 100, 100);
              const colors = ELEMENT_COLORS[el];
              return (
                <div key={el}>
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>{el}</span>
                    <span>{pct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${colors.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cosmic Insights + Favorable Elements Row */}
      {personalData && (
        <div className="grid md:grid-cols-2 gap-5">
          {/* Favorable Elements & Harmonic Planets */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-800 mb-3">Current Alignments</h3>

            {personalData.recommendations.favorableElements.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">Favorable Elements</p>
                <div className="flex flex-wrap gap-2">
                  {personalData.recommendations.favorableElements.map((el) => {
                    const colors = ELEMENT_COLORS[el] || ELEMENT_COLORS.Fire;
                    return (
                      <span
                        key={el}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
                      >
                        {el}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {personalData.recommendations.harmonicPlanets.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">Harmonic Planets</p>
                <div className="flex flex-wrap gap-2">
                  {personalData.recommendations.harmonicPlanets.map((planet) => (
                    <span
                      key={planet}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200"
                    >
                      {planet}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cosmic Insights */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-800 mb-3">Cosmic Insights</h3>
            {personalData.recommendations.insights.length > 0 ? (
              <ul className="space-y-2">
                {personalData.recommendations.insights.map((insight, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5 flex-shrink-0">&#x2022;</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No additional insights at this moment.</p>
            )}
          </div>
        </div>
      )}

      {/* Thermodynamic State */}
      {thermodynamic && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-base font-bold text-gray-800 mb-3">Thermodynamic State</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Heat', key: 'heat', color: 'text-red-600', bgColor: 'bg-red-50' },
              { label: 'Entropy', key: 'entropy', color: 'text-blue-600', bgColor: 'bg-blue-50' },
              { label: 'Reactivity', key: 'reactivity', color: 'text-orange-600', bgColor: 'bg-orange-50' },
              { label: "Greg's Energy", key: 'gregsEnergy', color: 'text-purple-600', bgColor: 'bg-purple-50' },
            ].map((item) => {
              const val = thermodynamic[item.key] ?? 0;
              return (
                <div key={item.key} className={`${item.bgColor} rounded-lg p-3 text-center`}>
                  <div className={`text-xl font-bold ${item.color}`}>
                    {typeof val === 'number' ? val.toFixed(3) : '—'}
                  </div>
                  <div className="text-xs font-medium text-gray-600 mt-1">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Suggestions */}
      {personalData && (
        <div className="grid md:grid-cols-2 gap-5">
          {personalData.recommendations.suggestedCuisines.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-800 mb-3">Suggested Cuisines</h3>
              <div className="flex flex-wrap gap-2">
                {personalData.recommendations.suggestedCuisines.map((cuisine) => (
                  <span
                    key={cuisine}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-orange-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-200"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>
            </div>
          )}
          {personalData.recommendations.suggestedCookingMethods.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-800 mb-3">Suggested Cooking Methods</h3>
              <div className="flex flex-wrap gap-2">
                {personalData.recommendations.suggestedCookingMethods.map((method) => (
                  <span
                    key={method}
                    className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-200"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Context bar */}
      <div className="bg-white rounded-xl shadow-sm p-3 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
        <span>Season: <span className="font-medium text-gray-700 capitalize">{state.currentSeason}</span></span>
        <span className="text-gray-300">|</span>
        <span>Time: <span className="font-medium text-gray-700">{state.timeOfDay}</span></span>
        <span className="text-gray-300">|</span>
        <span>Alchemical Harmony: <span className="font-medium text-gray-700">{(getAlchemicalHarmony() * 100).toFixed(0)}%</span></span>
      </div>
    </div>
  );
};

/* ─── Harmony Gauge (SVG ring) ─────────────────────────────────── */

function HarmonyGauge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const pct = Math.round((value ?? 0) * 100);
  const r = 32;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - (value ?? 0));

  return (
    <div className="flex flex-col items-center p-2">
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 38 38)"
          className="transition-all duration-700"
        />
        <text x="38" y="42" textAnchor="middle" fill={color} fontSize="16" fontWeight="700">
          {pct}
        </text>
      </svg>
      <span className="text-xs font-medium text-gray-600 mt-1">{label}</span>
    </div>
  );
}
