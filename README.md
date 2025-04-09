# WhatToEatNext

A personalized food recommendation system that uses astrological data and elemental balance to suggest recipes and ingredients tailored to your current cosmic alignment.

## Features

- Personalized recipe recommendations based on astrological data
- Ingredient suggestions based on elemental balance
- Seasonal food adjustments
- Cooking method recommendations using alchemical pillars
- Cuisine explorer by elemental properties
- Advanced alchemical transformations for optimal food pairing

## Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gregcastro23/WhatToEatNext.git
   cd WhatToEatNext
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start the development server:
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
- `/src/data` - Food and ingredient databases
- `/src/calculations` - Core calculation logic
- `/src/lib` - Core library functions
- `/src/utils` - Utility functions
- `/src/constants` - System constants and mappings
- `/public` - Static assets

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

# What To Eat Next - Astrological Component Library

This project enhances the "What To Eat Next" application with improved astrological calculations and beautiful UI components using Astro.

## Improvements Implemented

1. **Enhanced Astronomia Integration**: 
   - Extended use of the astronomia library for more accurate planetary calculations
   - Added fallback mechanisms to ensure calculations always work

2. **Local Ephemeris Data**:
   - Added script to download ephemeris data files
   - Created local ephemeris data structure to work offline
   - Implemented fallback mechanisms for when ephemeris files aren't available

3. **Modular Astro Components**:
   - Created reusable Astro components for astrological UI elements
   - Components are self-contained and styled for optimal user experience
   - Responsive design that works across different devices

4. **Astro Integration**:
   - Added Astro to the project with necessary integrations:
     - @astrojs/react for React compatibility
     - @astrojs/node for server-side rendering
     - @astrojs/vercel for production deployment
     - astro-seo for search engine optimization
     - astro-icon for icons

## Component Overview

### AstroChart
A visual representation of the current planetary positions in the zodiac wheel, with options to display planetary aspects.

```astro
<AstroChart
  planetaryPositions={planetPositions}
  aspectsData={aspects}
  title="Current Astrological Chart"
/>
```

### PlanetaryDisplay
Displays detailed information about each planet's position in the zodiac, including sign, degree, and dignity.

```astro
<PlanetaryDisplay
  planetaryPositions={planetPositions}
  showRetrograde={true}
  showDignity={true}
/>
```

### LunarPhaseDisplay
Shows the current phase of the moon with a visual representation and lunar influences.

```astro
<LunarPhaseDisplay
  currentPhase={lunarPhase}
  size="large"
/>
```

## Local Development

### Setup

1. Install dependencies:
```
npm install
```

2. Download ephemeris data:
```
npm run download-ephe
```

3. Run the Astro development server:
```
npm run astro:dev
```

4. Visit http://localhost:4321/astrology to see the astrological components in action.

### Using Components in Your Project

The components can be imported and used in any Astro page:

```astro
---
import AstroChart from '../components/AstroChart.astro';
import { calculateSimplifiedPositions } from '../../utils/astrologyUtils';

// Get planetary positions
const planetPositions = calculateSimplifiedPositions(new Date());
---

<AstroChart planetaryPositions={planetPositions} />
```

## Deployment

The project is set up to deploy to Vercel:

```
npm run astro:build
```

This will create a production build that can be deployed to Vercel or other hosting platforms.

## Technology Stack

- **Astro**: Fast, modern front-end framework
- **Astronomia**: JavaScript library for astronomical calculations
- **TypeScript**: For type safety and better developer experience
- **React**: Used for interactive components (via @astrojs/react)
- **CSS**: Modern CSS with custom properties for theming

## Future Improvements

- Add more complex astronomical calculations
- Implement interactive planetary transit predictions
- Create more visualizations for astrological houses and aspects

# Alchemical Pillars System

The application now features an advanced alchemical pillars system that enhances cooking recommendations by mapping cooking methods to traditional alchemical processes.

## The 14 Alchemical Pillars

Each pillar represents a fundamental alchemical transformation process that affects the four alchemical properties (Spirit, Essence, Matter, and Substance):

1. **Solution**: Dissolving a solid in liquid (increases Essence and Matter, decreases Spirit and Substance)
2. **Filtration**: Separating solids from liquids (increases Essence, Spirit, and Substance, decreases Matter)
3. **Evaporation**: Transition from liquid to gas (increases Essence and Spirit, decreases Matter and Substance)
4. **Distillation**: Purification through evaporation and condensation (increases Essence, Spirit, and Substance, decreases Matter)
5. **Separation**: Division into constituents (increases Essence, Matter, and Spirit, decreases Substance)
6. **Rectification**: Refinement and purification (increases all properties)
7. **Calcination**: Reduction through intense heat (increases Essence and Matter, decreases Spirit and Substance)
8. **Comixion**: Thorough mixing (increases Matter, Spirit, and Substance, decreases Essence)
9. **Purification**: Removal of impurities (increases Essence and Spirit, decreases Matter and Substance)
10. **Inhibition**: Restraint of reactivity (increases Matter and Substance, decreases Essence and Spirit)
11. **Fermentation**: Transformation through microbial action (increases Essence, Matter, and Spirit, decreases Substance)
12. **Fixation**: Stabilization of volatiles (increases Matter and Substance, decreases Essence and Spirit)
13. **Multiplication**: Amplification of virtues (increases Essence, Matter, and Spirit, decreases Substance)
14. **Projection**: Culminating transformation (increases all properties)

## Cooking Method Mapping

Cooking methods are mapped to these pillars to determine their alchemical effects:

- **Wet Methods**: Boiling (Solution), Steaming (Evaporation), Poaching (Solution), etc.
- **Dry Methods**: Baking (Calcination), Roasting (Calcination), Grilling (Calcination), etc.
- **Transformation Methods**: Fermenting (Fermentation), Pickling (Fermentation), Curing (Fixation), etc.
- **Modern Methods**: Spherification (Rectification), Emulsification (Comixion), etc.

## Implementation

The system calculates compatibility between ingredients and cooking methods by analyzing how the alchemical pillar transformations affect the ingredient's properties.

For example:
- A "fiery" ingredient with high Spirit might benefit from cooking methods that increase Water and Earth elements
- Ingredients lacking in Essence might be enhanced by cooking methods associated with the Solution or Fermentation pillars

This system provides more accurate and nuanced cooking recommendations that honor traditional alchemical wisdom. 