# Alchemical Kinetics Demo - Quick Reference

## File Locations

### Calculation Files

- `src/utils/planetaryAlchemyMapping.ts` - ESMS from planets (AUTHORITATIVE)
- `src/calculations/core/alchemicalEngine.ts` - Core alchemize() function
- `src/calculations/core/kalchmEngine.ts` - Kalchm/Monica calculations
- `src/utils/monicaKalchmCalculations.ts` - Complete thermodynamic suite
- `src/calculations/kinetics.ts` - Planetary kinetics (P=IV model)
- `src/utils/kineticCalculations.ts` - Recipe kinetic properties

### Type Definitions

- `src/types/alchemy.ts` - AlchemicalProperties, ElementalProperties, ThermodynamicMetrics
- `src/types/kinetics.ts` - KineticMetrics, AspectPhase

### Services

- `src/services/AstrologicalService.ts` - Get current planetary positions

## Key Functions

### ESMS Calculation (REQUIRED)

```typescript
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";

const esms = calculateAlchemicalFromPlanets({
  Sun: "Gemini",
  Moon: "Leo",
  // ... other planets
});
// Returns: { Spirit: number, Essence: number, Matter: number, Substance: number }
```

### Thermodynamic Metrics

```typescript
import { calculateThermodynamicMetrics } from "@/utils/monicaKalchmCalculations";

const thermo = calculateThermodynamicMetrics(esms, elementals);
// Returns: { heat, entropy, reactivity, gregsEnergy, kalchm, monica }
```

### Kinetics (P=IV Circuit)

```typescript
import { calculateKinetics } from "@/calculations/kinetics";

const kinetics = calculateKinetics({
  currentPlanetaryPositions: { Sun: 'Gemini', ... },
  timeInterval: 1800, // 30 minutes in seconds
  currentPlanet: 'Sun'
});
// Returns: KineticMetrics with charge, potentialDifference, currentFlow, power, etc.
```

## Formulas Summary

### Thermodynamic

- **Heat** = (Spirit² + Fire²) / (Substance + Essence + Matter + Water + Air + Earth)²
- **Entropy** = (Spirit² + Substance² + Fire² + Air²) / (Essence + Matter + Earth + Water)²
- **Reactivity** = (Spirit² + Substance² + Essence² + Fire² + Air² + Water²) / (Matter + Earth)²
- **Greg's Energy** = Heat - (Entropy × Reactivity)
- **Kalchm** = (Spirit^Spirit × Essence^Essence) / (Matter^Matter × Substance^Substance)
- **Monica** = -Greg's Energy / (Reactivity × ln(Kalchm))

### Kinetic (P=IV Circuit)

- **Charge (Q)** = Matter + Substance
- **Potential (V)** = Greg's Energy / Q
- **Current (I)** = Reactivity × (dQ/dt)
- **Power (P)** = I × V

## Design Patterns

### Styling

- Use `alchm-card` class for containers
- Gradient: `bg-gradient-to-br from-orange-50 via-purple-50 via-pink-50 to-blue-50`
- Green theme for alchemical section (matching main page)

### Component Structure

```tsx
"use client";
import { useState, useMemo } from "react";
// ... imports

export default function AlchemicalKineticsDemo() {
  const [planetaryPositions, setPlanetaryPositions] = useState({...});

  const esms = useMemo(() =>
    calculateAlchemicalFromPlanets(planetaryPositions),
    [planetaryPositions]
  );

  const thermo = useMemo(() =>
    calculateThermodynamicMetrics(esms, elementals),
    [esms, elementals]
  );

  // ... render
}
```

## Critical Rules

1. **NEVER** derive ESMS from elementals - use `calculateAlchemicalFromPlanets()`
2. **ALWAYS** use real calculation functions - no placeholders
3. **HANDLE** edge cases (division by zero, NaN, negative values)
4. **USE** proper TypeScript types - avoid `as any`
5. **FOLLOW** existing design patterns from main page

## Testing Commands

```bash
# Build
make build

# Dev server
make dev

# Type check
yarn tsc --noEmit --skipLibCheck

# Lint
make lint
```
