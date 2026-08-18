/**
 * Canvas 2D drawing for the ten cooking-method heat-flow scenes.
 *
 * Split out of `OvenConvectionCanvas.tsx` so the component keeps the engine
 * lifecycle and this file keeps the ink. Everything here is pure: it takes a
 * context, a size, the scene inputs and a clock, and draws. No state, no
 * physics — see the header of `methodScenes.ts` for why that division matters.
 *
 * Each `drawChamber` case is written to be recognisable in SILHOUETTE. That is
 * the actual requirement: a cook glancing at the panel should know they are
 * looking at a pot rather than an oven before reading a single label, and the
 * ten scenes were checked against each other for exactly that.
 *
 * @file src/components/cooking-methods/methodSceneRenderer.ts
 */

import { HeatRegime, FLOATS_PER_PARTICLE } from "@/lib/wasm/thermoEngine";
import {
  foodPalette,
  heatFlux,
  SCENE_THEMES,
  type SceneInputs,
  type SceneTheme,
} from "./methodScenes";

/** Geometry the scene parts agree on, in device pixels. */
export interface Layout {
  w: number;
  h: number;
  /** Food slab. */
  foodX: number;
  foodY: number;
  foodW: number;
  foodH: number;
  /** Fill surface line, or null for a gas-filled chamber. */
  fillY: number | null;
}

export function layoutFor(w: number, h: number, theme: SceneTheme): Layout {
  const foodW = w * 0.34;
  const foodH = Math.max(18, h * 0.13);
  return {
    w,
    h,
    foodW,
    foodH,
    foodX: (w - foodW) / 2,
    foodY: h * theme.foodYFrac - foodH / 2,
    fillY: theme.fill === null ? null : h * theme.fillTopFrac,
  };
}

/** Rounded rect that works without `roundRect` on older canvas implementations. */
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

/** A single arrow, used for every heat-direction annotation. */
function arrow(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number },
  dir: { dx: number; dy: number },
  len: number,
  color: string,
  width = 1.5,
): void {
  const { x, y } = at;
  const { dx, dy } = dir;
  const ex = x + dx * len;
  const ey = y + dy * len;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  const head = Math.max(3, len * 0.22);
  // Perpendicular, for the two barbs.
  const px = -dy;
  const py = dx;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - dx * head + px * head * 0.55, ey - dy * head + py * head * 0.55);
  ctx.lineTo(ex - dx * head - px * head * 0.55, ey - dy * head - py * head * 0.55);
  ctx.closePath();
  ctx.fill();
}

/** Background wash, common to every scene. */
function drawBackground(ctx: CanvasRenderingContext2D, l: Layout, theme: SceneTheme): void {
  const g = ctx.createLinearGradient(0, 0, 0, l.h);
  g.addColorStop(0, theme.bg[0]);
  g.addColorStop(0.5, theme.bg[1]);
  g.addColorStop(1, theme.bg[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, l.w, l.h);
}

/** Where a vessel's walls are, shared by the fill and the outline. */
export interface VesselShape {
  top: number;
  bottom: number;
  /** Horizontal splay of the sides, for a fry pan. */
  slope: number;
  lid: boolean;
}

/** The vessel interior, as a closed path ready to clip or stroke. */
function vesselPath(ctx: CanvasRenderingContext2D, l: Layout, v: VesselShape): void {
  const inset = l.w * 0.08;
  const bx = inset + v.slope;
  ctx.beginPath();
  ctx.moveTo(inset, v.top);
  ctx.lineTo(bx, v.bottom);
  ctx.lineTo(l.w - bx, v.bottom);
  ctx.lineTo(l.w - inset, v.top);
  ctx.closePath();
}

/**
 * The liquid or fat the food sits in, with a legible surface line.
 *
 * CLIPPED to the vessel. The first version filled the full canvas width below
 * the surface line, which drew oil and water straight through the pan walls and
 * out into the room — a picture of a spill, not of a fry.
 */
function drawFill(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  theme: SceneTheme,
  v: VesselShape,
  now: number,
): void {
  if (l.fillY === null || theme.fill === null) return;
  ctx.save();
  vesselPath(ctx, l, v);
  ctx.clip();
  ctx.fillStyle = theme.fill;
  ctx.fillRect(0, l.fillY, l.w, l.h - l.fillY);

  // A moving surface, because a dead-flat line reads as a solid.
  ctx.strokeStyle = theme.tracerHot;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  for (let x = 0; x <= l.w; x += 4) {
    const y = l.fillY + Math.sin(x * 0.05 + now * 0.0022) * 2.2;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();
}

/** A gas burner, for the scenes heated from underneath. */
function drawBurner(ctx: CanvasRenderingContext2D, l: Layout, color: string, now: number): void {
  const baseY = l.h - 6;
  const flames = 9;
  for (let i = 0; i < flames; i += 1) {
    const x = (l.w / (flames + 1)) * (i + 1);
    const wobble = Math.sin(now * 0.008 + i * 1.7) * 0.25 + 1;
    const height = 11 * wobble;
    const g = ctx.createLinearGradient(x, baseY, x, baseY - height);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(56, 189, 248, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - 3.5, baseY);
    ctx.quadraticCurveTo(x, baseY - height, x + 3.5, baseY);
    ctx.closePath();
    ctx.fill();
  }
}

/** Pot / pan / tank walls. `slope` splays the sides outward for a fry pan. */
function drawVessel(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  theme: SceneTheme,
  opts: VesselShape,
): void {
  const inset = l.w * 0.08;
  ctx.strokeStyle = theme.vessel;
  ctx.lineWidth = 2.5;
  // Walls and base only — the open top is what makes a pot read as a pot.
  const bx = inset + opts.slope;
  ctx.beginPath();
  ctx.moveTo(inset, opts.top);
  ctx.lineTo(bx, opts.bottom);
  ctx.lineTo(l.w - bx, opts.bottom);
  ctx.lineTo(l.w - inset, opts.top);
  ctx.stroke();

  if (opts.lid) {
    ctx.beginPath();
    ctx.moveTo(inset - 6, opts.top);
    ctx.lineTo(l.w - inset + 6, opts.top);
    ctx.stroke();
    // Knob.
    ctx.beginPath();
    ctx.arc(l.w / 2, opts.top - 5, 4, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/**
 * The food, coloured from its own method's physics.
 *
 * The crust ring is drawn ONLY when {@link foodPalette} says browning is
 * reachable. That gate is the whole point — see the note on `foodPalette`.
 */
function drawFood(ctx: CanvasRenderingContext2D, l: Layout, inputs: SceneInputs): void {
  const pal = foodPalette(inputs);
  const cx = l.foodX + l.foodW / 2;
  const cy = l.foodY + l.foodH / 2;

  const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, l.foodW / 2);
  g.addColorStop(0, pal.core);
  g.addColorStop(0.6, pal.mid);
  g.addColorStop(1, pal.crust);
  ctx.fillStyle = g;
  roundedRect(ctx, l.foodX, l.foodY, l.foodW, l.foodH, 6);
  ctx.fill();

  if (pal.browned) {
    // A distinct seared rim, present only where the surface can actually reach
    // the Maillard threshold.
    ctx.strokeStyle = "rgba(120, 53, 15, 0.95)";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ============================================================================
// Per-regime chambers
// ============================================================================

function drawOvenChamber(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  theme: SceneTheme,
  now: number,
): void {
  // Two elements and a wire rack: an oven, not a pot.
  ctx.fillStyle = theme.source;
  ctx.shadowColor = theme.source;
  ctx.shadowBlur = 12;
  ctx.fillRect(l.w * 0.08, 10, l.w * 0.84, 4);
  ctx.globalAlpha = 0.55;
  ctx.fillRect(l.w * 0.08, l.h - 16, l.w * 0.84, 4);
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // Chamber walls.
  ctx.strokeStyle = theme.vessel;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(l.w * 0.05, 6, l.w * 0.9, l.h - 14);

  // Wire rack under the food.
  const rackY = l.foodY + l.foodH + 3;
  ctx.strokeStyle = "rgba(203, 213, 225, 0.45)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = l.w * 0.2; x <= l.w * 0.8; x += 9) {
    ctx.moveTo(x, rackY);
    ctx.lineTo(x, rackY + 4);
  }
  ctx.moveTo(l.w * 0.2, rackY);
  ctx.lineTo(l.w * 0.8, rackY);
  ctx.stroke();

  // The enclosure radiates from every wall — the honest picture of
  // `radiantGeometry: "surrounding"`.
  ctx.globalAlpha = 0.35 + Math.sin(now * 0.003) * 0.08;
  ctx.strokeStyle = theme.source;
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i += 1) {
    const y = 24 + i * ((l.h - 48) / 5);
    ctx.beginPath();
    ctx.moveTo(l.w * 0.07, y);
    ctx.lineTo(l.w * 0.17, y);
    ctx.moveTo(l.w * 0.83, y);
    ctx.lineTo(l.w * 0.93, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawPan(ctx: CanvasRenderingContext2D, l: Layout, theme: SceneTheme, now: number): void {
  const shape: VesselShape = { top: l.h * 0.3, bottom: l.h - 14, slope: l.w * 0.05, lid: false };
  const { top } = shape;
  drawFill(ctx, l, theme, shape, now);
  drawVessel(ctx, l, theme, shape);
  // Handle, to break the pot silhouette.
  ctx.strokeStyle = theme.vessel;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(l.w * 0.92, top + 4);
  ctx.lineTo(l.w * 0.99, top - 4);
  ctx.stroke();
  drawBurner(ctx, l, theme.source, now);
}

function drawPot(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  theme: SceneTheme,
  now: number,
  lid: boolean,
): void {
  const shape: VesselShape = { top: l.h * 0.16, bottom: l.h - 14, slope: 0, lid };
  drawFill(ctx, l, theme, shape, now);
  drawVessel(ctx, l, theme, shape);
  drawBurner(ctx, l, theme.source, now);
}

function drawSteamer(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  theme: SceneTheme,
  inputs: SceneInputs,
  now: number,
): void {
  drawPot(ctx, l, theme, now, true);

  // Perforated rack holding the food clear of the water.
  const rackY = l.foodY + l.foodH + 4;
  ctx.strokeStyle = "rgba(203, 213, 225, 0.55)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(l.w * 0.16, rackY);
  ctx.lineTo(l.w * 0.84, rackY);
  ctx.stroke();
  ctx.lineWidth = 1;
  for (let x = l.w * 0.2; x <= l.w * 0.8; x += 12) {
    ctx.beginPath();
    ctx.moveTo(x, rackY);
    ctx.lineTo(x, rackY + 5);
    ctx.stroke();
  }

  if (inputs.sealed) {
    // A pressure vessel is a different object from a covered pot, and the
    // difference is the entire reason `pressure_cooking` beats `steaming`.
    ctx.strokeStyle = theme.tracerHot;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(l.w / 2, l.h * 0.16 - 12, 6, 0, Math.PI * 2);
    ctx.stroke();
    const sweep = -Math.PI / 2 + Math.sin(now * 0.004) * 0.5 + 0.7;
    ctx.beginPath();
    ctx.moveTo(l.w / 2, l.h * 0.16 - 12);
    ctx.lineTo(l.w / 2 + Math.cos(sweep) * 4.5, l.h * 0.16 - 12 + Math.sin(sweep) * 4.5);
    ctx.stroke();
  }
}

function drawBath(ctx: CanvasRenderingContext2D, l: Layout, theme: SceneTheme, now: number): void {
  const shape: VesselShape = { top: l.h * 0.12, bottom: l.h - 12, slope: 0, lid: false };
  drawFill(ctx, l, theme, shape, now);
  drawVessel(ctx, l, theme, shape);

  // Immersion circulator on the right wall — the thing that makes the bath a
  // bath rather than a pot of warm water.
  const cx = l.w * 0.85;
  ctx.strokeStyle = theme.vessel;
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 8, l.h * 0.1, 16, l.h * 0.4);
  ctx.fillStyle = theme.source;
  ctx.globalAlpha = 0.5 + Math.sin(now * 0.006) * 0.2;
  ctx.fillRect(cx - 5, l.h * 0.44, 10, 5);
  ctx.globalAlpha = 1;

  // The food is in a sealed pouch. `moistureFlux: "held"` is exactly this.
  ctx.strokeStyle = "rgba(226, 232, 240, 0.5)";
  ctx.lineWidth = 1.25;
  roundedRect(ctx, l.foodX - 7, l.foodY - 6, l.foodW + 14, l.foodH + 12, 5);
  ctx.stroke();
}

function drawRadiantFire(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  theme: SceneTheme,
  inputs: SceneInputs,
  now: number,
): void {
  const fromAbove = inputs.radiantGeometry === "above";
  const sourceY = fromAbove ? 14 : l.h - 14;
  const dir = fromAbove ? 1 : -1;

  // The glowing bars.
  const bars = 7;
  for (let i = 0; i < bars; i += 1) {
    const x = (l.w / (bars + 1)) * (i + 1);
    const pulse = 0.75 + Math.sin(now * 0.004 + i * 0.9) * 0.25;
    ctx.fillStyle = theme.source;
    ctx.globalAlpha = pulse;
    ctx.shadowColor = theme.source;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.ellipse(x, sourceY, l.w * 0.045, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;

  // Straight-line flux to the food. Radiation does not curve, and drawing it
  // curved was part of why grilling and roasting looked alike.
  const targetY = fromAbove ? l.foodY : l.foodY + l.foodH;
  for (let i = 0; i < bars; i += 1) {
    const x = (l.w / (bars + 1)) * (i + 1);
    const g = ctx.createLinearGradient(x, sourceY, x, targetY);
    g.addColorStop(0, "rgba(251, 191, 36, 0.75)");
    g.addColorStop(1, "rgba(251, 191, 36, 0.05)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.75;
    ctx.beginPath();
    ctx.moveTo(x, sourceY + dir * 5);
    ctx.lineTo(x, targetY);
    ctx.stroke();
  }

  // The shadowed face is NOT drawn here — see `drawOverlay`. Drawing it in the
  // chamber pass put it underneath the food, where it was invisible: the whole
  // grill-versus-broiler distinction was being painted and then covered up.
}

function drawPlancha(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  theme: SceneTheme,
  now: number,
): void {
  const plateY = l.foodY + l.foodH;
  // A thick solid plate — mass is the point of this method.
  const g = ctx.createLinearGradient(0, plateY, 0, l.h);
  g.addColorStop(0, "#78716c");
  g.addColorStop(1, "#292524");
  ctx.fillStyle = g;
  ctx.fillRect(l.w * 0.08, plateY, l.w * 0.84, l.h - plateY - 8);
  ctx.strokeStyle = theme.vessel;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(l.w * 0.08, plateY, l.w * 0.84, l.h - plateY - 8);

  // The isotherm bands that march up into the food live in `drawOverlay` —
  // they are inside the food, so drawing them here would put them underneath it.

  // The heated underside of the plate.
  ctx.fillStyle = theme.source;
  ctx.globalAlpha = 0.6 + Math.sin(now * 0.005) * 0.15;
  ctx.fillRect(l.w * 0.08, l.h - 10, l.w * 0.84, 3);
  ctx.globalAlpha = 1;
}

function drawDewar(ctx: CanvasRenderingContext2D, l: Layout, theme: SceneTheme, now: number): void {
  // Cold vapour pools at the BOTTOM, because it is denser than the room.
  const shape: VesselShape = { top: l.h * 0.1, bottom: l.h - 12, slope: 0, lid: false };
  drawFill(ctx, l, theme, shape, now);
  drawVessel(ctx, l, theme, shape);

  // Frost rime creeping over the food.
  ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 10; i += 1) {
    const x = l.foodX + (l.foodW / 10) * (i + 0.5);
    const len = 3 + ((i * 7 + Math.floor(now * 0.002)) % 4);
    ctx.beginPath();
    ctx.moveTo(x, l.foodY);
    ctx.lineTo(x, l.foodY - len);
    ctx.stroke();
  }

  // No heating element anywhere. There is nothing hot in this scene, and the
  // old renderer's amber rod over a −196 °C bath was the loudest single thing
  // wrong with the panel.
}

function drawJar(ctx: CanvasRenderingContext2D, l: Layout, theme: SceneTheme, now: number): void {
  drawFill(ctx, l, theme, { top: l.h * 0.26, bottom: l.h - 12, slope: 0, lid: false }, now);
  // A jar: narrow neck, wide body, no burner and no element.
  ctx.strokeStyle = theme.vessel;
  ctx.lineWidth = 2.5;
  const neck = l.w * 0.3;
  ctx.beginPath();
  ctx.moveTo(l.w / 2 - neck / 2, 12);
  ctx.lineTo(l.w / 2 - neck / 2, l.h * 0.16);
  ctx.lineTo(l.w * 0.12, l.h * 0.26);
  ctx.lineTo(l.w * 0.12, l.h - 12);
  ctx.lineTo(l.w * 0.88, l.h - 12);
  ctx.lineTo(l.w * 0.88, l.h * 0.26);
  ctx.lineTo(l.w / 2 + neck / 2, l.h * 0.16);
  ctx.lineTo(l.w / 2 + neck / 2, 12);
  ctx.stroke();

  // The food's boundary is the interesting surface here, so it is drawn as a
  // permeable dashed edge rather than a crust.
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = "rgba(199, 210, 254, 0.75)";
  ctx.lineWidth = 1.25;
  roundedRect(ctx, l.foodX - 4, l.foodY - 4, l.foodW + 8, l.foodH + 8, 5);
  ctx.stroke();
  ctx.setLineDash([]);
  void now;
}

function drawStill(ctx: CanvasRenderingContext2D, l: Layout, theme: SceneTheme, now: number): void {
  // The boiler is a rectangle in the left half, not a trapezoid, so it gets its
  // own clip rather than being forced through `drawFill`'s vessel shape — a
  // negative slope there produces an hourglass, which is not a still.
  if (l.fillY !== null && theme.fill !== null) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(l.w * 0.1, l.h * 0.62, l.w * 0.4, l.h - 12 - l.h * 0.62);
    ctx.clip();
    ctx.fillStyle = theme.fill;
    ctx.fillRect(0, l.fillY, l.w, l.h);
    ctx.strokeStyle = theme.tracerHot;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    for (let x = 0; x <= l.w; x += 4) {
      const y = l.fillY + Math.sin(x * 0.05 + now * 0.0022) * 2;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  ctx.strokeStyle = theme.vessel;
  ctx.lineWidth = 2.5;

  // Boiler.
  const boilerTop = l.h * 0.62;
  ctx.beginPath();
  ctx.moveTo(l.w * 0.1, boilerTop);
  ctx.lineTo(l.w * 0.1, l.h - 12);
  ctx.lineTo(l.w * 0.5, l.h - 12);
  ctx.lineTo(l.w * 0.5, boilerTop);
  ctx.stroke();

  // Swan neck up and across to the condenser.
  ctx.beginPath();
  ctx.moveTo(l.w * 0.3, boilerTop);
  ctx.lineTo(l.w * 0.3, l.h * 0.16);
  ctx.quadraticCurveTo(l.w * 0.3, l.h * 0.08, l.w * 0.45, l.h * 0.08);
  ctx.lineTo(l.w * 0.72, l.h * 0.08);
  ctx.stroke();

  // Condenser coil: the cold surface the vapour is travelling toward.
  ctx.strokeStyle = theme.tracerHot;
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    const y = l.h * 0.16 + i * 11;
    ctx.beginPath();
    ctx.ellipse(l.w * 0.78, y, 16, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Collection spout.
  ctx.strokeStyle = theme.vessel;
  ctx.beginPath();
  ctx.moveTo(l.w * 0.78, l.h * 0.16 + 5 * 11);
  ctx.lineTo(l.w * 0.78, l.h - 22);
  ctx.stroke();

  drawBurner(ctx, l, theme.source, now);
}

/** The vessel, source and fixtures for one regime. */
export function drawChamber(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  inputs: SceneInputs,
  theme: SceneTheme,
  now: number,
): void {
  drawBackground(ctx, l, theme);
  switch (inputs.regime) {
    case HeatRegime.BuoyantAir:
      drawOvenChamber(ctx, l, theme, now);
      break;
    case HeatRegime.Oil:
      drawPan(ctx, l, theme, now);
      break;
    case HeatRegime.RollingBoil:
      drawPot(ctx, l, theme, now, false);
      break;
    case HeatRegime.CondensingSteam:
      drawSteamer(ctx, l, theme, inputs, now);
      break;
    case HeatRegime.StillLiquid:
      drawBath(ctx, l, theme, now);
      break;
    case HeatRegime.Radiant:
      drawRadiantFire(ctx, l, theme, inputs, now);
      break;
    case HeatRegime.SolidContact:
      drawPlancha(ctx, l, theme, now);
      break;
    case HeatRegime.Cryogenic:
      drawDewar(ctx, l, theme, now);
      break;
    case HeatRegime.Diffusion:
      drawJar(ctx, l, theme, now);
      break;
    case HeatRegime.Distillation:
      drawStill(ctx, l, theme, now);
      break;
  }
}

/**
 * The particle field, drawn as whatever the regime's tracers physically are.
 *
 * `phaseFrac` comes out of the shared simulation, so a bubble is a bubble in
 * both runtimes. Deriving "is this one a bubble" here instead would put the
 * distinction in the renderer where the two engines could disagree about it —
 * the drift `thermo-core` exists to prevent.
 */
export function drawParticles(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  particles: Float32Array,
  inputs: SceneInputs,
  theme: SceneTheme,
): void {
  const nucleating =
    inputs.regime === HeatRegime.RollingBoil ||
    inputs.regime === HeatRegime.Oil ||
    inputs.regime === HeatRegime.CondensingSteam ||
    inputs.regime === HeatRegime.Cryogenic ||
    inputs.regime === HeatRegime.Distillation ||
    inputs.regime === HeatRegime.SolidContact;

  for (let o = 0; o + FLOATS_PER_PARTICLE <= particles.length; o += FLOATS_PER_PARTICLE) {
    const x = particles[o];
    const y = particles[o + 1];
    const z = particles[o + 2];
    const tempC = particles[o + 6];
    const phaseFrac = particles[o + 8];

    const scale = 0.8 + z * 0.3;
    const px = l.w / 2 + x * (l.w * 0.35) * scale;
    const py = l.h - y * (l.h * 0.65) - 24;

    if (nucleating && phaseFrac > 0.35) {
      // A bubble or a droplet: hollow, growing with its phase fraction.
      const r = Math.max(1.5, (1.5 + phaseFrac * 3.2) * scale);
      ctx.strokeStyle = theme.phase;
      ctx.globalAlpha = 0.35 + phaseFrac * 0.5;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      continue;
    }

    if (inputs.regime === HeatRegime.Diffusion) {
      // Solute, not heat. No temperature colouring at all — this method has no
      // temperature story, and colouring these by `tempC` would invent one.
      ctx.fillStyle = theme.phase;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(px, py, 1.8 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      continue;
    }

    // A convection tracer, coloured by how far it has equilibrated with the
    // medium. The span is the method's OWN span, so a 60 °C bath does not use
    // the same ramp as a 260 °C grill.
    const lo = Math.min(20, inputs.mediumC);
    const hi = Math.max(21, inputs.mediumC);
    const t = Math.min(1, Math.max(0, (tempC - lo) / (hi - lo)));
    ctx.fillStyle = mix(theme.tracerCold, theme.tracerHot, t);
    ctx.globalAlpha = 0.55 * scale;
    ctx.beginPath();
    ctx.arc(px, py, Math.max(1.6, 3.1 * scale), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

/** Linear blend between two `#rrggbb` colours. */
function mix(a: string, b: string, t: number): string {
  const pa = parseHex(a);
  const pb = parseHex(b);
  if (!pa || !pb) return b;
  const c = (i: number) => Math.round(pa[i] + (pb[i] - pa[i]) * t);
  return `rgb(${c(0)}, ${c(1)}, ${c(2)})`;
}

function parseHex(v: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{6})$/i.exec(v.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Heat-direction arrows around the food, plus the food itself. */
export function drawFoodAndFlux(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  inputs: SceneInputs,
  theme: SceneTheme,
): void {
  const flux = heatFlux(inputs);

  if (flux) {
    const len = Math.max(10, l.h * 0.075);
    // Arrows sit on the face the heat actually arrives at (or leaves from).
    const y =
      flux.dy > 0 ? l.foodY - len - 4 : l.foodY + l.foodH + len + 4;
    ctx.globalAlpha = 0.8;
    for (let i = 0; i < 3; i += 1) {
      const x = l.foodX + (l.foodW / 4) * (i + 1);
      arrow(ctx, { x, y }, { dx: 0, dy: flux.dy }, len, theme.source, 1.6);
    }
    ctx.globalAlpha = 1;
  }

  drawFood(ctx, l, inputs);
}

/** Caption strip: what the scene is, and where the heat is going. */
export function drawCaption(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  inputs: SceneInputs,
): void {
  const pal = foodPalette(inputs);
  const flux = heatFlux(inputs);
  // Both captions live along the TOP edge. The bottom belongs to the z-score
  // axis the panel already drew there, and a surface note overlapping a
  // significance marker would make two true statements illegible at once.
  // STACKED, not side by side. Both strings are full sentences and at 480 px
  // they ran into each other — "Latent heat onto the surfaceSurface wet and
  // pinned near boiling" was one unreadable line on the steaming scene.
  ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
  if (flux) {
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
    ctx.fillText(flux.label, 8, 14);
  }
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(226, 232, 240, 0.72)";
  ctx.fillText(pal.surfaceNote, 8, flux ? 26 : 14);
}

/**
 * Everything that must sit ON TOP of the food.
 *
 * A separate pass because the food is opaque: anything describing what is
 * happening AT its surface — a shadowed face, condensate landing on it — has to
 * be drawn after it or it is simply not there.
 */
export function drawOverlay(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  inputs: SceneInputs,
  theme: SceneTheme,
  now: number,
): void {
  if (inputs.regime === HeatRegime.Radiant) {
    // A lit face and a dark face is what line-of-sight MEANS, and it is the
    // clearest single difference between a grill (lit from below) and a broiler
    // (lit from above).
    const fromAbove = inputs.radiantGeometry === "above";
    const shadeY = fromAbove ? l.foodY + l.foodH * 0.5 : l.foodY;
    ctx.save();
    roundedRect(ctx, l.foodX, l.foodY, l.foodW, l.foodH, 6);
    ctx.clip();
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(l.foodX, shadeY, l.foodW, l.foodH * 0.5);
    ctx.restore();
    return;
  }

  if (inputs.regime === HeatRegime.SolidContact) {
    // The conduction front, marching up from the contact face. This scene has
    // nothing else in motion — a plancha has no convection story — so if the
    // front is invisible the panel is a static picture of a pan.
    const bands = 5;
    ctx.save();
    roundedRect(ctx, l.foodX, l.foodY, l.foodW, l.foodH, 6);
    ctx.clip();
    for (let i = 0; i < bands; i += 1) {
      const travel = (now * 0.00022 + i / bands) % 1;
      const y = l.foodY + l.foodH - travel * l.foodH;
      ctx.strokeStyle = theme.tracerHot;
      ctx.globalAlpha = 0.7 * (1 - travel);
      ctx.lineWidth = 2.25;
      ctx.beginPath();
      ctx.moveTo(l.foodX, y);
      ctx.lineTo(l.foodX + l.foodW, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    return;
  }

  if (inputs.regime === HeatRegime.CondensingSteam) {
    // Condensate ON the food. Steaming's h ≈ 9000 — three times a rolling
    // boil's — is earned by this transition happening at the food surface, so
    // the surface is where it has to be visible.
    const drops = 7;
    for (let i = 0; i < drops; i += 1) {
      const x = l.foodX + (l.foodW / (drops + 1)) * (i + 1);
      const t = ((now * 0.00035 + i * 0.17) % 1);
      const y = l.foodY + t * l.foodH;
      ctx.fillStyle = theme.phase;
      ctx.globalAlpha = 0.85 * (1 - t * 0.6);
      ctx.beginPath();
      ctx.arc(x, y, 1.7 + t * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    return;
  }

  if (inputs.regime === HeatRegime.Diffusion) {
    // Solute crossing the boundary, in the direction the method actually moves
    // it. `curing` drives water OUT; `marinating` and `pickling` drive solute
    // IN, and drawing both the same way would erase the only distinction these
    // five methods have.
    const outward = inputs.moistureFlux === "out-of-food";
    const marks = 6;
    for (let i = 0; i < marks; i += 1) {
      const x = l.foodX + (l.foodW / (marks + 1)) * (i + 1);
      const t = ((now * 0.0004 + i * 0.19) % 1);
      const span = 12;
      const y = outward ? l.foodY - t * span : l.foodY - (1 - t) * span;
      ctx.fillStyle = theme.phase;
      ctx.globalAlpha = 0.75 * (1 - Math.abs(t - 0.5) * 1.2);
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

/** Draw one complete frame. */
export function drawScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  inputs: SceneInputs,
  particles: Float32Array | null,
  now: number,
): void {
  const theme = SCENE_THEMES[inputs.regime];
  const l = layoutFor(w, h, theme);
  ctx.clearRect(0, 0, w, h);
  drawChamber(ctx, l, inputs, theme, now);
  if (particles) drawParticles(ctx, l, particles, inputs, theme);
  drawFoodAndFlux(ctx, l, inputs, theme);
  drawOverlay(ctx, l, inputs, theme, now);
  drawCaption(ctx, l, inputs);
}
