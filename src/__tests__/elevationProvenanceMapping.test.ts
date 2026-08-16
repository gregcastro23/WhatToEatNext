/**
 * Unit tests for bidirectional elevation provenance / basis mapping.
 *
 * Validates:
 * - Spacetime ElevationProvenance -> Postgres elevation_basis
 * - Postgres elevation_basis -> Spacetime ElevationProvenance
 * - Round-trip consistency
 * - ABSENT / null absence handling
 * - Case-insensitivity and normalize-on-read resilience
 *
 * @file src/__tests__/elevationProvenanceMapping.test.ts
 */

import {
  provenanceToElevationBasis,
  elevationBasisToProvenance,
  normaliseToElevationBasis,
  type PostgresElevationBasis,
} from '@/lib/environment/elevationProvenance';
import type { ElevationProvenance } from '@/hooks/useEnvironmentalObservation';

describe('elevation vocabulary reconciliation', () => {
  describe('provenanceToElevationBasis (Spacetime -> Postgres)', () => {
    it('maps gps to MEASURED', () => {
      expect(provenanceToElevationBasis('gps')).toBe('MEASURED');
    });

    it('maps user to MEASURED', () => {
      expect(provenanceToElevationBasis('user')).toBe('MEASURED');
    });

    it('maps dem to DERIVED', () => {
      expect(provenanceToElevationBasis('dem')).toBe('DERIVED');
    });

    it('maps ip to COMPUTED', () => {
      expect(provenanceToElevationBasis('ip')).toBe('COMPUTED');
    });

    it('maps null/undefined to ABSENT', () => {
      expect(provenanceToElevationBasis(null)).toBe('ABSENT');
      expect(provenanceToElevationBasis(undefined)).toBe('ABSENT');
    });

    it('normalizes case on input', () => {
      expect(provenanceToElevationBasis('GPS' as ElevationProvenance)).toBe('MEASURED');
      expect(provenanceToElevationBasis('Dem' as ElevationProvenance)).toBe('DERIVED');
      expect(provenanceToElevationBasis('Ip' as ElevationProvenance)).toBe('COMPUTED');
    });
  });

  describe('elevationBasisToProvenance (Postgres -> Spacetime)', () => {
    it('maps MEASURED to gps by default', () => {
      expect(elevationBasisToProvenance('MEASURED')).toBe('gps');
    });

    it('maps MEASURED to user when preferUser option is set', () => {
      expect(elevationBasisToProvenance('MEASURED', { preferUser: true })).toBe('user');
    });

    it('maps DERIVED to dem', () => {
      expect(elevationBasisToProvenance('DERIVED')).toBe('dem');
    });

    it('maps COMPUTED to ip', () => {
      expect(elevationBasisToProvenance('COMPUTED')).toBe('ip');
    });

    it('maps ABSENT to null (absence in Spacetime)', () => {
      expect(elevationBasisToProvenance('ABSENT')).toBeNull();
      expect(elevationBasisToProvenance(null)).toBeNull();
      expect(elevationBasisToProvenance(undefined)).toBeNull();
    });

    it('normalizes on read with case and whitespace resilience', () => {
      expect(elevationBasisToProvenance('  measured  ')).toBe('gps');
      expect(elevationBasisToProvenance('derived')).toBe('dem');
      expect(elevationBasisToProvenance('computed')).toBe('ip');
      expect(elevationBasisToProvenance('absent')).toBeNull();
    });

    it('falls back conservatively to ip for unknown spellings', () => {
      expect(elevationBasisToProvenance('UNKNOWN_SOURCE')).toBe('ip');
    });
  });

  describe('round-trip fidelity', () => {
    it('round-trips dem <-> DERIVED', () => {
      const basis = provenanceToElevationBasis('dem');
      expect(basis).toBe('DERIVED');
      expect(elevationBasisToProvenance(basis)).toBe('dem');
    });

    it('round-trips ip <-> COMPUTED', () => {
      const basis = provenanceToElevationBasis('ip');
      expect(basis).toBe('COMPUTED');
      expect(elevationBasisToProvenance(basis)).toBe('ip');
    });

    it('round-trips gps -> MEASURED -> gps', () => {
      const basis = provenanceToElevationBasis('gps');
      expect(basis).toBe('MEASURED');
      expect(elevationBasisToProvenance(basis)).toBe('gps');
    });

    it('round-trips user -> MEASURED -> user with preferUser option', () => {
      const basis = provenanceToElevationBasis('user');
      expect(basis).toBe('MEASURED');
      expect(elevationBasisToProvenance(basis, { preferUser: true })).toBe('user');
    });

    it('round-trips null <-> ABSENT', () => {
      const basis = provenanceToElevationBasis(null);
      expect(basis).toBe('ABSENT');
      expect(elevationBasisToProvenance(basis)).toBeNull();
    });
  });
});

describe('normaliseToElevationBasis — the silent-downgrade guard', () => {
  it('the one-way mapper really does downgrade a Postgres basis', () => {
    // The CONTROL. Everything below is only meaningful because this is true:
    // `provenanceToElevationBasis` understands the Spacetime spellings only and
    // falls through to 'COMPUTED' for anything else, including values that were
    // already correct. If this ever stops being true, the guard is redundant
    // and this whole describe block should be re-examined rather than trusted.
    expect(provenanceToElevationBasis('MEASURED' as never)).toBe('COMPUTED');
    expect(provenanceToElevationBasis('DERIVED' as never)).toBe('COMPUTED');
  });

  it('passes an already-correct Postgres basis through untouched', () => {
    // `/api/environment/lookup` returns `elevationBasis: 'DERIVED'`, so a
    // round-trip through "save my kitchen settings" used to re-record a
    // model-derived elevation as a guessed one.
    for (const basis of ['MEASURED', 'DERIVED', 'COMPUTED', 'ABSENT'] as const) {
      expect(normaliseToElevationBasis(basis)).toBe(basis);
    }
  });

  it('still accepts the Spacetime vocabulary', () => {
    expect(normaliseToElevationBasis('gps')).toBe('MEASURED');
    expect(normaliseToElevationBasis('user')).toBe('MEASURED');
    expect(normaliseToElevationBasis('dem')).toBe('DERIVED');
    expect(normaliseToElevationBasis('ip')).toBe('COMPUTED');
  });

  it('is case- and whitespace-insensitive in both vocabularies', () => {
    expect(normaliseToElevationBasis('  measured ')).toBe('MEASURED');
    expect(normaliseToElevationBasis('GPS')).toBe('MEASURED');
  });

  it('refuses an unrecognised value instead of guessing', () => {
    // Returning 'COMPUTED' for junk would be a claim: it asserts the elevation
    // was inferred, which the UI then trusts enough to hedge on. Null asserts
    // nothing.
    expect(normaliseToElevationBasis('carrier-pigeon')).toBeNull();
    expect(normaliseToElevationBasis('')).toBeNull();
    expect(normaliseToElevationBasis(null)).toBeNull();
    expect(normaliseToElevationBasis(undefined)).toBeNull();
  });
});
