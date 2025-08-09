# Architecture Documentation

## Core Philosophy

### Elemental Harmony Approach

Our system is based on the principle that all four elements (Fire, Water, Earth,
Air) are individually valuable and contribute unique qualities. Rather than
viewing elements as opposing forces, we recognize that:

- Each element brings its own distinctive qualities
- Elements reinforce themselves (like strengthens like)
- All element combinations work harmoniously together
- Elements are appreciated for their individual contributions, not for
  "balancing" each other

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: CSS Modules, Tailwind CSS
- **Astrological Calculations**: Astronomia library with local ephemeris data
- **Component Libraries**: Astro for astrological visualizations

## Project Structure

- `/src/app` - Next.js App Router components
- `/src/components` - Reusable UI components
- `/src/data` - Ingredient databases with elemental properties
- `/src/calculations` - Core alchemical and astrological calculations
- `/src/utils` - Utility functions for elemental transformations
- `/src/constants` - System constants and alchemical mappings
- `/src/astro` - Astrological visualization components

## Astrological Component Library

Our project includes an advanced astrological component library featuring:

- **AstroChart**: Visual representation of planetary positions
- **PlanetaryDisplay**: Detailed planet information with dignity calculation
- **LunarPhaseDisplay**: Real-time moon phase visualization
- **CelestialDisplay**: Interactive celestial body explorer
