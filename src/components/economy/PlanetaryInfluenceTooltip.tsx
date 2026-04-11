'use client';

/**
 * PlanetaryInfluenceTooltip
 *
 * Hover tooltip content for ESMS token chips. Explains which planets are
 * currently contributing to the token's value based on live planetary
 * positions from the AlchemicalContext.
 *
 * Derives contributions from PLANETARY_ALCHEMY (the authoritative mapping in
 * `src/utils/planetaryAlchemyMapping.ts`) so copy stays accurate.
 *
 * @file src/components/economy/PlanetaryInfluenceTooltip.tsx
 */

import { motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import type { TokenType } from '@/types/economy';
import { PLANETARY_ALCHEMY } from '@/utils/planetaryAlchemyMapping';

// ─── Static copy ──────────────────────────────────────────────────────

const TOKEN_TAGLINE: Record<TokenType, string> = {
  Spirit: 'Creative Force · Consciousness',
  Essence: 'Life Energy · Emotional flow',
  Matter: 'Physical Form · Grounding',
  Substance: 'Etheric Field · Subtle intellect',
};

type Planet = keyof typeof PLANETARY_ALCHEMY;

const ALL_PLANETS: Planet[] = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
];

// ─── Helpers ──────────────────────────────────────────────────────────

function extractSign(positions: Record<string, unknown>, planet: Planet): string | null {
  const value = positions?.[planet];
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const v = value as { sign?: string; Sign?: string; name?: string };
    return v.sign || v.Sign || v.name || null;
  }
  return null;
}

function titleCase(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// ─── Component ────────────────────────────────────────────────────────

interface PlanetaryInfluenceTooltipProps {
  tokenType: TokenType;
  className?: string;
}

export function PlanetaryInfluenceTooltip({
  tokenType,
  className = '',
}: PlanetaryInfluenceTooltipProps) {
  const { planetaryPositions } = useAlchemical();

  const contributors = useMemo(() => {
    return ALL_PLANETS.filter(
      (planet) => (PLANETARY_ALCHEMY[planet] as Record<TokenType, number>)[tokenType] > 0,
    )
      .map((planet) => ({
        planet,
        sign: extractSign(planetaryPositions ?? {}, planet),
      }))
      .slice(0, 4);
  }, [tokenType, planetaryPositions]);

  const lead =
    contributors.length > 0 && contributors[0].sign
      ? `${tokenType} is flowing from ${contributors[0].planet} in ${titleCase(contributors[0].sign)}.`
      : `${tokenType} is produced by the planets below.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`glass-card-premium rounded-2xl border-white/10 px-4 py-3 min-w-[240px] max-w-[280px] shadow-[0_12px_40px_rgba(0,0,0,0.5)] ${className}`}
      role="tooltip"
    >
      <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">
        Planetary Influence
      </div>
      <div className="text-[11px] font-bold text-white/85 leading-snug mb-2">{lead}</div>
      <div className="text-[9px] text-white/40 italic mb-3">{TOKEN_TAGLINE[tokenType]}</div>

      {contributors.length > 0 && (
        <ul className="space-y-1.5">
          {contributors.map(({ planet, sign }) => (
            <li
              key={planet}
              className="flex items-center justify-between text-[10px] border-t border-white/5 pt-1.5 first:border-t-0 first:pt-0"
            >
              <span className="font-bold text-white/70">{planet}</span>
              <span className="text-white/35 tabular-nums">
                {sign ? titleCase(sign) : '—'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
