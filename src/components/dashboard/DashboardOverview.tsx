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
  Fire: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', bar: 'bg-gradient-to-r from-red-600 to-red-400' },
  Water: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', bar: 'bg-gradient-to-r from-blue-600 to-blue-400' },
  Earth: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', bar: 'bg-gradient-to-r from-green-700 to-green-500' },
  Air: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', bar: 'bg-gradient-to-r from-amber-500 to-amber-300' },
};

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  profileData: _profileData,
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

    void loadData();
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
        <div className="alchm-card rounded-[2.5rem] shadow-2xl p-7 border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[11px] font-bold text-white/50 uppercase tracking-[0.2em]">Cosmic Harmony</h3>
            <span className="text-[10px] text-white/20 font-medium italic">
              Natal chart vs current transits
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <HarmonyGauge
              label="Overall"
              value={personalData.chartComparison.overallHarmony}
              color="#a78bfa"
            />
            <HarmonyGauge
              label="Elemental"
              value={personalData.chartComparison.elementalHarmony}
              color="#fb923c"
            />
            <HarmonyGauge
              label="Alchemical"
              value={personalData.chartComparison.alchemicalAlignment}
              color="#60a5fa"
            />
            <HarmonyGauge
              label="Planetary"
              value={personalData.chartComparison.planetaryResonance}
              color="#4ade80"
            />
          </div>
        </div>
      ) : isLoading ? (
        <div className="alchm-card rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center justify-center border-white/5">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-4" />
          <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Calculating resonance...</span>
        </div>
      ) : null}

      {/* Two-Column: ESMS + Elemental */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Alchemical Constitution (ESMS) */}
        <div className="alchm-card rounded-[2.5rem] shadow-2xl p-7 border-white/5">
          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-6">Alchemical Constitution</h3>
          <div className="space-y-5">
            {[
              { key: 'Spirit', val: alch.Spirit, color: 'grad-spirit-fire', desc: 'The spark of action and thought' },
              { key: 'Essence', val: alch.Essence, color: 'grad-essence-water', desc: 'The flow of feeling and connection' },
              { key: 'Matter', val: alch.Matter, color: 'grad-matter-earth', desc: 'The physical form and nourishment' },
              { key: 'Substance', val: alch.Substance, color: 'grad-substance-air', desc: 'The building blocks and fuel' },
            ].map((item) => {
              const pct = Math.min((item.val / esmsNorm) * 100, 100);
              return (
                <div key={item.key} title={item.desc} className="group">
                  <div className="flex justify-between text-[11px] font-bold mb-2">
                    <span className="text-white/60 group-hover:text-white transition-colors uppercase tracking-wider">{item.key}</span>
                    <span className="text-white font-mono">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden ring-1 ring-white/5">
                    <div className={`h-1.5 rounded-full ${item.color} transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Elemental Balance */}
        <div className="alchm-card rounded-[2.5rem] shadow-2xl p-7 border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Elemental Balance</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest">
              {natalChart.dominantElement || getDominantElement()}
            </span>
          </div>
          <div className="space-y-5">
            {(['Fire', 'Water', 'Earth', 'Air'] as const).map((el) => {
              const val = elemental[el] ?? 0;
              const pct = Math.min(val * 100, 100);
              const colors = ELEMENT_COLORS[el];
              return (
                <div key={el} className="group">
                  <div className="flex justify-between text-[11px] font-bold mb-2">
                    <span className="text-white/60 group-hover:text-white transition-colors uppercase tracking-wider">{el}</span>
                    <span className="text-white font-mono">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden ring-1 ring-white/5">
                    <div className={`h-1.5 rounded-full ${colors.bar} transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
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
          <div className="alchm-card rounded-[2.5rem] shadow-2xl p-7 border-white/5">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-5">Current Alignments</h3>

            {personalData.recommendations.favorableElements.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-bold text-white/20 mb-3 uppercase tracking-widest">Favorable Elements</p>
                <div className="flex flex-wrap gap-2">
                  {personalData.recommendations.favorableElements.map((el) => {
                    const colors = ELEMENT_COLORS[el] || ELEMENT_COLORS.Fire;
                    return (
                      <span
                        key={el}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${colors.bg} ${colors.text} border ${colors.border} uppercase`}
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
                <p className="text-[10px] font-bold text-white/20 mb-3 uppercase tracking-widest">Harmonic Planets</p>
                <div className="flex flex-wrap gap-2">
                  {personalData.recommendations.harmonicPlanets.map((planet) => (
                    <span
                      key={planet}
                      className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase"
                    >
                      {planet}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cosmic Insights */}
          <div className="alchm-card rounded-[2.5rem] shadow-2xl p-7 border-white/5">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-5">Cosmic Insights</h3>
            {personalData.recommendations.insights.length > 0 ? (
              <ul className="space-y-4">
                {personalData.recommendations.insights.map((insight, idx) => (
                  <li key={idx} className="text-sm text-white/70 flex items-start gap-3">
                    <span className="text-purple-400 mt-1 flex-shrink-0 w-1 h-1 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(167,139,250,1)]" />
                    <span className="leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-white/30 italic font-medium">No additional insights at this moment.</p>
            )}
          </div>
        </div>
      )}

      {/* Thermodynamic State */}
      {thermodynamic && (
        <div className="alchm-card rounded-[2.5rem] shadow-2xl p-7 border-white/5">
          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-6">Thermodynamic State</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Heat', key: 'heat', color: 'text-red-400', bgColor: 'bg-red-500/5', border: 'border-red-500/10' },
              { label: 'Entropy', key: 'entropy', color: 'text-blue-400', bgColor: 'bg-blue-500/5', border: 'border-blue-500/10' },
              { label: 'Reactivity', key: 'reactivity', color: 'text-orange-400', bgColor: 'bg-orange-500/5', border: 'border-orange-500/10' },
              { label: "Greg's Energy", key: 'gregsEnergy', color: 'text-purple-400', bgColor: 'bg-purple-500/5', border: 'border-purple-500/10' },
            ].map((item) => {
              const val = thermodynamic[item.key] ?? 0;
              return (
                <div key={item.key} className={`${item.bgColor} rounded-3xl p-5 text-center border ${item.border} backdrop-blur-sm`}>
                  <div className={`text-xl font-mono font-bold ${item.color}`}>
                    {typeof val === 'number' ? val.toFixed(3) : '—'}
                  </div>
                  <div className="text-[10px] font-bold text-white/30 mt-2 uppercase tracking-widest">{item.label}</div>
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
            <div className="alchm-card rounded-[2.5rem] shadow-2xl p-7 border-white/5">
              <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-5">Suggested Cuisines</h3>
              <div className="flex flex-wrap gap-2">
                {personalData.recommendations.suggestedCuisines.map((cuisine) => (
                  <span
                    key={cuisine}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500/10 to-orange-500/10 text-white font-bold rounded-2xl text-[10px] border border-white/5 uppercase tracking-widest hover:border-purple-500/30 transition-colors"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>
            </div>
          )}
          {personalData.recommendations.suggestedCookingMethods.length > 0 && (
            <div className="alchm-card rounded-[2.5rem] shadow-2xl p-7 border-white/5">
              <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-5">Suggested Cooking Methods</h3>
              <div className="flex flex-wrap gap-2">
                {personalData.recommendations.suggestedCookingMethods.map((method) => (
                  <span
                    key={method}
                    className="px-4 py-2 bg-orange-500/10 text-orange-400 rounded-2xl text-[10px] font-bold border border-orange-500/20 uppercase tracking-widest hover:border-orange-500/40 transition-colors"
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
      <div className="alchm-card rounded-full p-4 flex flex-wrap items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-[0.15em] border-white/5 text-white/30">
        <span className="flex items-center gap-2">Season: <span className="text-white/60 font-mono tracking-tighter">{state.currentSeason}</span></span>
        <div className="w-1 h-1 rounded-full bg-white/10" />
        <span className="flex items-center gap-2">Time: <span className="text-white/60 font-mono tracking-tighter">{state.timeOfDay}</span></span>
        <div className="w-1 h-1 rounded-full bg-white/10" />
        <span className="flex items-center gap-2">Harmony: <span className="text-purple-400 font-mono tracking-tighter">{(getAlchemicalHarmony() * 100).toFixed(0)}%</span></span>
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
  const r = 30;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - (value ?? 0));

  return (
    <div className="flex flex-col items-center p-2 group">
      <div className="relative">
        <svg width="84" height="84" viewBox="0 0 84 84" className="drop-shadow-[0_0_12px_rgba(0,0,0,0.5)]">
          <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
          <circle
            cx="42"
            cy="42"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 42 42)"
            className="transition-all duration-1000 ease-in-out"
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-mono font-bold text-white group-hover:scale-110 transition-transform">
            {pct}
          </span>
        </div>
      </div>
      <span className="text-[10px] font-bold text-white/30 mt-3 uppercase tracking-widest group-hover:text-white/60 transition-colors">
        {label}
      </span>
    </div>
  );
}
