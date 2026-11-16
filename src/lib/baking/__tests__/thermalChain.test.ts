/** @jest-environment node */
import { environmentHeatJ, implicitStep, solveTridiagonal, type ThermalChain } from "@/lib/baking/sim/thermalChain";

/**
 * The chain solver against an EXACT conduction solution: a slab of
 * half-thickness a, uniform T₀, both faces suddenly held at T_s. The centre
 * follows θ/θ₀ = Σ 4(−1)ⁿ/((2n+1)π) · exp(−(2n+1)²π²·Fo/4), Fo = αt/a².
 */
function centreExact(fo: number): number {
  let sum = 0;
  for (let n = 0; n < 60; n += 1) {
    const k = 2 * n + 1;
    sum += ((4 * (n % 2 === 0 ? 1 : -1)) / (k * Math.PI)) * Math.exp((-k * k * Math.PI * Math.PI * fo) / 4);
  }
  return sum;
}

function slab(nodes: number, thickness: number, k: number, rhoCp: number, faceTempC: number): ThermalChain {
  const dx = thickness / nodes;
  const faceG = k / (dx / 2);
  return {
    capacitance: new Array<number>(nodes).fill(rhoCp * dx),
    link: new Array<number>(nodes - 1).fill(k / dx),
    envConductance: Array.from({ length: nodes }, (_, i) => (i === 0 || i === nodes - 1 ? faceG : 0)),
    envC: new Array<number>(nodes).fill(faceTempC),
    source: new Array<number>(nodes).fill(0),
  };
}

describe("implicit thermal chain", () => {
  it("solves a tridiagonal system exactly", () => {
    const x = solveTridiagonal([0, -1, -1], [4, 4, 4], [-1, -1, 0], [3, 2, 3]);
    expect(x.map((v) => Number(v.toFixed(12)))).toEqual([1, 1, 1]);
  });

  it("matches the exact slab centre temperature within 0.5 % of the step", () => {
    const thickness = 0.04;
    const k = 0.5;
    const rhoCp = 1000 * 3000;
    const alpha = k / rhoCp;
    const nodes = 40;
    const chain = slab(nodes, thickness, k, rhoCp, 100);
    let temps = new Array<number>(nodes).fill(20);
    const dt = 0.5;
    const seconds = 1200;
    for (let t = 0; t < seconds; t += dt) temps = implicitStep(temps, chain, dt);
    const centre = ((temps[nodes / 2 - 1] ?? 0) + (temps[nodes / 2] ?? 0)) / 2;
    const fo = (alpha * seconds) / (thickness / 2) ** 2;
    const exact = 100 - 80 * centreExact(fo);
    expect(Math.abs(centre - exact) / 80).toBeLessThan(0.005);
  });

  it("conserves energy: heat in from the faces equals the stored sensible heat", () => {
    const nodes = 20;
    const chain = slab(nodes, 0.02, 0.4, 2.5e6, 150);
    let temps = new Array<number>(nodes).fill(20);
    let heatIn = 0;
    for (let step = 0; step < 300; step += 1) {
      const next = implicitStep(temps, chain, 1);
      heatIn += environmentHeatJ(next, chain, 1);
      temps = next;
    }
    const stored = temps.reduce((s, t, i) => s + (chain.capacitance[i] ?? 0) * (t - 20), 0);
    expect(Math.abs(heatIn - stored) / stored).toBeLessThan(1e-9);
  });
});
