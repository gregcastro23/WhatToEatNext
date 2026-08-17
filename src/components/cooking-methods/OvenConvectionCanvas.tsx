"use client";

/**
 * 3D Oven Convection & Heat Flux Canvas Renderer.
 *
 * Executes a frame-by-frame (60 FPS) Delta Time physics rendering loop.
 * Visualizes:
 *  1. Convection particle velocity currents (medium temperature & h-driven).
 *  2. Stefan-Boltzmann radiant flux vectors (source temperature & emissivity).
 *  3. Transient Biot/Fourier heat conduction gradient into the slab core.
 *  4. Z-Score statistical distribution overlay (±1σ, ±2σ, ±3σ) for method standardisation.
 *
 * Resilience: 100% functional offline in Tauri desktop environments using local
 * thermodynamic math, with graceful degradation when SpacetimeDB/WASM drop.
 */

import React, { useEffect, useRef, useState } from "react";
import type { MethodPhysicsMetrics } from "@/lib/cooking/methodMetrics";
import {
  createThermoEngine,
  FallbackThermoEngine,
  simulationInputs,
  FLOATS_PER_PARTICLE,
  type ThermoEngineHandle,
} from "@/lib/wasm/thermoEngine";

/** Particles simulated. Matches the count the golden trace was generated from. */
const PARTICLE_COUNT = 60;

export function OvenConvectionCanvas({ metrics }: { metrics: MethodPhysicsMetrics }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  // What is ACTUALLY executing. Rendered to the user, so it is state rather
  // than a constant — see the note beside the label at the bottom of this file.
  const [engineKind, setEngineKind] = useState<"wasm" | "typescript">("typescript");

  const { transfer } = metrics;
  const { ovenTempC: mediumC, hWm2K, radiantSourceK: radiantK } = simulationInputs(metrics);
  // Decorative mode: this method has no h of its own, so the loop borrows the
  // roasting profile to have something to animate (see simulationInputs). The
  // ANIMATION may borrow; the TEXT may not — every displayed claim below is
  // gated so the borrowed figures are never presented as this method's own.
  const decorative = transfer === null;
  // null = nothing to standardise: either no coefficient at all (decorative)
  // or a degenerate corpus spread. Distinct from z = 0, which is a real
  // "exactly at the median" measurement — the two must never be conflated
  // (`?? 0` here once meant this panel claimed "typical" about a coefficient
  // that does not exist).
  const z = transfer?.z ?? null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let disposed = false;
    let lastTime = performance.now();

    // Start on the TypeScript engine SYNCHRONOUSLY, then upgrade to WASM if it
    // arrives. Acquiring the WASM module is async, and making the first frame
    // wait on that promise would reintroduce the blank-canvas defect fixed
    // below — the panel would mount empty and stay empty anywhere rAF does not
    // fire, which is exactly where the synchronous first frame is load-bearing.
    //
    // Both engines run the same model, so the upgrade is invisible apart from
    // the label and the frame cost.
    let engine: ThermoEngineHandle = new FallbackThermoEngine(PARTICLE_COUNT);

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // The simulation itself is NOT implemented here any more. It lives in
      // `crates/thermo-core` and reaches this component either as compiled
      // WebAssembly or as the TypeScript transliteration in
      // `src/lib/wasm/thermoEngine.ts` — one model, two executables, pinned
      // together by a golden trace in
      // `src/__tests__/cookingThermoCrossRuntimeParity.test.ts`.
      //
      // `[FIXED 2026-08-16]` What used to be here was a SECOND, independently
      // written model that had drifted from the Rust it claimed to mirror:
      // buoyancy 0.003·ΔT against the Rust's effective 0.0005·ΔT, and swirl
      // amplitude 0.4 against 0.5. Because the browser silently falls back to
      // this path whenever WASM is unavailable, the "graceful degradation"
      // rendered a visibly different simulation with nothing to say so.
      if (!isPaused) {
        engine.step(dt, mediumC, hWm2K, radiantK);
      }
      const particles = engine.view();

      // Clear Canvas
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Background Oven Chamber Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, "#1e130c");
      bgGrad.addColorStop(0.5, "#0d0a08");
      bgGrad.addColorStop(1, "#18100a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Render Top Radiant Heating Element (Stefan-Boltzmann Rays)
      const rayCount = 12;
      ctx.lineWidth = 1.5;
      for (let r = 0; r < rayCount; r++) {
        const rx = (width / (rayCount + 1)) * (r + 1);
        const intensity = Math.sin(now * 0.003 + r) * 0.2 + 0.8;
        const grad = ctx.createLinearGradient(rx, 15, rx, height * 0.4);
        grad.addColorStop(0, `rgba(245, 158, 11, ${0.7 * intensity})`);
        grad.addColorStop(1, "rgba(245, 158, 11, 0.0)");
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(rx, 15);
        ctx.lineTo(rx + Math.sin(r) * 15, height * 0.4);
        ctx.stroke();
      }

      // Render Oven Top Heating Rod
      ctx.fillStyle = "#f59e0b";
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 12;
      ctx.fillRect(20, 10, width - 40, 5);
      ctx.shadowBlur = 0;

      // Render 3D Convection Particles, read straight out of the engine's
      // buffer. For the WASM engine that buffer IS linear memory — no copy,
      // no serialisation, no per-frame allocation.
      if (particles) {
        for (let o = 0; o + FLOATS_PER_PARTICLE <= particles.length; o += FLOATS_PER_PARTICLE) {
          const x = particles[o];
          const y = particles[o + 1];
          const z = particles[o + 2];
          const tempC = particles[o + 6];

          // Perspective projection
          const scale = 0.8 + z * 0.3;
          const px = width / 2 + x * (width * 0.35) * scale;
          const py = height - y * (height * 0.65) - 30;

          const radius = Math.max(2, 3.5 * scale);
          const tempRatio = Math.min(1, Math.max(0, (tempC - 20) / 200));

          const red = Math.floor(100 + tempRatio * 155);
          const blue = Math.floor(255 - tempRatio * 200);

          ctx.fillStyle = `rgba(${red}, 130, ${blue}, ${0.6 * scale})`;
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Render Central Food Slab Core Conduction Profile (Slab Transient)
      const slabW = width * 0.4;
      const slabH = 24;
      const slabX = (width - slabW) / 2;
      const slabY = height * 0.58;

      // Slab outer crust vs core gradient
      const slabGrad = ctx.createRadialGradient(
        slabX + slabW / 2,
        slabY + slabH / 2,
        2,
        slabX + slabW / 2,
        slabY + slabH / 2,
        slabW / 2,
      );
      slabGrad.addColorStop(0, "#e11d48"); // 5 °C core (pink/red)
      slabGrad.addColorStop(0.6, "#b91c1c"); // 60 °C doneness
      slabGrad.addColorStop(1, "#d97706"); // 140 °C crust (seared brown)

      ctx.fillStyle = slabGrad;
      ctx.beginPath();
      ctx.roundRect(slabX, slabY, slabW, slabH, 6);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("SLAB CORE (Biot / Fourier Conduction)", width / 2, slabY + slabH + 12);

      // Render Statistical Z-Score Overlay (-3σ to +3σ distribution boundary).
      // Only when there is a real z: drawing the median axis with a marker for
      // a method that has nothing to standardise would place a "typical" dot
      // on an axis the method is not on.
      if (z !== null) {
        const zBoxY = height - 26;
        const zBoxW = width - 40;
        const zBoxX = 20;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.beginPath();
        ctx.moveTo(zBoxX, zBoxY);
        ctx.lineTo(zBoxX + zBoxW, zBoxY);
        ctx.stroke();

        // Median tick
        const medX = zBoxX + zBoxW / 2;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.beginPath();
        ctx.moveTo(medX, zBoxY - 4);
        ctx.lineTo(medX, zBoxY + 4);
        ctx.stroke();

        // Clamped Z marker
        const clampedZ = Math.max(-3, Math.min(3, z));
        const markerPct = (clampedZ + 3) / 6;
        const markerX = zBoxX + markerPct * zBoxW;

        ctx.fillStyle = Math.abs(z) >= 2 ? "#fbbf24" : "#818cf8";
        ctx.beginPath();
        ctx.arc(markerX, zBoxY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = "9px sans-serif";
        ctx.fillStyle = "rgba(156, 163, 175, 0.9)";
        ctx.textAlign = "left";
        ctx.fillText("-3σ", zBoxX, zBoxY + 12);
        ctx.textAlign = "center";
        ctx.fillText("Median (z=0)", medX, zBoxY + 12);
        ctx.textAlign = "right";
        ctx.fillText("+3σ", zBoxX + zBoxW, zBoxY + 12);
      }

      animId = requestAnimationFrame(render);
    };

    // Paint one frame SYNCHRONOUSLY before arming the loop.
    //
    // `[MEASURED 2026-08-16]` Every draw in this component lives inside
    // `render`, which was only ever reached through requestAnimationFrame — so
    // wherever rAF does not fire, the canvas stayed an unexplained black
    // rectangle with zero lit pixels. That is not hypothetical: in a background
    // or hidden tab (`document.hidden === true`) browsers do not schedule rAF
    // at all, and the panel mounts blank and stays blank until the tab is
    // brought forward. Same outcome under heavy throttling, and same outcome in
    // the headless preview pane where this was caught (rAF: 0 calls).
    //
    // A first synchronous frame costs one paint and makes the panel correct at
    // rest, which also matters for the offline/Tauri resilience this component
    // claims — a still frame of real physics beats an empty box.
    //
    // It runs BEFORE the engine resolves, so the chamber, the element, the slab
    // and the z-axis are all drawn immediately and the particles appear on the
    // next frame. Waiting for an await here would reintroduce the blank panel.
    render(performance.now());
    animId = requestAnimationFrame(render);

    // Now try to upgrade. `disposed` guards the case where the effect is torn
    // down while the module fetch is still in flight — without it, a fast
    // unmount leaks an engine that nothing will ever free.
    void createThermoEngine(PARTICLE_COUNT).then((created) => {
      if (disposed || created.engine !== "wasm") {
        // Either we are gone, or `createThermoEngine` fell back to the same
        // TypeScript engine we are already running. Nothing to swap in.
        created.dispose();
        return;
      }
      const previous = engine;
      engine = created;
      previous.dispose();
      setEngineKind("wasm");
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      engine.dispose();
    };
  }, [mediumC, hWm2K, radiantK, z, isPaused]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-400/20 bg-black/40 p-4 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-amber-300">
            3D Thermal Physics Simulation Loop
          </h5>
          {decorative ? (
            <p className="text-[11px] text-gray-400">
              Illustrative motion only — animation parameters borrowed from the
              roasting profile. This method has no heat-transfer coefficient of
              its own; the panel below says why.
            </p>
          ) : (
            <p className="text-[11px] text-gray-400">
              Convection (h = {hWm2K} W·m⁻²·K⁻¹) · Radiation ({radiantK} K) · Transient Conduction
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsPaused((p) => !p)}
          className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-gray-300 hover:bg-white/10"
        >
          {isPaused ? "Play" : "Pause"}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={480}
        height={220}
        className="w-full rounded-lg border border-white/10 bg-black"
      />

      <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400 font-mono">
        {/* `[FIXED 2026-08-16]` This once read "Engine: WASM / Pure Rust Math"
            while the loop was plain TypeScript on Canvas 2D — no WASM loaded and
            no Rust running. On a surface whose entire premise is that displayed
            values mean what they claim, a false provenance label is the same
            defect class as the temperatures this work removed.

            It now reports whichever engine actually resolved. Both execute the
            same model from `crates/thermo-core`; the label distinguishes the
            compiled path from the transliterated fallback, and it is READ from
            the engine rather than assumed. */}
        <span>
          {engineKind === "wasm"
            ? "Engine: WebAssembly · Rust thermo-core"
            : "Engine: TypeScript · thermo-core parity build"}
        </span>
        <span>
          {z !== null
            ? `Z-Score Context: z = ${z >= 0 ? `+${z.toFixed(2)}` : z.toFixed(2)}`
            : decorative
              ? "Z-score: none — no coefficient to standardise"
              : "Z-score: none — no measurable spread across methods"}
        </span>
      </div>
    </div>
  );
}
