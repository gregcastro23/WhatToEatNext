"use client";
import type { Season } from '@/types/alchemy';
import type { PlanetaryPosition } from '@/types/celestial';
import { getAlchemicalStateWithVectors } from '@/utils';
import React from 'react';

type Props = {
  planetaryPositions: Record<string, PlanetaryPosition>;
  aspects?: Array<{ planet1: string; planet2: string; type?: string; aspectType?: string; orb?: number }>;
  season?: Season;
  governing?: 'sun' | 'moon' | 'dominant' | 'ensemble';
};

export default function SignVectorPanel({ planetaryPositions, aspects, season, governing = 'dominant' }: Props) {
  const state = React.useMemo(() => getAlchemicalStateWithVectors({ planetaryPositions, aspects: aspects as any, season, governing }), [planetaryPositions, aspects, season, governing]);
  const { selected, blendedAlchemical, thermodynamics } = state;

  return (
    <div style={{ border: '1px solid #444', borderRadius: 8, padding: 12, marginTop: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Current Sign Expression</div>
      <div>Sign: {selected.sign}</div>
      <div>Direction: {selected.direction}</div>
      <div>Magnitude: {(selected.magnitude * 100).toFixed(1)}%</div>
      <div style={{ marginTop: 8, fontWeight: 600 }}>Vector-Adjusted ESMS</div>
      <div>Spirit: {blendedAlchemical.Spirit.toFixed(3)}</div>
      <div>Essence: {blendedAlchemical.Essence.toFixed(3)}</div>
      <div>Matter: {blendedAlchemical.Matter.toFixed(3)}</div>
      <div>Substance: {blendedAlchemical.Substance.toFixed(3)}</div>
      <div style={{ marginTop: 8, fontWeight: 600 }}>Thermodynamics</div>
      <div>Heat: {thermodynamics.heat.toFixed(4)}</div>
      <div>Entropy: {thermodynamics.entropy.toFixed(4)}</div>
      <div>Reactivity: {thermodynamics.reactivity.toFixed(4)}</div>
      <div>Greg's Energy: {thermodynamics.gregsEnergy.toFixed(4)}</div>
      <div>Kalchm: {thermodynamics.kalchm.toFixed(4)}</div>
      <div>Monica: {Number.isFinite(thermodynamics.monica) ? thermodynamics.monica.toFixed(4) : 'NaN'}</div>
    </div>
  );
}
