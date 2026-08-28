import React, { useEffect, useMemo, useState } from "react";
import { PlanetaryHourCalculator } from "@/lib/PlanetaryHourCalculator";
import type { Planet } from "@/types/celestial";

interface Props {
  latitude?: number;
  longitude?: number;
  className?: string;
}

interface PlanetaryHourState {
  planet: Planet;
  isDaytime: boolean;
  timeRemainingMs: number;
  nextPlanet: Planet;
  start: Date;
  end: Date;
}

export function PlanetaryHourCard({
  latitude,
  longitude,
  className,
}: Props): React.ReactElement {
  const calculator = useMemo(
    () => new PlanetaryHourCalculator(latitude, longitude),
    [latitude, longitude],
  );

  const [state, setState] = useState<PlanetaryHourState>(() => {
    const now = new Date();
    const detailed = calculator.getDetailedPlanetaryHour(now);

    return {
      planet: detailed.planet,
      isDaytime: detailed.isDaytime,
      timeRemainingMs: Math.max(0, detailed.end.getTime() - now.getTime()),
      nextPlanet: detailed.nextPlanet,
      start: detailed.start,
      end: detailed.end,
    };
  });

  useEffect(() => {
    const tick = (): void => {
      const now = new Date();
      const detailed = calculator.getDetailedPlanetaryHour(now);

      setState({
        planet: detailed.planet,
        isDaytime: detailed.isDaytime,
        timeRemainingMs: Math.max(0, detailed.end.getTime() - now.getTime()),
        nextPlanet: detailed.nextPlanet,
        start: detailed.start,
        end: detailed.end,
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return (): void => clearInterval(interval);
  }, [calculator]);

  const minutes = Math.floor(state.timeRemainingMs / 60000);
  const seconds = Math.floor((state.timeRemainingMs % 60000) / 1000);

  return (
    <div className={className ?? ""}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontWeight: 700 }}>Current Planetary Hour</div>
        <div>
          <span style={{ fontWeight: 600 }}>{state.planet}</span>{" "}
          <span>({state.isDaytime ? "Day" : "Night"})</span>
        </div>
        <div>
          Ends at: {state.end.toLocaleTimeString()} • Time remaining:{" "}
          {minutes.toString().padStart(2, "0")}:
          {seconds.toString().padStart(2, "0")}
        </div>
        <div>Next: {state.nextPlanet}</div>
      </div>
    </div>
  );
}

export default PlanetaryHourCard;
