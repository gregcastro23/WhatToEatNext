/**
 * PlanetaryChart Component
 *
 * SVG-based visualization of planetary positions in a zodiac wheel.
 * Displays planets, zodiac signs, and aspects.
 */

"use client";

import React from "react";
import type { PlanetaryPosition, PlanetaryAspect } from "@/types/celestial";

type PlanetPosition = PlanetaryPosition;
import {
  degreesToSVGCoords,
  getZodiacArcPath,
  getPlanetSymbol,
  getZodiacGlyph,
  getPlanetColor,
  getElementColor,
  getAspectColor,
  getAspectLineStyle,
  formatDegreeString,
  getRetrogradeSymbol,
  calculateAbsoluteLongitude,
} from "@/utils/chartRendering";

export interface PlanetaryChartProps {
  positions: Record<string, PlanetPosition>;
  aspects?: PlanetaryAspect[];
  size?: number;
  showAspects?: boolean;
  showDegrees?: boolean;
  highlightPlanets?: string[];
  className?: string;
}

const ZODIAC_SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const;

const ZODIAC_ELEMENTS = {
  aries: "Fire",
  taurus: "Earth",
  gemini: "Air",
  cancer: "Water",
  leo: "Fire",
  virgo: "Earth",
  libra: "Air",
  scorpio: "Water",
  sagittarius: "Fire",
  capricorn: "Earth",
  aquarius: "Air",
  pisces: "Water",
};

export const PlanetaryChart: React.FC<PlanetaryChartProps> = ({
  positions,
  aspects = [],
  size = 500,
  showAspects = true,
  showDegrees = true,
  highlightPlanets = [],
  className = "",
}) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = (size / 2) * 0.85;
  const innerRadius = (size / 2) * 0.65;
  const planetRadius = (size / 2) * 0.75;

  // Render zodiac wheel
  const renderZodiacWheel = () => {
    return ZODIAC_SIGNS.map((sign, index) => {
      const element = ZODIAC_ELEMENTS[sign];
      const color = getElementColor(element);
      const path = getZodiacArcPath(
        index,
        innerRadius,
        outerRadius,
        centerX,
        centerY,
      );

      // Calculate position for zodiac glyph
      const angle = index * 30 + 15 - 90; // Center of sign
      const glyphRadius = (innerRadius + outerRadius) / 2;
      const glyphPos = degreesToSVGCoords(
        angle + 90,
        glyphRadius,
        centerX,
        centerY,
      );

      return (
        <g key={sign}>
          {/* Zodiac sign arc */}
          <path
            d={path}
            fill={color}
            fillOpacity={0.15}
            stroke="#333"
            strokeWidth={1}
          />

          {/* Zodiac glyph */}
          <text
            x={glyphPos.x}
            y={glyphPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={size * 0.04}
            fill="#666"
            fontWeight="bold"
          >
            {getZodiacGlyph(sign)}
          </text>

          {/* Degree markers */}
          {[0, 10, 20, 30].map((deg) => {
            const markerAngle = index * 30 + deg - 90;
            const markerStart = degreesToSVGCoords(
              markerAngle + 90,
              innerRadius,
              centerX,
              centerY,
            );
            const markerEnd = degreesToSVGCoords(
              markerAngle + 90,
              deg === 0 || deg === 30 ? innerRadius - 8 : innerRadius - 4,
              centerX,
              centerY,
            );

            return (
              <line
                key={`${sign}-${deg}`}
                x1={markerStart.x}
                y1={markerStart.y}
                x2={markerEnd.x}
                y2={markerEnd.y}
                stroke="#333"
                strokeWidth={deg === 0 || deg === 30 ? 2 : 1}
              />
            );
          })}
        </g>
      );
    });
  };

  // Render aspect lines
  const renderAspects = () => {
    if (!showAspects || aspects.length === 0) return null;

    return aspects.map((aspect, index) => {
      const planet1Pos = positions[aspect.planet1];
      const planet2Pos = positions[aspect.planet2];

      if (!planet1Pos || !planet2Pos) return null;

      const long1 = calculateAbsoluteLongitude(
        planet1Pos.sign,
        planet1Pos.degree,
      );
      const long2 = calculateAbsoluteLongitude(
        planet2Pos.sign,
        planet2Pos.degree,
      );

      const pos1 = degreesToSVGCoords(
        long1,
        planetRadius * 0.85,
        centerX,
        centerY,
      );
      const pos2 = degreesToSVGCoords(
        long2,
        planetRadius * 0.85,
        centerX,
        centerY,
      );

      const color = getAspectColor(aspect.type);
      const dashArray = getAspectLineStyle(aspect.type);

      return (
        <line
          key={`aspect-${index}`}
          x1={pos1.x}
          y1={pos1.y}
          x2={pos2.x}
          y2={pos2.y}
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray={dashArray}
          opacity={0.5}
        />
      );
    });
  };

  // Render planets
  const renderPlanets = () => {
    return Object.entries(positions).map(([planet, position]) => {
      const longitude = calculateAbsoluteLongitude(
        position.sign,
        position.degree,
      );
      const pos = degreesToSVGCoords(longitude, planetRadius, centerX, centerY);

      const color = getPlanetColor(planet);
      const symbol = getPlanetSymbol(planet);
      const isHighlighted = highlightPlanets.includes(planet);

      return (
        <g key={planet}>
          {/* Planet circle background */}
          <circle
            cx={pos.x}
            cy={pos.y}
            r={size * 0.04}
            fill={color}
            stroke={isHighlighted ? "#FFD700" : "#333"}
            strokeWidth={isHighlighted ? 3 : 1.5}
            opacity={0.9}
          />

          {/* Planet symbol */}
          <text
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={size * 0.03}
            fill="#FFF"
            fontWeight="bold"
          >
            {symbol}
          </text>

          {/* Retrograde indicator */}
          {position.isRetrograde && (
            <text
              x={pos.x + size * 0.05}
              y={pos.y - size * 0.04}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={size * 0.02}
              fill="#FF6B6B"
              fontWeight="bold"
            >
              {getRetrogradeSymbol()}
            </text>
          )}

          {/* Degree label */}
          {showDegrees && (
            <text
              x={pos.x}
              y={pos.y + size * 0.08}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={size * 0.02}
              fill="#666"
            >
              {formatDegreeString(
                position.sign,
                position.degree,
                position.minute,
              )}
            </text>
          )}
        </g>
      );
    });
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ maxWidth: "100%", height: "auto" }}
    >
      {/* Background */}
      <circle
        cx={centerX}
        cy={centerY}
        r={outerRadius}
        fill="url(#chartGradient)"
        stroke="#333"
        strokeWidth={2}
      />

      {/* Gradient definition */}
      <defs>
        <radialGradient id="chartGradient">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#0f0f1e" />
        </radialGradient>
      </defs>

      {/* Zodiac wheel */}
      {renderZodiacWheel()}

      {/* Inner circle */}
      <circle
        cx={centerX}
        cy={centerY}
        r={innerRadius}
        fill="#0a0a15"
        stroke="#333"
        strokeWidth={2}
      />

      {/* Aspect lines (rendered first so planets appear on top) */}
      {renderAspects()}

      {/* Planets */}
      {renderPlanets()}

      {/* Center point */}
      <circle cx={centerX} cy={centerY} r={3} fill="#FFD700" />
    </svg>
  );
};

export default PlanetaryChart;
