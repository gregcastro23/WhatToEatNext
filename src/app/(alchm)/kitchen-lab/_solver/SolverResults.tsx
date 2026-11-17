"use client";

import type { CoreTimeReading, Reading, SolverResult, SurfaceStateReading, WaterLossReading } from "@/lib/cooking/labSolver";
import { getCarryoverRestGuidance, type TemperatureUnit } from "@/lib/cooking/temperatureUnits";
import type { FoodGeometry } from "@/lib/cooking/thermo";
import { ResistanceChain } from "./ResistanceChain";
import type React from "react";

const MAILLARD_THRESHOLD_C = 140;

function Value<T>({ reading, children }: { reading: Reading<T>; children: (value: T) => React.JSX.Element }): React.JSX.Element {
  return reading.available ? children(reading.value) : <p className="ma-refusal">{reading.reason}</p>;
}

function biotRegimeLabel(biot: number): string {
  if (biot < 0.1) return "surface-limited";
  if (biot <= 10) return "mixed";
  return "interior-limited";
}

function buildCurveGeometry(reading: CoreTimeReading, startC: number, targetC: number): {
  path: string; startY: number; targetY: number; endX: number;
} {
  const minT = Math.min(startC, targetC);
  const maxT = Math.max(startC, targetC, reading.mediumC);
  const spanT = Math.max(maxT - minT, 1);
  const px = (frac: number): number => 42 + frac * 264;
  const py = (c: number): number => 96 - ((c - minT) / spanT) * 82;
  const decayPerUnit = reading.lambda1 * reading.lambda1 * reading.fourier;
  const pts: string[] = [];
  for (let i = 0; i <= 16; i += 1) {
    const frac = i / 16;
    const raw = i === 0 ? startC : reading.mediumC + (startC - reading.mediumC) * reading.coefficientA1 * Math.exp(-decayPerUnit * frac);
    pts.push(`${i === 0 ? "M" : "L"} ${px(frac).toFixed(1)} ${py(Math.min(maxT, Math.max(minT, raw))).toFixed(1)}`);
  }
  return { path: pts.join(" "), startY: py(startC), targetY: py(targetC), endX: px(1) };
}

function CoreTimeCurve({
  reading, startC, targetC, formatTemp,
}: {
  reading: CoreTimeReading; startC: number; targetC: number; formatTemp: (c: number, p?: number) => string;
}): React.JSX.Element | null {
  if (!Number.isFinite(reading.minutes) || reading.minutes <= 0) return null;
  const { path, startY, targetY, endX } = buildCurveGeometry(reading, startC, targetC);
  return (
    <svg viewBox="0 0 320 120" className="ma-curve" role="img"
      aria-label={`Core temperature curve from ${formatTemp(startC)} to ${formatTemp(targetC)} over ${Math.round(reading.minutes)} minutes`}>
      <line x1={42} x2={306} y1={targetY} y2={targetY} className="ma-curve__target" />
      <text x={38} y={targetY + 3} className="ma-curve__tick" textAnchor="end">{formatTemp(targetC)}</text>
      <text x={38} y={startY + 3} className="ma-curve__tick" textAnchor="end">{formatTemp(startC)}</text>
      <path d={path} className="ma-curve__path" />
      <circle cx={endX} cy={targetY} r="3.5" className="ma-curve__dot" />
      <text x={306} y={114} className="ma-curve__tick" textAnchor="end">{Math.round(reading.minutes)} min</text>
    </svg>
  );
}

function SurfaceScale({
  lowerBoundC, ceilingC, ambientC, formatTemp,
}: {
  lowerBoundC: number; ceilingC: number; ambientC: number; formatTemp: (c: number, p?: number) => string;
}): React.JSX.Element {
  const minC = Math.min(ambientC, lowerBoundC, 0);
  const maxC = Math.max(MAILLARD_THRESHOLD_C + 20, ceilingC + 10, lowerBoundC + 10);
  const pct = (c: number): number => Math.min(100, Math.max(0, ((c - minC) / Math.max(maxC - minC, 1)) * 100));
  return (
    <div className="ma-scale" aria-label="Surface temperature lower bound against boiling ceiling and Maillard threshold">
      <div className="ma-scale__track">
        <span className="ma-scale__ceiling" style={{ left: `${pct(ceilingC)}%` }} title={`Boiling ceiling ${formatTemp(ceilingC, 1)}`} />
        <span className="ma-scale__maillard" style={{ left: `${pct(MAILLARD_THRESHOLD_C)}%` }} title={`Maillard threshold ${formatTemp(MAILLARD_THRESHOLD_C)}`} />
        <span className="ma-scale__bound" style={{ left: `${pct(lowerBoundC)}%`, width: `${Math.max(4, pct(ceilingC) - pct(lowerBoundC))}%` }} />
      </div>
      <div className="ma-scale__labels">
        <span>Pin ≥ {formatTemp(lowerBoundC)} (lower bound)</span>
        <span>Ceiling {formatTemp(ceilingC, 1)}</span>
        <span>Maillard ~{formatTemp(MAILLARD_THRESHOLD_C)}</span>
      </div>
    </div>
  );
}

function CoreStats({
  t, targetC, carryover, unit, formatTemp,
}: {
  t: CoreTimeReading; targetC: number; carryover: ReturnType<typeof getCarryoverRestGuidance>;
  unit: TemperatureUnit; formatTemp: (c: number, p?: number) => string;
}): React.JSX.Element {
  return (
    <dl className="ma-stats mt-3">
      <div><dt>target core</dt><dd>{formatTemp(targetC)}</dd></div>
      <div><dt>pull temp</dt><dd>{unit === "fahrenheit" ? `${carryover.pullTempF}°F` : `${Math.round(carryover.pullTempC)}°C`}</dd></div>
      <div><dt>carryover rise</dt><dd>+{unit === "fahrenheit" ? `${carryover.carryoverRiseF}°F` : `${((carryover.carryoverRiseF * 5) / 9).toFixed(1)}°C`}</dd></div>
      <div><dt>Biot regime</dt><dd>{biotRegimeLabel(t.biot)} (Bi {t.biot.toFixed(2)})</dd></div>
      <div><dt>medium temp</dt><dd>{formatTemp(t.mediumC)}</dd></div>
      <div><dt>surface h</dt><dd>{t.hWm2K.toFixed(0)} W·m⁻²·K⁻¹ (±25%)</dd></div>
    </dl>
  );
}

function CoreTimeCard({
  reading, geometry, massG, startC, targetC, unit, formatTemp,
}: {
  reading: Reading<CoreTimeReading>; geometry: FoodGeometry; massG: number;
  startC: number; targetC: number; unit: TemperatureUnit; formatTemp: (c: number, p?: number) => string;
}): React.JSX.Element {
  const carryover = getCarryoverRestGuidance(targetC, massG / 1000, geometry);
  const restCopy = unit === "fahrenheit"
    ? carryover.restAdvice
    : `Pull at ${Math.round(carryover.pullTempC)}°C. Carryover heat will rise to ${Math.round(targetC)}°C during a ${carryover.restMinutes}-minute rest.`;
  return (
    <article className="ma-card">
      <h3>estimated cook time to core</h3>
      <Value reading={reading}>
        {(t) => (
          <>
            <p className="ma-headline">{Math.round(t.minutes)}<em>min</em></p>
            <CoreTimeCurve reading={t} startC={startC} targetC={targetC} formatTemp={formatTemp} />
            <div className="mt-3 rounded-md bg-white/5 p-2.5 text-xs text-white/80 border border-white/10">
              <div className="font-semibold text-amber-300 mb-1 uppercase tracking-wider text-[10px]">Resting Carryover Advice</div>
              <p className="text-white/70 leading-relaxed">{restCopy}</p>
            </div>
            <CoreStats t={t} targetC={targetC} carryover={carryover} unit={unit} formatTemp={formatTemp} />
            {!t.oneTermValid ? <p className="ma-warn mt-2">Thin cut (Fo ≤ 0.2): early transient heating is fast; verify internal temperature early with a probe.</p> : null}
          </>
        )}
      </Value>
    </article>
  );
}

function SurfaceStateCard({
  reading, ambientC, formatTemp,
}: {
  reading: Reading<SurfaceStateReading>; ambientC: number; formatTemp: (c: number, p?: number) => string;
}): React.JSX.Element {
  return (
    <article className="ma-card">
      <h3>surface browning &amp; sear</h3>
      <Value reading={reading}>
        {(v) => (
          <>
            <p className="ma-headline">≥&nbsp;{formatTemp(v.lowerBoundC)}</p>
            <p className="ma-note">As cold as the wet surface can be while evaporating. Once dry, crust climbs toward medium temperature.</p>
            <SurfaceScale lowerBoundC={v.lowerBoundC} ceilingC={v.ceilingC} ambientC={ambientC} formatTemp={formatTemp} />
            <dl className="ma-stats">
              <div><dt>water boil ceiling</dt><dd>{formatTemp(v.ceilingC, 1)}</dd></div>
              <div><dt>browning possible</dt><dd>{v.canBrown ? "Yes (≥ 284°F / 140°C)" : "No (wet surface)"}</dd></div>
            </dl>
            <p className={v.canBrown ? "ma-note font-medium text-amber-200 mt-2" : "ma-warn mt-2"}>{v.browningNote}</p>
          </>
        )}
      </Value>
    </article>
  );
}

function WaterLossCard({ reading }: { reading: Reading<WaterLossReading> }): React.JSX.Element {
  return (
    <article className="ma-card">
      <h3>moisture evaporation</h3>
      <Value reading={reading}>
        {(w) => (
          <>
            <p className="ma-headline">{w.gramsPerHour.toFixed(0)}<em>g/h</em></p>
            <p className="text-xs text-white/50 mb-2">≈ {(w.gramsPerHour * 0.033814).toFixed(1)} fl oz per hour evaporation loss</p>
            {w.covered ? (
              <div className="ma-split-bar" aria-label="Condensate return vs vapour escape">
                <div className="ma-split-bar__track">
                  <span className="ma-split-bar__returned" style={{ width: `${Math.min(100, Math.max(0, w.covered.returnFraction * 100))}%` }} />
                  <span className="ma-split-bar__escaped" />
                </div>
                <p className="ma-note">Returned as condensate: {(w.covered.returnFraction * 100).toFixed(0)}% · Escaping: {((1 - w.covered.returnFraction) * 100).toFixed(0)}%</p>
              </div>
            ) : null}
            <dl className="ma-stats">
              <div><dt>latent heat loss</dt><dd>{w.latentWatts.toFixed(0)} W</dd></div>
              {w.covered ? (
                <>
                  <div><dt>lid moisture return</dt><dd>{w.covered.returnedGramsPerHour.toFixed(0)} g/h</dd></div>
                  <div><dt>retained moisture</dt><dd>{(w.covered.returnFraction * 100).toFixed(0)} %</dd></div>
                </>
              ) : null}
            </dl>
            {w.covered?.holding ? <p className="ma-note mt-2 text-emerald-300">Lid condenses all generated steam: zero net moisture loss (braising mode).</p> : null}
          </>
        )}
      </Value>
    </article>
  );
}

export interface SolverResultsProps {
  result: SolverResult;
  geometry: FoodGeometry;
  massG: number;
  startC: number;
  targetC: number;
  unit: TemperatureUnit;
  formatTemp: (celsius: number, precision?: number) => string;
}

export function SolverResults({
  result, geometry, massG, startC, targetC, unit, formatTemp,
}: SolverResultsProps): React.JSX.Element {
  return (
    <section className="ma-results" aria-label="results">
      <CoreTimeCard reading={result.coreTime} geometry={geometry} massG={massG} startC={startC} targetC={targetC} unit={unit} formatTemp={formatTemp} />
      <SurfaceStateCard reading={result.surfaceState} ambientC={result.ambient.airC} formatTemp={formatTemp} />
      <WaterLossCard reading={result.waterLoss} />
      <article className="ma-card ma-card--wide">
        <h3>heat flow bottleneck breakdown</h3>
        <Value reading={result.bottleneck}>
          {(n) => <ResistanceChain network={n} caption={`Primary heat bottleneck: ${n.controlling.label} (${(n.controlling.share * 100).toFixed(0)}% of total delay).`} />}
        </Value>
      </article>
    </section>
  );
}
