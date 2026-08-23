"use client";

import { useTemperatureUnit } from "@/lib/cooking/temperatureUnits";
import type { JSX } from "react";

export function TemperatureUnitToggle({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}): JSX.Element {
  const { unit, setUnit } = useTemperatureUnit();

  return (
    <div
      className={`inline-flex items-center rounded-md border border-white/15 bg-white/5 p-0.5 text-xs font-medium tracking-wide ${className}`}
      role="group"
      aria-label="Temperature unit selection"
    >
      <button
        type="button"
        onClick={() => setUnit("fahrenheit")}
        className={`rounded px-2 py-1 transition-colors ${
          unit === "fahrenheit"
            ? "bg-amber-500 text-black font-semibold shadow-sm"
            : "text-white/70 hover:text-white"
        } ${size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs"}`}
        aria-pressed={unit === "fahrenheit"}
      >
        °F <span className="hidden sm:inline font-normal text-[10px] opacity-80">(NY Default)</span>
      </button>
      <button
        type="button"
        onClick={() => setUnit("celsius")}
        className={`rounded px-2 py-1 transition-colors ${
          unit === "celsius"
            ? "bg-amber-500 text-black font-semibold shadow-sm"
            : "text-white/70 hover:text-white"
        } ${size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs"}`}
        aria-pressed={unit === "celsius"}
      >
        °C <span className="hidden sm:inline font-normal text-[10px] opacity-80">(Metric)</span>
      </button>
    </div>
  );
}
