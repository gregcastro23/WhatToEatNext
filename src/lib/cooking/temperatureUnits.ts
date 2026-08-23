"use client";

/**
 * Temperature Units & Culinary Takeaway Synthesizers
 *
 * Core philosophy: Scientific thermophysics under the hood must translate directly
 * into tangible, human-first culinary guidance for cooks in New York and worldwide.
 *
 * Defaults to Fahrenheit (°F) with an instant, persistent toggle to Celsius (°C).
 */

import { useEffect, useState } from "react";

export type TemperatureUnit = "fahrenheit" | "celsius";

const TEMP_UNIT_STORAGE_KEY = "alchm:temp_unit";
const TEMP_UNIT_CHANGE_EVENT = "alchm:temp_unit_change";

let cachedUnit: TemperatureUnit = "fahrenheit";

function getStoredTemperatureUnit(): TemperatureUnit {
  if (typeof window === "undefined") return "fahrenheit";
  try {
    const saved = localStorage.getItem(TEMP_UNIT_STORAGE_KEY);
    if (saved === "celsius" || saved === "fahrenheit") {
      cachedUnit = saved;
      return saved;
    }
  } catch {
    // Fallback to default
  }
  return "fahrenheit";
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (): void => {
    cachedUnit = getStoredTemperatureUnit();
    callback();
  };
  window.addEventListener(TEMP_UNIT_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return (): void => {
    window.removeEventListener(TEMP_UNIT_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function setTemperatureUnit(unit: TemperatureUnit): void {
  cachedUnit = unit;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(TEMP_UNIT_STORAGE_KEY, unit);
    } catch {
      // Ignore
    }
    window.dispatchEvent(new Event(TEMP_UNIT_CHANGE_EVENT));
  }
}

/**
 * React hook for app-wide temperature unit preference.
 * Defaults to Fahrenheit (°F).
 */
export function useTemperatureUnit(): {
  unit: TemperatureUnit;
  setUnit: (unit: TemperatureUnit) => void;
  toggleUnit: () => void;
  formatTemp: (celsius: number, precision?: number) => string;
} {
  const [unit, setUnitState] = useState<TemperatureUnit>("fahrenheit");

  useEffect(() => {
    setUnitState(getStoredTemperatureUnit());
    return subscribe(() => {
      setUnitState(cachedUnit);
    });
  }, []);

  const setUnit = (newUnit: TemperatureUnit): void => {
    setTemperatureUnit(newUnit);
    setUnitState(newUnit);
  };

  const toggleUnit = (): void => {
    const next = unit === "fahrenheit" ? "celsius" : "fahrenheit";
    setUnit(next);
  };

  const format = (celsius: number, precision = 0): string =>
    formatCookingTemp(celsius, unit, precision);

  return {
    unit,
    setUnit,
    toggleUnit,
    formatTemp: format,
  };
}

// ---------------------------------------------------------------------------
// Conversion Utilities
// ---------------------------------------------------------------------------

export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

export function fahrenheitToCelsius(f: number): number {
  return ((f - 32) * 5) / 9;
}

/**
 * Format a Celsius value to the user's active temperature unit.
 * E.g., 74°C -> "165°F" (fahrenheit) or "74°C" (celsius).
 */
export function formatCookingTemp(
  celsius: number,
  unit: TemperatureUnit = "fahrenheit",
  precision = 0
): string {
  if (!Number.isFinite(celsius)) return "—";
  if (unit === "fahrenheit") {
    const f = celsiusToFahrenheit(celsius);
    return `${precision > 0 ? f.toFixed(precision) : Math.round(f)}°F`;
  }
  return `${precision > 0 ? celsius.toFixed(precision) : Math.round(celsius)}°C`;
}

/**
 * Format liquid volume in familiar cook units (Quarts / Cups and Liters).
 */
export function formatCookingVolume(liters: number): {
  primary: string;
  secondary: string;
  cups: string;
} {
  if (!Number.isFinite(liters) || liters < 0) {
    return { primary: "—", secondary: "—", cups: "—" };
  }
  const quarts = liters * 1.05669;
  const cups = liters * 4.22675;
  const primary = quarts >= 1
    ? `${quarts.toFixed(2)} qt`
    : `${cups.toFixed(1)} cups`;
  const secondary = `${liters.toFixed(2)} L`;
  return {
    primary,
    secondary,
    cups: `${cups.toFixed(1)} cups`,
  };
}

/**
 * Translate mathematical solute concentration ratio V₀ / V(t) into culinary milestones.
 */
export function formatSoluteConcentration(ratio: number): {
  label: string;
  culinaryStage: string;
  flavorImpact: string;
} {
  if (!Number.isFinite(ratio) || ratio <= 1.05) {
    return {
      label: "1.0×",
      culinaryStage: "Full Volume / Base Broth",
      flavorImpact: "Baseline salt and savory profile",
    };
  }
  if (ratio < 1.4) {
    return {
      label: `${ratio.toFixed(1)}×`,
      culinaryStage: "Light Reduction",
      flavorImpact: `Body thickening, seasoning intensified by ${Math.round((ratio - 1) * 100)}%`,
    };
  }
  if (ratio < 2.5) {
    return {
      label: `${ratio.toFixed(1)}×`,
      culinaryStage: "Demi-Glace / Velvety Sauce",
      flavorImpact: "Rich mouthfeel, gelatin coated, salt & aromatics doubled",
    };
  }
  if (ratio < 6.0) {
    return {
      label: `${ratio.toFixed(1)}×`,
      culinaryStage: "Glacé / Syrupy Glaze",
      flavorImpact: "Intense savory glaze, sticky spoon-coating texture",
    };
  }
  return {
    label: `${ratio.toFixed(1)}×`,
    culinaryStage: "Heavy Reduction / Near Dry",
    flavorImpact: "Extreme concentration — lower heat to avoid scorching",
  };
}

/**
 * Synthesize raw thermal resistance links into plain-English bottleneck insights.
 */
export function explainHeatBottleneck(
  linkId: string,
  shareFraction: number
): {
  bottleneckTitle: string;
  explanation: string;
  culinaryTip: string;
} {
  const sharePct = Math.round(shareFraction * 100);

  if (linkId.includes("source") || linkId.includes("burner")) {
    return {
      bottleneckTitle: `Burner-to-Pan Contact (${sharePct}% bottleneck)`,
      explanation:
        "The primary delay is getting thermal energy from the burner element into the pan exterior.",
      culinaryTip:
        "Preheat your pan for 3–4 minutes on medium heat before adding cooking fats or ingredients.",
    };
  }

  if (linkId.includes("vessel") && linkId.includes("wall")) {
    return {
      bottleneckTitle: `Cookware Wall Conduction (${sharePct}% bottleneck)`,
      explanation:
        "Heat flows through the multi-ply cookware base and side walls.",
      culinaryTip:
        "Heavy-bottomed tri-ply or copper spreads heat evenly across the food surface.",
    };
  }

  if (linkId.includes("medium") || linkId.includes("contact") || linkId.includes("inside")) {
    return {
      bottleneckTitle: `Pan-to-Food Contact Boundary (${sharePct}% bottleneck)`,
      explanation:
        "Microscopic air gaps between the hot vessel surface and the food insulate and slow heat transfer.",
      culinaryTip:
        "Add cooking oil or butter to fill microscopic voids and create a high-conductance liquid thermal bridge.",
    };
  }

  return {
    bottleneckTitle: `Interior Food Heat Conduction (${sharePct}% bottleneck)`,
    explanation:
      "Heat is moving from the seared exterior into the cooler center of the food.",
    culinaryTip:
      "Lower cooking flame or transfer to oven to allow internal core temperature to rise without burning the crust.",
  };
}

/**
 * Calculate recommended pull temperature and resting carryover rise.
 */
export function getCarryoverRestGuidance(
  targetC: number,
  massKg: number,
  geometry = "slab"
): {
  pullTempC: number;
  pullTempF: number;
  targetTempF: number;
  carryoverRiseF: number;
  restMinutes: number;
  restAdvice: string;
} {
  const targetF = celsiusToFahrenheit(targetC);
  
  // Large roasts (>0.8kg) carry more thermal inertia than cutlets (<0.25kg)
  let carryoverRiseF = 5;
  let restMinutes = 5;

  if (massKg >= 1.0 || geometry === "sphere") {
    carryoverRiseF = 8;
    restMinutes = 10;
  } else if (massKg >= 0.5) {
    carryoverRiseF = 6;
    restMinutes = 7;
  } else if (massKg < 0.2) {
    carryoverRiseF = 3;
    restMinutes = 3;
  }

  const pullTempF = Math.round(targetF - carryoverRiseF);
  const pullTempC = fahrenheitToCelsius(pullTempF);

  return {
    pullTempC,
    pullTempF,
    targetTempF: Math.round(targetF),
    carryoverRiseF,
    restMinutes,
    restAdvice: `Pull from heat when internal probe reads ${pullTempF}°F. Carryover heat will coast the core to ${Math.round(targetF)}°F during a ${restMinutes}-minute rest on a warm board.`,
  };
}
