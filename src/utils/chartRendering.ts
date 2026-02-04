/**
 * Chart Rendering Utilities
 *
 * Utilities for rendering planetary charts in SVG format.
 * Converts astronomical coordinates to SVG coordinates.
 */

import type { Planet, ZodiacSign, PlanetaryAspect, AspectType } from "@/types/celestial";

/**
 * Convert ecliptic longitude (0-360°) to SVG coordinates
 * @param longitude - Ecliptic longitude in degrees (0 = 0° Aries)
 * @param radius - Radius of the circle
 * @param centerX - X coordinate of circle center
 * @param centerY - Y coordinate of circle center
 * @returns {x, y} coordinates
 */
export function degreesToSVGCoords(
  longitude: number,
  radius: number,
  centerX: number = 250,
  centerY: number = 250
): { x: number; y: number } {
  // Convert to radians, adjusting so 0° Aries is at top (90° in standard coords)
  const radians = ((longitude - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(radians),
    y: centerY + radius * Math.sin(radians),
  };
}

/**
 * Get zodiac sign starting longitude
 * @param sign - Zodiac sign
 * @returns Starting longitude in degrees
 */
export function getZodiacStartDegree(sign: ZodiacSign): number {
  const signs: ZodiacSign[] = [
    "aries", "taurus", "gemini", "cancer",
    "leo", "virgo", "libra", "scorpio",
    "sagittarius", "capricorn", "aquarius", "pisces"
  ];

  const index = signs.indexOf(sign);
  return index * 30; // Each sign is 30°
}

/**
 * Calculate absolute ecliptic longitude from sign + degree
 * @param sign - Zodiac sign
 * @param degree - Degree within sign (0-30)
 * @returns Absolute longitude (0-360)
 */
export function calculateAbsoluteLongitude(sign: ZodiacSign, degree: number): number {
  const signStart = getZodiacStartDegree(sign);
  return signStart + degree;
}

/**
 * Get color for aspect type
 * @param type - Aspect type
 * @returns CSS color string
 */
export function getAspectColor(type: AspectType | undefined): string {
  const colors: Record<AspectType, string> = {
    conjunction: "#FF6B6B", // Red - powerful
    opposition: "#4ECDC4",  // Teal - tension
    trine: "#45B7D1",       // Blue - harmony
    square: "#FFA07A",      // Orange - challenge
    sextile: "#98D8C8",     // Green - opportunity
  };

  return type ? colors[type] || "#888888" : "#888888";
}

/**
 * Get aspect line style (stroke-dasharray)
 * @param type - Aspect type
 * @returns Dasharray pattern
 */
export function getAspectLineStyle(type: AspectType | undefined): string {
  const styles: Record<AspectType, string> = {
    conjunction: "none",      // Solid
    opposition: "5,5",        // Dashed
    trine: "none",           // Solid
    square: "3,3",           // Short dashed
    sextile: "2,2",          // Dotted
  };

  return type ? styles[type] || "none" : "none";
}

/**
 * Get planet symbol (Unicode)
 * @param planet - Planet name
 * @returns Unicode symbol
 */
export function getPlanetSymbol(planet: string): string {
  const symbols: Record<string, string> = {
    Sun: "☉",
    Moon: "☽",
    Mercury: "☿",
    Venus: "♀",
    Mars: "♂",
    Jupiter: "♃",
    Saturn: "♄",
    Uranus: "♅",
    Neptune: "♆",
    Pluto: "♇",
    Ascendant: "AC",
  };

  return symbols[planet] || planet.charAt(0);
}

/**
 * Get zodiac glyph (Unicode)
 * @param sign - Zodiac sign
 * @returns Unicode symbol
 */
export function getZodiacGlyph(sign: ZodiacSign): string {
  const glyphs: Record<ZodiacSign, string> = {
    aries: "♈",
    taurus: "♉",
    gemini: "♊",
    cancer: "♋",
    leo: "♌",
    virgo: "♍",
    libra: "♎",
    scorpio: "♏",
    sagittarius: "♐",
    capricorn: "♑",
    aquarius: "♒",
    pisces: "♓",
  };

  return glyphs[sign] || sign.charAt(0).toUpperCase();
}

/**
 * Get planet color for visualization
 * @param planet - Planet name
 * @returns CSS color string
 */
export function getPlanetColor(planet: string): string {
  const colors: Record<string, string> = {
    Sun: "#FFD700",      // Gold
    Moon: "#C0C0C0",     // Silver
    Mercury: "#FFA500",  // Orange
    Venus: "#FF69B4",    // Pink
    Mars: "#FF4500",     // Red-Orange
    Jupiter: "#4169E1",  // Royal Blue
    Saturn: "#8B4513",   // Brown
    Uranus: "#40E0D0",   // Turquoise
    Neptune: "#9370DB",  // Purple
    Pluto: "#8B0000",    // Dark Red
    Ascendant: "#FFFFFF", // White
  };

  return colors[planet] || "#888888";
}

/**
 * Get element color
 * @param element - Element name
 * @returns CSS color string
 */
export function getElementColor(element: string): string {
  const colors: Record<string, string> = {
    Fire: "#FF6B6B",    // Red
    Earth: "#8B4513",   // Brown
    Air: "#87CEEB",     // Sky Blue
    Water: "#4682B4",   // Steel Blue
  };

  return colors[element] || "#888888";
}

/**
 * Format degree string with zodiac sign
 * @param sign - Zodiac sign
 * @param degree - Degree within sign
 * @param minute - Minute within degree
 * @returns Formatted string like "15°32' Aries"
 */
export function formatDegreeString(
  sign: ZodiacSign,
  degree: number,
  minute: number = 0
): string {
  const signName = sign.charAt(0).toUpperCase() + sign.slice(1);
  const degreeInt = Math.floor(degree);
  const minuteInt = Math.floor(minute);

  return `${degreeInt}°${minuteInt.toString().padStart(2, '0')}' ${signName}`;
}

/**
 * Calculate arc path for zodiac sign segment
 * @param signIndex - Sign index (0-11)
 * @param innerRadius - Inner radius of arc
 * @param outerRadius - Outer radius of arc
 * @param centerX - Center X
 * @param centerY - Center Y
 * @returns SVG path data
 */
export function getZodiacArcPath(
  signIndex: number,
  innerRadius: number,
  outerRadius: number,
  centerX: number = 250,
  centerY: number = 250
): string {
  const startAngle = signIndex * 30 - 90; // -90 to start at top
  const endAngle = startAngle + 30;

  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const x1 = centerX + outerRadius * Math.cos(startRad);
  const y1 = centerY + outerRadius * Math.sin(startRad);
  const x2 = centerX + outerRadius * Math.cos(endRad);
  const y2 = centerY + outerRadius * Math.sin(endRad);
  const x3 = centerX + innerRadius * Math.cos(endRad);
  const y3 = centerY + innerRadius * Math.sin(endRad);
  const x4 = centerX + innerRadius * Math.cos(startRad);
  const y4 = centerY + innerRadius * Math.sin(startRad);

  return `
    M ${x1} ${y1}
    A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2}
    L ${x3} ${y3}
    A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4}
    Z
  `;
}

/**
 * Get retrograde symbol
 * @returns Unicode symbol for retrograde
 */
export function getRetrogradeSymbol(): string {
  return "℞";
}
