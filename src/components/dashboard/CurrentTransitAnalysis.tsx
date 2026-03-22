'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import type { NatalChart } from '@/types/natalChart';

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

const ELEMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Fire: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  Water: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Earth: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  Air: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
};

const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

interface TransitPosition {
  sign: string;
  degree: number;
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

function getAspectColor(type: string): { bg: string; text: string; border: string } {
  switch (type) {
    case 'conjunction': return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'harmony': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
    case 'tension': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
    case 'opportunity': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  }
}

function generateTransitMessage(planet: string, natalSign: string, transitSign: string, type: string): string {
  const natalEl = SIGN_ELEMENTS[natalSign.toLowerCase()] || 'Fire';
  const transitEl = SIGN_ELEMENTS[transitSign.toLowerCase()] || 'Fire';

  switch (type) {
    case 'conjunction':
      return `Transit ${planet} is conjunct your natal ${planet} in ${natalSign} \u2014 amplifying your natural ${natalEl} energy. Lean into ${SIGN_DESCRIPTIONS[natalSign.toLowerCase()] || 'your innate tendencies'}.`;
    case 'harmony':
      return `Transit ${planet} in ${transitSign} (${transitEl}) harmonizes with your natal ${natalSign} (${natalEl}) \u2014 a flowing energy for ${SIGN_DESCRIPTIONS[transitSign.toLowerCase()] || 'culinary exploration'}.`;
    case 'tension':
      return `Transit ${planet} in ${transitSign} challenges your natal ${natalSign} placement \u2014 push beyond comfort by ${SIGN_DESCRIPTIONS[transitSign.toLowerCase()] || 'trying something new'}.`;
    case 'opportunity':
      return `Transit ${planet} in ${transitSign} opens doors for your ${natalSign} energy \u2014 great time for ${SIGN_DESCRIPTIONS[transitSign.toLowerCase()] || 'new culinary ventures'}.`;
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
          degree: pd.degree ?? pd.exactLongitude ?? 0,
          isRetrograde: pd.isRetrograde ?? false,
        };
      }
    }
    setTransitPositions(parsed);
  }, [currentPositionsRaw]);

  // Calculate current transit element counts
  const currentElementCounts = useMemo((): Record<string, number> => {
    const counts: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    const positions = Object.values(transitPositions);
    for (const pos of positions) {
      const el = SIGN_ELEMENTS[pos.sign];
      if (el) counts[el]++;
    }
    return counts;
  }, [transitPositions]);

  // Find current dominant element
  const currentDominantElement = useMemo(() => {
    let max = 0;
    let dominant = 'Fire';
    const entries = Object.entries(currentElementCounts);
    for (const [el, count] of entries) {
      if (count > max) { max = count; dominant = el; }
    }
    return dominant;
  }, [currentElementCounts]);

  // Calculate current modality counts
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

  // Find retrograde planets
  const retrogradePlanets = useMemo(() => {
    return (Object.entries(transitPositions))
      .filter(([, pos]) => pos.isRetrograde)
      .map(([name]) => name);
  }, [transitPositions]);

  // Generate transit insights
  const transitInsights = useMemo(() => {
    const insights: TransitInsight[] = [];
    if (!natalChart.planetaryPositions) return insights;

    for (const planet of PLANETS) {
      const natalSign = natalChart.planetaryPositions[planet as keyof typeof natalChart.planetaryPositions];
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

    // Sort: conjunctions first, then harmonies, opportunities, tensions
    const order = { conjunction: 0, harmony: 1, opportunity: 2, tension: 3 };
    insights.sort((a, b) => order[a.type] - order[b.type]);

    return insights;
  }, [natalChart.planetaryPositions, transitPositions]);

  // Element synergy between natal and transit
  const elementSynergy = useMemo(() => {
    const natalEl = natalChart.dominantElement;
    const transitEl = currentDominantElement;
    if (!natalEl || !transitEl) return null;

    if (natalEl === transitEl) {
      return {
        type: 'amplified' as const,
        message: `Your natal ${natalEl} dominance is amplified by the current ${transitEl}-heavy transits. This is a powerful time to fully express your natural culinary preferences.`,
      };
    }

    // Check if elements are of the same polarity (Fire/Air = active, Earth/Water = receptive)
    const activeElements = ['Fire', 'Air'];
    const natalActive = activeElements.includes(natalEl);
    const transitActive = activeElements.includes(transitEl);

    if (natalActive === transitActive) {
      return {
        type: 'supportive' as const,
        message: `Current ${transitEl} transits support your natal ${natalEl} energy. Both share ${natalActive ? 'active' : 'receptive'} polarity, creating a complementary flow for culinary creativity.`,
      };
    }

    return {
      type: 'contrasting' as const,
      message: `Current ${transitEl} transits contrast with your natal ${natalEl} dominance. This creative tension invites you to explore ${transitEl.toLowerCase()}-influenced dishes you might not normally choose.`,
    };
  }, [natalChart.dominantElement, currentDominantElement]);

  const hasTransitData = Object.keys(transitPositions).length > 0;

  if (!hasTransitData) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />
        <p className="text-sm text-gray-500 mt-3">Loading current planetary transits...</p>
      </div>
    );
  }

  // Current Sun sign for prominent display
  const currentSunSign = transitPositions.Sun?.sign || '';
  const currentMoonSign = transitPositions.Moon?.sign || '';

  return (
    <div className="space-y-5">
      {/* Current Sky Overview */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white">
          <h3 className="text-lg font-bold">Current Celestial Weather</h3>
          <p className="text-orange-100 text-sm mt-0.5">
            Real-time planetary transits and their culinary influence
          </p>
        </div>
        <div className="p-5">
          {/* Dominant current placements */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-center">
              <div className="text-2xl">{SIGN_SYMBOLS[currentSunSign] || ''}</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Sun in</div>
              <div className="text-sm font-bold text-amber-800 capitalize">{currentSunSign}</div>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-center">
              <div className="text-2xl">{SIGN_SYMBOLS[currentMoonSign] || ''}</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Moon in</div>
              <div className="text-sm font-bold text-indigo-800 capitalize">{currentMoonSign}</div>
            </div>
            <div className={`p-3 rounded-lg border text-center ${ELEMENT_COLORS[currentDominantElement]?.bg || 'bg-gray-50'} ${ELEMENT_COLORS[currentDominantElement]?.border || 'border-gray-200'}`}>
              <div className="text-2xl">{currentDominantElement === 'Fire' ? '\uD83D\uDD25' : currentDominantElement === 'Water' ? '\uD83D\uDCA7' : currentDominantElement === 'Earth' ? '\uD83C\uDF0D' : '\uD83D\uDCA8'}</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Dominant Element</div>
              <div className={`text-sm font-bold ${ELEMENT_COLORS[currentDominantElement]?.text || 'text-gray-800'}`}>{currentDominantElement}</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
              <div className="text-2xl">{currentDominantModality === 'Cardinal' ? '\u2794' : currentDominantModality === 'Fixed' ? '\u2693' : '\u267E'}</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Dominant Modality</div>
              <div className="text-sm font-bold text-purple-800">{currentDominantModality}</div>
            </div>
          </div>

          {/* Current planet positions grid */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {PLANETS.map((planet) => {
              const pos = transitPositions[planet];
              if (!pos) return null;
              const el = SIGN_ELEMENTS[pos.sign] || 'Fire';
              const colors = ELEMENT_COLORS[el] || ELEMENT_COLORS.Fire;
              return (
                <div key={planet} className={`p-2 rounded-lg border text-center ${colors.bg} ${colors.border}`}>
                  <div className="text-base" title={planet}>{PLANET_SYMBOLS[planet]}</div>
                  <div className="text-[9px] text-gray-500 font-medium uppercase">{planet.slice(0, 3)}</div>
                  <div className="text-[10px] font-semibold capitalize mt-0.5">{SIGN_SYMBOLS[pos.sign]} {pos.sign.slice(0, 3)}</div>
                  {pos.isRetrograde && <div className="text-[9px] text-red-500 font-bold">Rx</div>}
                </div>
              );
            })}
          </div>

          {/* Retrograde notice */}
          {retrogradePlanets.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700">
                <span className="font-semibold">Retrograde:</span>{' '}
                {retrogradePlanets.map(p => `${PLANET_SYMBOLS[p]} ${p}`).join(', ')} {retrogradePlanets.length === 1 ? 'is' : 'are'} retrograde.
                {' '}Revisit familiar recipes and refine existing techniques during this period.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Element Synergy - Natal vs Transit */}
      {elementSynergy && (
        <div className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${
          elementSynergy.type === 'amplified' ? 'border-purple-500' :
          elementSynergy.type === 'supportive' ? 'border-green-500' :
          'border-orange-500'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-bold text-gray-800">
              {elementSynergy.type === 'amplified' ? 'Elemental Amplification' :
               elementSynergy.type === 'supportive' ? 'Elemental Support' :
               'Creative Tension'}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              elementSynergy.type === 'amplified' ? 'bg-purple-100 text-purple-700' :
              elementSynergy.type === 'supportive' ? 'bg-green-100 text-green-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              {natalChart.dominantElement} natal + {currentDominantElement} transit
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{elementSynergy.message}</p>
        </div>
      )}

      {/* Transit Aspects to Natal Chart */}
      {transitInsights.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-base font-bold text-gray-800 mb-3">Transit Aspects to Your Natal Chart</h3>
          <div className="space-y-3">
            {transitInsights.slice(0, 6).map((insight, idx) => {
              const colors = getAspectColor(insight.type);
              return (
                <div key={idx} className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{PLANET_SYMBOLS[insight.planet]}</span>
                    <span className={`text-xs font-semibold uppercase ${colors.text}`}>
                      {getAspectLabel(insight.type)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {SIGN_SYMBOLS[insight.transitSign]} {insight.transitSign} {'\u2192'} {SIGN_SYMBOLS[insight.natalSign]} {insight.natalSign}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{insight.message}</p>
                </div>
              );
            })}
          </div>
          {transitInsights.length > 6 && (
            <p className="text-xs text-gray-400 mt-3 text-center">
              +{transitInsights.length - 6} more aspects
            </p>
          )}
        </div>
      )}

      {/* Current culinary guidance summary */}
      <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-xl shadow-sm p-5 border border-purple-200">
        <h3 className="text-base font-bold text-gray-800 mb-2">Today&apos;s Culinary Guidance</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          With the Sun in <span className="font-semibold capitalize">{currentSunSign}</span> and
          Moon in <span className="font-semibold capitalize">{currentMoonSign}</span>,
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
