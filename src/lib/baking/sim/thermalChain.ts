/**
 * Implicit (backward-Euler) step of a chain of thermal masses.
 *
 * Node i has heat capacity Cᵢ, a conductance Gᵢ to node i+1, a conductance
 * Eᵢ to its own environment at temperature Θᵢ, and an explicit source Sᵢ:
 *
 *   Cᵢ (Tᵢ′ − Tᵢ)/Δt = G_{i−1}(T_{i−1}′ − Tᵢ′) + Gᵢ(T_{i+1}′ − Tᵢ′) + Eᵢ(Θᵢ − Tᵢ′) + Sᵢ
 *
 * Every unknown couples only to its neighbours, so the system is tridiagonal
 * and the Thomas algorithm solves it in O(n). Backward Euler is unconditionally
 * stable, which matters here: a metal pan and a 2 mm crust layer sit in the
 * same chain with time constants seconds apart from a loaf's hour.
 *
 * Kept free of anything baking-specific so it can be checked against an exact
 * conduction solution on its own (see the tests).
 *
 * @file src/lib/baking/sim/thermalChain.ts
 */
import { at } from "./strict";

export interface ThermalChain {
  /** J·K⁻¹ per node. */
  capacitance: readonly number[];
  /** W·K⁻¹ between node i and node i+1; length n − 1. */
  link: readonly number[];
  /** W·K⁻¹ from each node to its environment. */
  envConductance: readonly number[];
  /** Environment temperature seen by each node, °C. */
  envC: readonly number[];
  /** Explicit heat source per node, W (negative for a sink). */
  source: readonly number[];
}

/**
 * Solve `a·x[i−1] + b·x[i] + c·x[i+1] = d` for x. `a[0]` and `c[n−1]` are unused.
 * @throws RangeError on a zero pivot, which a diagonally dominant chain never produces.
 */
export function solveTridiagonal(
  a: readonly number[],
  b: readonly number[],
  c: readonly number[],
  d: readonly number[],
): number[] {
  const n = b.length;
  const cPrime: number[] = new Array<number>(n).fill(0);
  const dPrime: number[] = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i += 1) {
    const pivot = at(b, i) - (i > 0 ? at(a, i) * at(cPrime, i - 1) : 0);
    if (pivot === 0 || !Number.isFinite(pivot)) throw new RangeError(`tridiagonal pivot ${pivot} at row ${i}`);
    cPrime[i] = at(c, i) / pivot;
    dPrime[i] = (at(d, i) - (i > 0 ? at(a, i) * at(dPrime, i - 1) : 0)) / pivot;
  }
  const x: number[] = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i -= 1) {
    x[i] = at(dPrime, i) - (i < n - 1 ? at(cPrime, i) * at(x, i + 1) : 0);
  }
  return x;
}

/** Advance the chain by `dtS` seconds; returns the new temperatures. */
export function implicitStep(tempC: readonly number[], chain: ThermalChain, dtS: number): number[] {
  const n = tempC.length;
  const a: number[] = [];
  const b: number[] = [];
  const c: number[] = [];
  const d: number[] = [];
  for (let i = 0; i < n; i += 1) {
    const inertia = at(chain.capacitance, i) / dtS;
    const left = i > 0 ? at(chain.link, i - 1) : 0;
    const right = i < n - 1 ? at(chain.link, i) : 0;
    const env = at(chain.envConductance, i);
    a.push(-left);
    b.push(inertia + left + right + env);
    c.push(-right);
    d.push(inertia * at(tempC, i) + env * at(chain.envC, i) + at(chain.source, i));
  }
  return solveTridiagonal(a, b, c, d);
}

/**
 * Heat that entered the chain from its environments over the step, J — the
 * implicit scheme's own accounting, used by the energy-balance check.
 */
export function environmentHeatJ(newC: readonly number[], chain: ThermalChain, dtS: number): number {
  let total = 0;
  for (let i = 0; i < newC.length; i += 1) {
    total += (at(chain.envConductance, i) * (at(chain.envC, i) - at(newC, i)) + at(chain.source, i)) * dtS;
  }
  return total;
}
