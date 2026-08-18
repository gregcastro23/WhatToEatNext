"use client";

/**
 * The cooking-method heat-flow canvas.
 *
 * Owns the engine lifecycle and the 60 FPS loop. What gets DRAWN lives in
 * `methodScenes.ts` (palette and copy) and `methodSceneRenderer.ts` (ink); the
 * simulation lives in `crates/thermo-core`. This file is the seam between them.
 *
 * ── What changed, and why the file no longer says "oven" ────────────────────
 *
 * `[MEASURED 2026-08-17]` It used to draw exactly one scene — a dry oven
 * chamber, a top radiant rod, buoyant tracers and a seared slab — for every one
 * of the 26 methods, with only the medium temperature, `h` and the radiant
 * source varying. Those three scalars cannot change what a picture asserts, so
 * a rolling boil, a sous-vide bath, a broiler and a −196 °C cryogen were the
 * same image with different numbers under it.
 *
 * The panel now runs the regime the method actually cooks in, and draws the
 * vessel, source and flux direction that go with it. The name is kept because
 * it is the exported symbol the physics tab imports.
 *
 * Resilience is unchanged: a synchronous first frame, a TypeScript engine that
 * upgrades to WASM if the module resolves, and no runtime error on any path.
 */

import React, { useEffect, useRef, useState } from "react";
import type { MethodPhysicsMetrics } from "@/lib/cooking/methodMetrics";
import {
  createThermoEngine,
  FallbackThermoEngine,
  simulationInputs,
  type ThermoEngineHandle,
} from "@/lib/wasm/thermoEngine";
import { drawScene } from "./methodSceneRenderer";
import { SCENE_THEMES, sceneInputs } from "./methodScenes";

/** Particles simulated. Matches the count the golden trace was generated from. */
const PARTICLE_COUNT = 60;

export function OvenConvectionCanvas({
  metrics,
}: {
  metrics: MethodPhysicsMetrics;
}): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  // What is ACTUALLY executing. Rendered to the user, so it is state rather
  // than a constant — see the note beside the label at the bottom of this file.
  const [engineKind, setEngineKind] = useState<"wasm" | "typescript">("typescript");

  const { transfer } = metrics;
  const { regime, ovenTempC: mediumC, hWm2K, radiantSourceK: radiantK } = simulationInputs(metrics);
  const scene = sceneInputs(metrics, regime);
  const theme = SCENE_THEMES[regime];
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

    // Match the backing store to the pixels the element actually occupies.
    //
    // The canvas was a fixed 480x220 buffer stretched across `w-full`, so on
    // any display with a device pixel ratio above 1 — every laptop this ships
    // to — the scene was upscaled and soft. The regime work makes the vessel
    // outlines and the hairline flux arrows carry meaning, and those are the
    // first thing a blur eats. Capped at 2 because the third ratio costs fill
    // rate on a 60 FPS loop and buys nothing visible.
    //
    // The scene is DRAWN in CSS pixels — `resize` leaves a scale transform on
    // the context — so every font size and hairline width in the renderer means
    // the same thing at any ratio. Drawing in device pixels instead would halve
    // the captions on exactly the displays that motivated the change.
    let sceneW = 480;
    let sceneH = 220;
    const resize = (): void => {
      const dpr = Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth || 480;
      const cssH = Math.round(cssW * (220 / 480));
      sceneW = cssW;
      sceneH = cssH;
      const nextW = Math.round(cssW * dpr);
      const nextH = Math.round(cssH * dpr);
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
        canvas.style.height = `${cssH}px`;
      }
      // Re-applied on every resize: setting `canvas.width` resets the context,
      // transform included, so a transform set once at mount would be silently
      // dropped the first time the panel changed size.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // `clientWidth` is 0 during server rendering and in some headless panes, so
    // `resize` falls back to the authored size rather than a zero-pixel canvas
    // that would draw nothing and report no error.
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => resize());
    observer?.observe(canvas);

    // Start on the TypeScript engine SYNCHRONOUSLY, then upgrade to WASM if it
    // arrives. Acquiring the WASM module is async, and making the first frame
    // wait on that promise would reintroduce the blank-canvas defect fixed
    // below — the panel would mount empty and stay empty anywhere rAF does not
    // fire, which is exactly where the synchronous first frame is load-bearing.
    //
    // Both engines run the same model, so the upgrade is invisible apart from
    // the label and the frame cost.
    let engine: ThermoEngineHandle = new FallbackThermoEngine(PARTICLE_COUNT);

    const render = (now: number): void => {
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
        engine.step(dt, regime, mediumC, hWm2K, radiantK);
      }
      const particles = engine.view();

      // Everything the frame draws lives in `methodSceneRenderer`, keyed on the
      // method's own regime. This used to be ~150 lines of one hardcoded oven —
      // a top element, buoyant tracers and a seared slab — painted identically
      // for a boil, a bath, a broiler and a bath of liquid nitrogen.
      drawScene(ctx, sceneW, sceneH, scene, particles, now);

      // Statistical Z-Score Overlay (-3sigma to +3sigma distribution boundary).
      // Only when there is a real z: drawing the median axis with a marker for
      // a method that has nothing to standardise would place a "typical" dot
      // on an axis the method is not on.
      if (z !== null) {
        const zBoxY = sceneH - 26;
        const zBoxW = sceneW - 40;
        const zBoxX = 20;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(zBoxX, zBoxY);
        ctx.lineTo(zBoxX + zBoxW, zBoxY);
        ctx.stroke();

        const medX = zBoxX + zBoxW / 2;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.beginPath();
        ctx.moveTo(medX, zBoxY - 4);
        ctx.lineTo(medX, zBoxY + 4);
        ctx.stroke();

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
        ctx.fillText("-3\u03c3", zBoxX, zBoxY + 12);
        ctx.textAlign = "center";
        ctx.fillText("Median (z=0)", medX, zBoxY + 12);
        ctx.textAlign = "right";
        ctx.fillText("+3\u03c3", zBoxX + zBoxW, zBoxY + 12);
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
    createThermoEngine(PARTICLE_COUNT)
      .then((created) => {
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
      })
      // `createThermoEngine` is documented never to reject — every failure path
      // resolves to the fallback engine. The catch is here so the chain is
      // HANDLED rather than floating, which the `void` operator that used to
      // stand here only silenced at the lint level. If it ever does reject, a
      // canvas that keeps running on TypeScript is the correct outcome.
      .catch(() => undefined);

    return (): void => {
      disposed = true;
      observer?.disconnect();
      cancelAnimationFrame(animId);
      engine.dispose();
    };
    // `scene` is rebuilt each render from `metrics`, so it cannot be a dep
    // without re-arming the loop every frame. Its CONTENTS are the deps: every
    // field of it is derived from these five values plus `metrics.physics`,
    // which only changes when the method does — and the method changing changes
    // `regime` too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regime, mediumC, hWm2K, radiantK, z, isPaused]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-400/20 bg-black/40 p-4 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <div>
          {/* The heading names the SCENE, not the file. A panel titled "3D
              Thermal Physics Simulation Loop" said the same thing over a boil,
              a broiler and a bath of liquid nitrogen — which was accurate about
              the code and useless about the method. */}
          <h5 className="text-xs font-bold uppercase tracking-wider text-amber-300">
            {theme.title}
          </h5>
          <p className="text-[11px] text-gray-400">{theme.flow}</p>
          {decorative ? (
            <p className="mt-1 text-[11px] text-gray-500">
              No heat-transfer coefficient of its own — so this scene shows the
              mass transfer that actually paces the method, and no temperature.
              The panel below says why.
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-gray-500">
              h = {hWm2K} W·m⁻²·K⁻¹ · medium {mediumC} °C
              {metrics.physics.radiantSourceK === undefined
                ? null
                : ` · radiant source ${radiantK} K`}
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
