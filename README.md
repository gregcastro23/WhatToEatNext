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