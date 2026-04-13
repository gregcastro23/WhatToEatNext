'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import type { NatalChart } from '@/types/natalChart';
import { extractPlanetaryPositions } from '@/utils/astrology/chartDataUtils';

interface CurrentTransitAnalysisProps {
  natalChart: NatalChart;
}

const SIGN_SYMBOLS: Record<string, string> = {
  aries: '\u2648', taurus: '\u2649', gemini: '\u264A', cancer: '\u264B',
  leo: '\u264C', virgo: '\u264D', libra: '\u264E', scorpio: '\u264F',
  sagittarius: '\u2650', capricorn: '\u2651', aquarius: '\u2652', pisces: '\u2653',
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '\u2609', Moon: '\u263D', Mercury: '\u263F', Venus: '\u2640',
  Mars: '\u2642', Jupiter: '\u2643', Saturn: '\u2644', Uranus: '\u2645',
  Neptune: '\u2646', Pluto: '\u2647',
};

const SIGN_ELEMENTS: Record<string, string> = {
  aries: 'Fire', taurus: 'Earth', gemini: 'Air', cancer: 'Water',
  leo: 'Fire', virgo: 'Earth', libra: 'Air', scorpio: 'Water',
  sagittarius: 'Fire', capricorn: 'Earth', aquarius: 'Air', pisces: 'Water',
};

const SIGN_MODALITIES: Record<string, string> = {
  aries: 'Cardinal', taurus: 'Fixed', gemini: 'Mutable', cancer: 'Cardinal',
  leo: 'Fixed', virgo: 'Mutable', libra: 'Cardinal', scorpio: 'Fixed',
  sagittarius: 'Mutable', capricorn: 'Cardinal', aquarius: 'Fixed', pisces: 'Mutable',
};

const SIGN_DESCRIPTIONS: Record<string, string> = {
  aries: 'initiating bold flavors and fiery spices',
  taurus: 'grounding through rich, earthy comfort foods',
  gemini: 'experimenting with diverse flavor combinations',
  cancer: 'nurturing through warm, soul-nourishing meals',
  leo: 'celebrating with vibrant, showpiece dishes',
  virgo: 'refining recipes with precise, clean ingredients',
  libra: 'balancing sweet and savory in harmonious pairings',
  scorpio: 'intensifying depth with fermented and transformed foods',
  sagittarius: 'exploring global cuisines and exotic flavors',
  capricorn: 'mastering traditional, time-honored recipes',
  aquarius: 'innovating with unconventional ingredient fusions',
  pisces: 'flowing with intuitive, delicate preparations',
};

const ELEMENT_COLORS: Record<string, string> = {
  Fire: '#ef4444',
  Water: '#60a5fa',
  Earth: '#34d399',
  Air: '#a78bfa',
};

const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

interface TransitPosition {
  sign: string;
  degree: number;
  minute: number;
  isRetrograde?: boolean;
}

interface TransitInsight {
  type: 'conjunction' | 'harmony' | 'tension' | 'opportunity';
  planet: string;
  natalSign: string;
  transitSign: string;
  message: string;
}

function getAspectType(natalSign: string, transitSign: string): 'conjunction' | 'harmony' | 'tension' | 'opportunity' | null {
  const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  const nIdx = signs.indexOf(natalSign.toLowerCase());
  const tIdx = signs.indexOf(transitSign.toLowerCase());
  if (nIdx < 0 || tIdx < 0) return null;

  const diff = ((tIdx - nIdx) % 12 + 12) % 12;

  if (diff === 0) return 'conjunction';
  if (diff === 4 || diff === 8) return 'harmony'; // trine
  if (diff === 3 || diff === 9) return 'tension'; // square
  if (diff === 6) return 'tension'; // opposition
  if (diff === 2 || diff === 10) return 'opportunity'; // sextile
  return null;
}

function getAspectLabel(type: string): string {
  switch (type) {
    case 'conjunction': return 'Conjunction';
    case 'harmony': return 'Trine';
    case 'tension': return 'Square';
    case 'opportunity': return 'Sextile';
    default: return '';
  }
}

const ASPECT_STYLES: Record<string, { color: string; darkColor: string }> = {
  conjunction: { color: '#a78bfa', darkColor: 'rgba(167,139,250,0.12)' },
  harmony: { color: '#34d399', darkColor: 'rgba(52,211,153,0.12)' },
  tension: { color: '#ef4444', darkColor: 'rgba(239,68,68,0.12)' },
  opportunity: { color: '#60a5fa', darkColor: 'rgba(96,165,250,0.12)' },
};

function generateTransitMessage(planet: string, natalSign: string, transitSign: string, type: string): string {
  const natalEl = SIGN_ELEMENTS[natalSign.toLowerCase()] || 'Fire';
  const transitEl = SIGN_ELEMENTS[transitSign.toLowerCase()] || 'Fire';

  switch (type) {
    case 'conjunction':
      return `Transit ${planet} conjunct natal ${planet} in ${natalSign} \u2014 amplifying your natural ${natalEl} energy. Lean into ${SIGN_DESCRIPTIONS[natalSign.toLowerCase()] || 'your innate tendencies'}.`;
    case 'harmony':
      return `Transit ${planet} in ${transitSign} (${transitEl}) harmonizes with natal ${natalSign} (${natalEl}) \u2014 flowing energy for ${SIGN_DESCRIPTIONS[transitSign.toLowerCase()] || 'culinary exploration'}.`;
    case 'tension':
      return `Transit ${planet} in ${transitSign} challenges natal ${natalSign} \u2014 push beyond comfort by ${SIGN_DESCRIPTIONS[transitSign.toLowerCase()] || 'trying something new'}.`;
    case 'opportunity':
      return `Transit ${planet} in ${transitSign} opens doors for ${natalSign} energy \u2014 great time for ${SIGN_DESCRIPTIONS[transitSign.toLowerCase()] || 'new culinary ventures'}.`;
    default:
      return '';
  }
}

export const CurrentTransitAnalysis: React.FC<CurrentTransitAnalysisProps> = ({ natalChart }) => {
  const { planetaryPositions: currentPositionsRaw, state } = useAlchemical();
  const [transitPositions, setTransitPositions] = useState<Record<string, TransitPosition>>({});

  useEffect(() => {
    if (!currentPositionsRaw || Object.keys(currentPositionsRaw).length === 0) return;

    const parsed: Record<string, TransitPosition> = {};
    for (const [planet, data] of Object.entries(currentPositionsRaw)) {
      if (planet === 'ascendant' || !data) continue;
      const pd = data as any;
      if (pd.sign) {
        const key = planet.charAt(0).toUpperCase() + planet.slice(1);
        parsed[key] = {
          sign: typeof pd.sign === 'string' ? pd.sign.toLowerCase() : '',
          degree: pd.degree ?? Math.floor(pd.exactLongitude ?? 0),
          minute: pd.minute ?? Math.floor(((pd.exactLongitude ?? 0) - Math.floor(pd.exactLongitude ?? 0)) * 60),
          isRetrograde: pd.isRetrograde ?? false,
        };
      }
    }
    setTransitPositions(parsed);
  }, [currentPositionsRaw]);

  const currentElementCounts = useMemo((): Record<string, number> => {
    const counts: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    const positions = Object.values(transitPositions);
    for (const pos of positions) {
      const el = SIGN_ELEMENTS[pos.sign];
      if (el) counts[el]++;
    }
    return counts;
  }, [transitPositions]);

  const currentDominantElement = useMemo(() => {
    let max = 0;
    let dominant = 'Fire';
    const entries = Object.entries(currentElementCounts);
    for (const [el, count] of entries) {
      if (count > max) { max = count; dominant = el; }
    }
    return dominant;
  }, [currentElementCounts]);

  const currentModalityCounts = useMemo((): Record<string, number> => {
    const counts: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
    const positions = Object.values(transitPositions);
    for (const pos of positions) {
      const mod = SIGN_MODALITIES[pos.sign];
      if (mod) counts[mod]++;
    }
    return counts;
  }, [transitPositions]);

  const currentDominantModality = useMemo(() => {
    let max = 0;
    let dominant = 'Cardinal';
    const entries = Object.entries(currentModalityCounts);
    for (const [mod, count] of entries) {
      if (count > max) { max = count; dominant = mod; }
    }
    return dominant;
  }, [currentModalityCounts]);

  const retrogradePlanets = useMemo(() => {
    return (Object.entries(transitPositions))
      .filter(([, pos]) => pos.isRetrograde)
      .map(([name]) => name);
  }, [transitPositions]);

  const transitInsights = useMemo(() => {
    const insights: TransitInsight[] = [];
    const natalSigns = extractPlanetaryPositions(natalChart);
    if (Object.keys(natalSigns).length === 0) return insights;

    for (const planet of PLANETS) {
      const natalSign = natalSigns[planet];
      const transit = transitPositions[planet];
      if (!natalSign || !transit) continue;

      const natalSignStr = typeof natalSign === 'string' ? natalSign.toLowerCase() : '';
      const aspectType = getAspectType(natalSignStr, transit.sign);
      if (!aspectType) continue;

      insights.push({
        type: aspectType,
        planet,
        natalSign: natalSignStr,
        transitSign: transit.sign,
        message: generateTransitMessage(planet, natalSignStr, transit.sign, aspectType),
      });
    }

    const order = { conjunction: 0, harmony: 1, opportunity: 2, tension: 3 };
    insights.sort((a, b) => order[a.type] - order[b.type]);

    return insights;
  }, [natalChart, transitPositions]);

  const elementSynergy = useMemo(() => {
    const natalEl = natalChart.dominantElement;
    const transitEl = currentDominantElement;
    if (!natalEl || !transitEl) return null;

    if (natalEl === transitEl) {
      return {
        type: 'amplified' as const,
        message: `Your natal ${natalEl} dominance is amplified by current ${transitEl}-heavy transits. A powerful time to fully express your natural culinary preferences.`,
      };
    }

    const activeElements = ['Fire', 'Air'];
    const natalActive = activeElements.includes(natalEl);
    const transitActive = activeElements.includes(transitEl);

    if (natalActive === transitActive) {
      return {
        type: 'supportive' as const,
        message: `Current ${transitEl} transits support your natal ${natalEl} energy. Both share ${natalActive ? 'active' : 'receptive'} polarity, creating complementary flow for culinary creativity.`,
      };
    }

    return {
      type: 'contrasting' as const,
      message: `Current ${transitEl} transits contrast with your natal ${natalEl} dominance. This creative tension invites you to explore ${transitEl.toLowerCase()}-influenced dishes.`,
    };
  }, [natalChart.dominantElement, currentDominantElement]);

  const hasTransitData = Object.keys(transitPositions).length > 0;

  if (!hasTransitData) {
    return (
      <div className="bg-gray-950 rounded-3xl p-8 text-center border border-white/5">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto" />
        <p className="text-white/30 text-xs mt-3 uppercase tracking-widest">Loading transits</p>
      </div>
    );
  }

  const currentSunSign = transitPositions.Sun?.sign || '';
  const currentMoonSign = transitPositions.Moon?.sign || '';
  const domElColor = ELEMENT_COLORS[currentDominantElement] || '#a78bfa';

  return (
    <div className="space-y-4">
      {/* Current Sky Overview */}
      <div className="bg-gray-950 rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Celestial Weather</h3>
              <p className="text-white/30 text-xs mt-0.5">Real-time planetary transits</p>
            </div>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          </div>

          {/* Overview cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 text-center">
              <div className="text-2xl text-amber-400">{SIGN_SYMBOLS[currentSunSign] || ''}</div>
              <div className="text-white/30 text-[10px] uppercase tracking-widest mt-1.5">Sun</div>
              <div className="text-white font-bold text-sm capitalize mt-0.5">{currentSunSign}</div>
            </div>
            <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 text-center">
              <div className="text-2xl text-blue-400">{SIGN_SYMBOLS[currentMoonSign] || ''}</div>
              <div className="text-white/30 text-[10px] uppercase tracking-widest mt-1.5">Moon</div>
              <div className="text-white font-bold text-sm capitalize mt-0.5">{currentMoonSign}</div>
            </div>
            <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 text-center">
              <div className="w-5 h-5 rounded-full mx-auto" style={{ backgroundColor: domElColor, boxShadow: `0 0 12px ${domElColor}` }} />
              <div className="text-white/30 text-[10px] uppercase tracking-widest mt-2">Element</div>
              <div className="text-white font-bold text-sm mt-0.5">{currentDominantElement}</div>
            </div>
            <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 text-center">
              <div className="text-2xl text-purple-400">
                {currentDominantModality === 'Cardinal' ? '\u2794' : currentDominantModality === 'Fixed' ? '\u2693' : '\u267E'}
              </div>
              <div className="text-white/30 text-[10px] uppercase tracking-widest mt-1.5">Modality</div>
              <div className="text-white font-bold text-sm mt-0.5">{currentDominantModality}</div>
            </div>
          </div>

          {/* Planet positions grid */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {PLANETS.map((planet) => {
              const pos = transitPositions[planet];
              if (!pos) return null;
              const el = SIGN_ELEMENTS[pos.sign] || 'Fire';
              const color = ELEMENT_COLORS[el] || '#a78bfa';
              return (
                <div
                  key={planet}
                  className="bg-white/[0.03] rounded-xl p-2 border border-white/5 text-center"
                >
                  <div className="text-sm" style={{ color }} title={planet}>{PLANET_SYMBOLS[planet]}</div>
                  <div className="text-[9px] text-white/30 font-medium uppercase mt-0.5">{planet.slice(0, 3)}</div>
                  <div className="text-[10px] text-white/60 font-semibold capitalize mt-0.5 whitespace-nowrap">
                    <span className="mr-0.5" style={{ color }}>{SIGN_SYMBOLS[pos.sign]}</span> 
                    {pos.degree}&deg;{pos.minute ? `${pos.minute}'` : ''}
                  </div>
                  {pos.isRetrograde && <div className="text-[8px] text-red-400 font-bold mt-0.5">Rx</div>}
                </div>
              );
            })}
          </div>

          {/* Retrograde notice */}
          {retrogradePlanets.length > 0 && (
            <div className="mt-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
              <p className="text-xs text-red-400">
                <span className="font-bold uppercase tracking-wider">Retrograde</span>{' '}
                <span className="text-red-400/70">
                  {retrogradePlanets.map(p => `${PLANET_SYMBOLS[p]} ${p}`).join(', ')} &mdash;
                  Revisit familiar recipes and refine existing techniques.
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Element Synergy */}
      {elementSynergy && (
        <div className="bg-gray-950 rounded-3xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-1 h-8 rounded-full"
              style={{
                backgroundColor:
                  elementSynergy.type === 'amplified' ? '#a78bfa' :
                  elementSynergy.type === 'supportive' ? '#34d399' :
                  '#f97316',
              }}
            />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                {elementSynergy.type === 'amplified' ? 'Amplification' :
                 elementSynergy.type === 'supportive' ? 'Support' :
                 'Creative Tension'}
              </h3>
              <div className="flex gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10 uppercase tracking-wider">
                  {natalChart.dominantElement} natal
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10 uppercase tracking-wider">
                  {currentDominantElement} transit
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-white/50 leading-relaxed">{elementSynergy.message}</p>
        </div>
      )}

      {/* Transit Aspects */}
      {transitInsights.length > 0 && (
        <div className="bg-gray-950 rounded-3xl p-6 border border-white/5">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Transit Aspects</h3>
          <div className="space-y-2">
            {transitInsights.slice(0, 6).map((insight, idx) => {
              const style = ASPECT_STYLES[insight.type] || ASPECT_STYLES.conjunction;
              return (
                <div
                  key={idx}
                  className="rounded-xl p-3 border border-white/5"
                  style={{ backgroundColor: style.darkColor }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm" style={{ color: style.color }}>{PLANET_SYMBOLS[insight.planet]}</span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: style.color }}
                    >
                      {getAspectLabel(insight.type)}
                    </span>
                    <span className="text-[10px] text-white/30">
                      {SIGN_SYMBOLS[insight.transitSign]} {insight.transitSign} {'\u2192'} {SIGN_SYMBOLS[insight.natalSign]} {insight.natalSign}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed">{insight.message}</p>
                </div>
              );
            })}
          </div>
          {transitInsights.length > 6 && (
            <p className="text-[10px] text-white/20 mt-3 text-center uppercase tracking-widest">
              +{transitInsights.length - 6} more aspects
            </p>
          )}
        </div>
      )}

      {/* Culinary Guidance */}
      <div className="bg-gray-950 rounded-3xl p-5 border border-white/5">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3">Culinary Guidance</h3>
        <p className="text-sm text-white/40 leading-relaxed">
          With the Sun in <span className="text-white/70 font-semibold capitalize">{currentSunSign}</span> and
          Moon in <span className="text-white/70 font-semibold capitalize">{currentMoonSign}</span>,
          the cosmic energy favors {SIGN_DESCRIPTIONS[currentSunSign] || 'creative cooking'}.
          {currentMoonSign && ` The Moon encourages ${SIGN_DESCRIPTIONS[currentMoonSign] || 'intuitive meal choices'}.`}
          {state.currentSeason && ` Seasonal ${state.currentSeason} energy adds ${
            state.currentSeason === 'spring' ? 'fresh, renewing' :
            state.currentSeason === 'summer' ? 'abundant, vibrant' :
            state.currentSeason === 'autumn' ? 'warm, harvesting' :
            'deep, restorative'
          } qualities to your meals.`}
        </p>
      </div>
    </div>
  );
};
