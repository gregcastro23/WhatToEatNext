import type * as THREE from "three";

/**
 * Immutable procedural carcass/cut geometry shared across species rigs.
 *
 * Adapted directly from Pentacles `vessel-shared-geometry.ts`: a lease set per
 * rig root keeps shared GPU buffers alive while mounted, and final disposal
 * disposes every BufferGeometry with zero GPU leaks.
 *
 * @file src/lib/butcher/stage/sharedButcherGeometry.ts
 */

interface SharedEntry {
  readonly geometry: THREE.BufferGeometry;
  leases: number;
}

const entries = new Map<string, SharedEntry>();
const sharedGeometries = new WeakSet<THREE.BufferGeometry>();

export function leaseButcherGeometry(
  owner: Set<string>,
  key: string,
  create: () => THREE.BufferGeometry,
): THREE.BufferGeometry {
  let entry = entries.get(key);
  if (!entry) {
    const geometry = create();
    geometry.name = `SharedButcherGeometry_${key}`;
    entry = { geometry, leases: 0 };
    entries.set(key, entry);
    sharedGeometries.add(geometry);
  }
  if (!owner.has(key)) {
    owner.add(key);
    entry.leases += 1;
  }
  return entry.geometry;
}

export function releaseButcherGeometries(owner: Set<string>): void {
  for (const key of owner) {
    const entry = entries.get(key);
    if (!entry) continue;
    entry.leases -= 1;
    if (entry.leases <= 0) {
      entries.delete(key);
      sharedGeometries.delete(entry.geometry);
      entry.geometry.dispose();
    }
  }
  owner.clear();
}

export function isSharedButcherGeometry(
  geometry: THREE.BufferGeometry | undefined,
): boolean {
  return geometry !== undefined && sharedGeometries.has(geometry);
}

export function sharedButcherGeometryStats(): {
  geometries: number;
  leases: number;
} {
  let leases = 0;
  for (const entry of entries.values()) {
    leases += entry.leases;
  }
  return { geometries: entries.size, leases };
}
