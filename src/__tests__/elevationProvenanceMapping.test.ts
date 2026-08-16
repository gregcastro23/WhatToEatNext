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
