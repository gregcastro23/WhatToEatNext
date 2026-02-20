# Alchemical Kinetics Demo - Implementation Prompt

## Project Context

You are working on the **WhatToEatNext** project, a sophisticated culinary recommendation system that combines alchemical principles, astrological data, and elemental harmony. The project uses Next.js 15.3.4, React 19, and TypeScript 5.7.3.

## Task: Create Alchemical Kinetics Demo Page

Create an interactive demo page at `/alchemical-kinetics` (or update `/_alchemize-demo` if it exists) that demonstrates the alchemical kinetics calculation theory. This page should be linked from the main page (`src/app/page.tsx`) where it currently says:

```
🧪 Alchemical
Transform ingredients through Spirit, Essence, Matter, and Substance
Explore Alchemical Kinetics →
```

## Core Calculation System Overview

### 1. Alchemical Properties (ESMS)

**CRITICAL**: ESMS values (Spirit, Essence, Matter, Substance) MUST be calculated from planetary positions, NOT from elemental properties.

- **Spirit**: Consciousness, vitality (from Sun, Mercury, Jupiter, Saturn)
- **Essence**: Emotional energy, flow (from Moon, Venus, Mars, Uranus, Neptune, Pluto)
- **Matter**: Physical substance, structure (from Moon, Venus, Mars, Saturn, Uranus, Pluto)
- **Substance**: Material form, density (from Mercury, Neptune)

**Planetary Alchemy Values** (from `src/utils/planetaryAlchemyMapping.ts`):

```typescript
Sun:     { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 }
Moon:    { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 }
Mercury: { Spirit: 1, Essence: 0, Matter: 0, Substance: 1 }
Venus:   { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 }
Mars:    { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 }
Jupiter: { Spirit: 1, Essence: 1, Matter: 0, Substance: 0 }
Saturn:  { Spirit: 1, Essence: 0, Matter: 1, Substance: 0 }
Uranus:  { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 }
Neptune: { Spirit: 0, Essence: 1, Matter: 0, Substance: 1 }
Pluto:   { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 }
```

### 2. Thermodynamic Metrics

**Heat** (Active Energy):

```
Heat = (Spirit² + Fire²) / (Substance + Essence + Matter + Water + Air + Earth)²
```

**Entropy** (Disorder):

```
Entropy = (Spirit² + Substance² + Fire² + Air²) / (Essence + Matter + Earth + Water)²
```

**Reactivity** (Transformation Potential):

```
Reactivity = (Spirit² + Substance² + Essence² + Fire² + Air² + Water²) / (Matter + Earth)²
```

**Greg's Energy** (Free Energy):

```
Greg's Energy = Heat - (Entropy × Reactivity)
```

**Kalchm** (K_alchm - Alchemical Equilibrium Constant):

```
K_alchm = (Spirit^Spirit × Essence^Essence) / (Matter^Matter × Substance^Substance)
```

**Monica Constant** (Dynamic System Constant):

```
M = -Greg's Energy / (Reactivity × ln(K_alchm))
```

(Returns NaN if K_alchm ≤ 0 or ln(K_alchm) = 0)

### 3. Kinetic Properties (P=IV Circuit Model)

The system models recipes as electrical circuits using the P=IV model:

**Charge (Q)**:

```
Q = Matter + Substance
```

**Potential Difference (V)**:

```
V = Greg's Energy / Q
```

**Current Flow (I)**:

```
I = Reactivity × (dQ/dt)
```

(Where dQ/dt is the rate of charge change over time)

**Power (P)**:

```
P = I × V
```

**Additional Kinetic Metrics**:

- **Velocity**: Per-element rate of change (d(element)/dt)
- **Momentum**: Inertia × Velocity per element
- **Inertia**: Resistance to change = Matter + Earth + Substance/2
- **Force**: Kinetic force + electromagnetic force per element
- **Force Classification**: "accelerating" | "decelerating" | "balanced"
- **Thermal Direction**: "heating" | "cooling" | "stable"
- **Aspect Phase**: "applying" | "exact" | "separating" (with power boosts)

## Key Files to Use

### Calculation Functions:

1. **`src/utils/planetaryAlchemyMapping.ts`**
   - `calculateAlchemicalFromPlanets()` - Authoritative ESMS calculation
   - `PLANETARY_ALCHEMY` - Planetary alchemy values
   - `ZODIAC_ELEMENTS` - Sign to element mapping

2. **`src/calculations/core/alchemicalEngine.ts`**
   - `alchemize()` - Core thermodynamic calculation from planetary positions
   - `planetInfo` - Planetary data with alchemy values
   - `signInfo` - Zodiac sign element mappings

3. **`src/calculations/core/kalchmEngine.ts`**
   - `calculateHeat()`, `calculateEntropy()`, `calculateReactivity()`
   - `calculateGregsEnergy()`, `calculateKAlchm()`, `calculateMonicaConstant()`
   - `calculateKalchmResults()` - Complete calculation suite

4. **`src/utils/monicaKalchmCalculations.ts`**
   - `calculateThermodynamicMetrics()` - Complete thermodynamic suite
   - `calculateMonicaKalchmCompatibility()` - Compatibility scoring
   - All individual formula functions

5. **`src/calculations/kinetics.ts`**
   - `calculateKinetics()` - Planetary kinetics with P=IV model
   - Returns `KineticMetrics` with charge, potential, current, power, force, etc.

6. **`src/utils/kineticCalculations.ts`**
   - `calculateKineticProperties()` - Recipe-level kinetic calculations

### Type Definitions:

- **`src/types/alchemy.ts`**: `AlchemicalProperties`, `ElementalProperties`, `ThermodynamicMetrics`
- **`src/types/kinetics.ts`**: `KineticMetrics`, `AspectPhase`

### Services for Real-Time Data:

- **`src/services/AstrologicalService.ts`**: Get current planetary positions
- Use `getCurrentAstrologicalState()` or similar to get real-time planetary data

## Demo Page Requirements

### Visual Design

- Match the existing design system (see `src/app/page.tsx` for styling patterns)
- Use the `alchm-card` class for cards
- Gradient backgrounds: `bg-gradient-to-br from-orange-50 via-purple-50 via-pink-50 to-blue-50`
- Responsive grid layouts

### Interactive Features

1. **Real-Time Planetary Input**
   - Allow users to select planetary positions (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto)
   - Default to current planetary positions (use AstrologicalService)
   - Show zodiac sign dropdowns for each planet
   - Display current element for each sign

2. **ESMS Calculation Display**
   - Show calculated Spirit, Essence, Matter, Substance values
   - Visual representation (bars, gauges, or circular progress)
   - Explain how each planet contributes
   - Show the aggregation process

3. **Thermodynamic Metrics Visualization**
   - Display all 6 metrics: Heat, Entropy, Reactivity, Greg's Energy, Kalchm, Monica
   - Show formulas with current values substituted
   - Visual indicators (gauges, thermometers, energy meters)
   - Color coding (heat = red/orange, entropy = blue, etc.)

4. **Kinetic Properties (P=IV Circuit)**
   - Visual circuit diagram showing:
     - Charge (Q) as battery/capacitor
     - Potential (V) as voltage
     - Current (I) as flow
     - Power (P) as output
   - Per-element velocity, momentum, force
   - Force classification indicator
   - Thermal direction indicator
   - Aspect phase with power boosts

5. **Interactive Formula Explorer**
   - Expandable sections for each formula
   - Step-by-step calculation breakdown
   - Show intermediate values
   - Explain what each metric means in culinary terms

6. **Example Scenarios**
   - Pre-set planetary configurations (e.g., "High Fire Energy", "Balanced Earth", "Spiritual Alignment")
   - Show how different configurations affect all metrics
   - Compare scenarios side-by-side

### Technical Implementation

1. **Use Real Calculation Functions**
   - Import and use actual functions from the codebase
   - NO placeholder values or approximations
   - Use `calculateAlchemicalFromPlanets()` for ESMS (not elemental approximations)
   - Use `calculateKinetics()` for kinetic properties

2. **Real-Time Updates**
   - Recalculate all metrics when planetary positions change
   - Show loading states during calculations
   - Cache results appropriately

3. **Error Handling**
   - Handle edge cases (division by zero, NaN values)
   - Show meaningful error messages
   - Fallback to safe defaults when needed

4. **Performance**
   - Use React hooks efficiently (useMemo, useCallback)
   - Debounce rapid input changes
   - Consider using Web Workers for heavy calculations if needed

## Example Page Structure

```tsx
// src/app/alchemical-kinetics/page.tsx (or update /_alchemize-demo)

"use client";

import { useState, useMemo } from "react";
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";
import { calculateThermodynamicMetrics } from "@/utils/monicaKalchmCalculations";
import { calculateKinetics } from "@/calculations/kinetics";
// ... other imports

export default function AlchemicalKineticsDemo() {
  // State for planetary positions
  // State for calculated metrics
  // Handlers for updates
  // Memoized calculations
  // Render sections
}
```

## Styling Guidelines

- Follow existing patterns from `src/app/page.tsx`
- Use Tailwind CSS classes
- `alchm-card` for card containers
- `alchm-shimmer` for animated effects
- Color scheme: Green for alchemical (matching the main page card)
- Responsive: Mobile-first design

## Testing Checklist

- [ ] All formulas calculate correctly
- [ ] Real-time updates work smoothly
- [ ] Edge cases handled (zero values, NaN)
- [ ] Responsive on mobile/tablet/desktop
- [ ] Matches design system
- [ ] Uses actual codebase functions (no placeholders)
- [ ] Performance is acceptable
- [ ] Accessible (keyboard navigation, screen readers)

## Additional Notes

- The project uses Yarn (not npm)
- Build command: `make build` or `yarn build`
- Dev command: `make dev` or `yarn dev`
- Type checking: `yarn tsc --noEmit --skipLibCheck`
- Follow TypeScript strict mode (no `as any` unless absolutely necessary)
- Use proper type imports from `@/types/` directory

## Success Criteria

The demo should:

1. Clearly explain the alchemical kinetics theory
2. Show all calculations in real-time
3. Be visually engaging and educational
4. Use actual codebase functionality (no placeholders)
5. Match the existing design aesthetic
6. Be performant and responsive
7. Handle edge cases gracefully

---

**Ready to build!** Start by creating the page structure, then implement each calculation section systematically. Use the existing calculation functions from the codebase - they are well-tested and authoritative.
