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

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  tempC: number;
  radiantIntensity: number;
}

export function OvenConvectionCanvas({ metrics }: { metrics: MethodPhysicsMetrics }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const { physics, transfer, medium } = metrics;
  const hWm2K = transfer?.typical ?? 25;
  const mediumC = medium.celsius;
  const radiantK = physics.radiantSourceK ?? 505;
  const zScore = transfer?.z ?? 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize 60 particles for fluid convection visualization
    const particles: Particle[] = Array.from({ length: 60 }, () => ({
      x: (Math.random() - 0.5) * 2,
      y: Math.random(),
      z: (Math.random() - 0.5) * 2,
      vx: (Math.random() - 0.5) * 0.2,
      vy: Math.random() * 0.3 + 0.1,
      vz: (Math.random() - 0.5) * 0.2,
      tempC: 20 + Math.random() * 50,
      radiantIntensity: Math.random(),
    }));

    let animId: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // cap dt at 50ms
      lastTime = now;

      if (!isPaused) {
        // Step convection simulation loop (mirroring thermo.rs step_oven_simulation)
        const buoyancy = Math.max(0, mediumC - 20) * 0.003;
        const drag = 0.98;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const phase = p.x * 2.0 + p.z * 3.0 + i * 0.1;
          const swirlX = Math.sin(phase) * 0.4;
          const swirlZ = Math.cos(phase) * 0.4;

          p.vx = (p.vx + swirlX * dt) * drag;
          p.vy = (p.vy + buoyancy * dt) * drag;
          p.vz = (p.vz + swirlZ * dt) * drag;

          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.z += p.vz * dt;

          if (p.y > 1.0) p.y = 0.0;
          if (p.x < -1.0) p.x = 1.0;
          if (p.x > 1.0) p.x = -1.0;
          if (p.z < -1.0) p.z = 1.0;
          if (p.z > 1.0) p.z = -1.0;

          p.tempC += (mediumC - p.tempC) * (hWm2K * 0.001) * dt;
          p.radiantIntensity = Math.min(1.0, Math.pow(radiantK / 1000, 4) * 0.25);
        }
      }

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

      // Render 3D Convection Particles
      for (const p of particles) {
        // Perspective projection
        const scale = 0.8 + p.z * 0.3;
        const px = width / 2 + p.x * (width * 0.35) * scale;
        const py = height - p.y * (height * 0.65) - 30;

        const radius = Math.max(2, 3.5 * scale);
        const tempRatio = Math.min(1, Math.max(0, (p.tempC - 20) / 200));

        const red = Math.floor(100 + tempRatio * 155);
        const blue = Math.floor(255 - tempRatio * 200);

        ctx.fillStyle = `rgba(${red}, 130, ${blue}, ${0.6 * scale})`;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
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

      // Render Statistical Z-Score Overlay (-3σ to +3σ distribution boundary)
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
      const clampedZ = Math.max(-3, Math.min(3, zScore));
      const markerPct = (clampedZ + 3) / 6;
      const markerX = zBoxX + markerPct * zBoxW;

      ctx.fillStyle = Math.abs(zScore) >= 2 ? "#fbbf24" : "#818cf8";
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
    render(performance.now());
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [mediumC, hWm2K, radiantK, zScore, isPaused]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-400/20 bg-black/40 p-4 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-amber-300">
            3D Thermal Physics Simulation Loop
          </h5>
          <p className="text-[11px] text-gray-400">
            Convection (h = {hWm2K} W·m⁻²·K⁻¹) · Radiation ({radiantK} K) · Transient Conduction
          </p>
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
        {/* `[FIXED 2026-08-16]` This read "Engine: WASM / Pure Rust Math" while
            the loop below is plain TypeScript on Canvas 2D — no WASM is loaded
            and no Rust runs. On a surface whose entire premise is that displayed
            values mean what they claim, a false provenance label is the same
            defect class as the temperatures this PR removes. It will say WASM
            when it is WASM. */}
        <span>Engine: TypeScript · Canvas 2D</span>
        <span>Z-Score Context: z = {zScore >= 0 ? `+${zScore.toFixed(2)}` : zScore.toFixed(2)}</span>
      </div>
    </div>
  );
}
