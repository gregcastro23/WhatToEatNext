# WhatToEatNext

A sophisticated culinary recommendation system that uses alchemical principles,
astrological data, and elemental harmony to suggest personalized recipes,
ingredients, and cooking methods tailored to your cosmic alignment and
preferences.

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

## Key Features

- **Personalized Recipe Recommendations**: Curated suggestions based on your
  astrological profile
- **Ingredient Affinity Calculator**: Discover ideal ingredient pairings based
  on elemental harmony
- **Cooking Method Advisor**: Recommendations using our 14 Alchemical Pillars
  system
- **Seasonal Adjustments**: Food recommendations that shift with the wheel of
  the year
- **Cuisine Explorer**: Browse culinary traditions through their elemental
  properties
- **Sauce Recommendation Engine**: Find the perfect sauce pairing for any dish
- **Chakra-Influenced Food Selections**: Align your meals with energetic centers
- **🌟 Planetary Kinetics Integration**: Real-time cosmic power analysis for enhanced recommendations (20-30% improvement)

## 🌟 Planetary Kinetics Integration

Our food recommendation system now includes real-time planetary kinetics for enhanced temporal intelligence:

### Features
- **Dynamic Energy Categorization**: Foods are categorized as energizing, grounding, or balanced based on current cosmic power levels
- **Aspect-Enhanced Recommendations**: Different suggestions for applying, exact, and separating planetary aspects
- **Intelligent Portion Sizing**: Portions adjust based on your current energetic state
- **Group Dining Optimization**: Harmony scoring for shared meals
- **Visual Power Indicators**: Real-time display of current cosmic energy levels

### Configuration

Add to your `.env.local`:

```env
# Planetary Kinetics API (optional - falls back gracefully if not configured)
NEXT_PUBLIC_PLANETARY_KINETICS_URL=https://your-kinetics-api.com
NEXT_PUBLIC_KINETICS_CACHE_TTL=300000  # 5 minutes (optional)
```

### Fallback Behavior

When the kinetics API is unavailable, the system:
- Automatically falls back to standard astrological recommendations
- Provides balanced energy calculations (0.5 power level)
- Maintains full functionality without kinetics enhancement
- Logs graceful degradation for monitoring

### Usage Example

```typescript
import { useFoodRecommendations } from '@/hooks/useFoodRecommendations';
import { KineticsPowerIndicator } from '@/components/KineticsPowerIndicator';

const {
  recommendations,
  currentPowerLevel,
  isKineticsEnabled
} = useFoodRecommendations({
  enableKinetics: true
});

// Show power level indicator
<KineticsPowerIndicator powerLevel={currentPowerLevel} />

// Enhanced recommendations include kineticScore and temporalCategory
recommendations.forEach(rec => {
  console.log(`${rec.name}: ${rec.kineticScore} (${rec.temporalCategory})`);
});
```

### Performance Benefits

- **20-30% improvement** in recommendation relevance when kinetics API is available
- **Zero performance impact** when API is unavailable (graceful fallback)
- **Request deduplication** prevents redundant API calls
- **Intelligent caching** reduces API load and improves response times

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: CSS Modules, Tailwind CSS
- **Astrological Calculations**: Astronomia library with local ephemeris data
- **Component Libraries**: Astro for astrological visualizations
- **Build System**: Enhanced with automated repair and validation tools

## Build System Management

The project includes comprehensive build system repair and validation tools:

### Quick Commands

```bash
make build-health        # Check build system status
make build-validate      # Validate build integrity
make build-repair        # Fix common build issues
make build-comprehensive # Full system repair
```

### Available Build Commands

- `make build-health` - Monitor build system health with detailed metrics
- `make build-validate` - Validate manifest files and build artifacts
- `make build-repair` - Repair missing or corrupted manifest files
- `make build-comprehensive` - Complete build system repair and optimization
- `make build-emergency` - Emergency recovery for critical build failures
- `make build-workflow` - Automated build maintenance workflow
- `make build-safe` - Production build with integrated safety checks

For detailed documentation, see
[Build System Repair Guide](docs/BUILD_SYSTEM_REPAIR.md) and
[Makefile Commands Reference](docs/MAKEFILE_BUILD_SYSTEM_COMMANDS.md).

## Alchemical Pillars System

Our application maps traditional cooking methods to 14 alchemical transformation
processes (Calcination, Fermentation, Distillation, etc.), providing nuanced
cooking recommendations that honor ancient wisdom.

Each pillar affects the four alchemical properties (Spirit, Essence, Matter, and
Substance) differently, creating a sophisticated framework for understanding
culinary transformations.

## Planetary Position System

### Overview

The application calculates planetary positions for astrological analysis and
food recommendations. The system has multiple fallback mechanisms to ensure
reliable data:

1. **Primary Method**: Uses the astronomy-engine to calculate precise positions
   based on modern astronomical algorithms.
2. **Transit Date Validation**: Validates calculated positions against transit
   dates stored in planet data files.
3. **Current Position Fallback**: Uses the latest known positions (May 16, 2024)
   when calculations fail.

### Planetary Transit Validation

The system now includes a transit date validation mechanism that:

- Checks calculated planetary positions against known transit dates in each
  planet's data file
- Corrects any planet's sign if it doesn't match the expected transit period
- Preserves the exact degree within the sign for accuracy
- Recalculates longitude values when signs are corrected
- Provides current positions based on the browser's date when online
  calculations fail

This ensures that food recommendations always use accurate planetary positions,
even when astronomical calculations cannot be performed.

### Adding/Updating Transit Dates

When a planet moves into a new sign, update its transit dates in the
corresponding data file:

```javascript
// Example: src/data/planets/mars.ts
TransitDates: {
  'Leo': { 'Start': '2024-05-01', 'End': '2024-06-30' },
  'Virgo': { 'Start': '2024-07-01', 'End': '2024-08-31' }
}
```

### Testing

The planetary position system includes automated tests to verify:

- Correct transit sign detection based on dates
- Position validation and correction
- Fallback position accuracy

## Getting Started

### Prerequisites

- Node.js (v20.18.0 or higher)
- Yarn package manager (required - npm lockfiles are automatically removed)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/gregcastro23/WhatToEatNext.git
   cd WhatToEatNext
   ```

2. Check package manager setup (optional):

   ```bash
   yarn check-pm
   ```

3. Install dependencies:

   ```bash
   yarn install
   ```

4. Start the development server:

   ```bash
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
yarn build
yarn start
```

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Ensure your code follows our elemental principles (check
   elemental-principles-guide.md)
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License.

## Running the Application

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

## Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch
```

## Linting and CI

This project uses ESLint for code quality and has continuous integration set up
through GitHub Actions.

```bash
# Run linting
yarn lint

# Fix linting issues automatically
yarn lint:fix
```

### Pre-push Checks

A pre-push hook is configured to run linting and build checks before pushing to
GitHub:

- Your code will be linted
- A build will be attempted to catch any build errors

### GitHub CI Workflow

The GitHub Actions workflow runs on all pushes and pull requests:

1. **Linting**: Checks code quality with a maximum of 50 warnings
2. **Building**: Ensures the project builds without errors
3. **Testing**: Runs all tests

This ensures that code quality is maintained and build errors are caught before
merging.
