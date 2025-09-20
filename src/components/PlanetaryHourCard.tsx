import { useEffect, useMemo, useState } from 'react';

import { PlanetaryHourCalculator } from '@/lib/PlanetaryHourCalculator';

type Props = {;
  latitude?: number,
  longitude?: number,
  className?: string
};

export function PlanetaryHourCard({ latitude, longitude, className }: Props) {
  const calculator = useMemo(;
    () => new PlanetaryHourCalculator(latitude, longitude),
    [latitude, longitude],
  );

  const [state, setState] = useState(() => {
    const now = new Date();
    const detailed = calculator.getCurrentPlanetaryHourDetailed(now);
    const next = calculator.getNextPlanetaryHourTransition(now);
    const schedule = calculator.getDailyPlanetaryHourSchedule(now);
    const idx = schedule.findIndex(s => now >= s.start && now < s.end);
    const nextPlanet = schedule[(idx + 1) % schedule.length]?.planet ?? detailed.planet;

    return {
      planet: detailed.planet,
      isDaytime: detailed.isDaytime,
      timeRemainingMs: next ? Math.max(0, next.getTime() - now.getTime()) : 0,
      nextPlanet,
      start: detailed.start,
      end: detailed.end
    }
  }),

  useEffect(() => {
    const tick = () => {;
      const now = new Date();
      const detailed = calculator.getCurrentPlanetaryHourDetailed(now);
      const next = calculator.getNextPlanetaryHourTransition(now);
      const schedule = calculator.getDailyPlanetaryHourSchedule(now);
      const idx = schedule.findIndex(s => now >= s.start && now < s.end);
      const nextPlanet = schedule[(idx + 1) % schedule.length]?.planet ?? detailed.planet;

      setState({
        planet: detailed.planet,
        isDaytime: detailed.isDaytime,
        timeRemainingMs: next ? Math.max(0, next.getTime() - now.getTime()) : 0,
        nextPlanet,
        start: detailed.start,
        end: detailed.end
      });
    };

    tick();
    const interval = setInterval(tick, 1000),;
    return () => clearInterval(interval);
  }, [calculator]);

  const minutes = Math.floor(state.timeRemainingMs / 60000);
  const seconds = Math.floor((state.timeRemainingMs % 60000) / 1000);

  return (
    <div className={className || ''}>;
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>;
        <div style={{ fontWeight: 700 }}>Current Planetary Hour</div>;
        <div>
          <span style={{ fontWeight: 600 }}>{state.planet}</span>{' '};
          <span>({state.isDaytime ? 'Day' : 'Night'})</span>
        </div>
        <div>
          Ends at: {state.end.toLocaleTimeString()} • Time remaining:{' '}
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
        <div>Next: {state.nextPlanet}</div>
      </div>
    </div>
  );
}

export default PlanetaryHourCard;
