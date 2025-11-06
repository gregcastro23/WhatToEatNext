# Swiss Ephemeris Integration Documentation

## Overview

This document describes the comprehensive integration of Swiss Ephemeris data
into the WhatToEatNext astrological food recommendation system. The integration
provides highly accurate astronomical data with detailed transit information for
enhanced culinary recommendations.

## Architecture

### Multi-Source Data Integration

The system uses a layered approach to ensure maximum accuracy and reliability:

1. **Primary Source**: Astrologize API (real-time, highest accuracy)
2. **Secondary Source**: Swiss Ephemeris data (high accuracy fallback)
3. **Tertiary Source**: Comprehensive transit database (seasonal analysis)
4. **Fallback Source**: Existing astronomical calculations (final fallback)

### Core Components

#### 1. Swiss Ephemeris Service (`src/services/SwissEphemerisService.ts`)

Provides highly accurate astronomical data using Swiss Ephemeris calculations.

**Key Features:**

- Comprehensive ephemeris data for multiple years (2024-2025+)
- Precise planetary positions with retrograde detection
- Sidereal time calculations
- Caching system for performance optimization

**Usage:**

```typescript
import { swissEphemerisService } from "@/services/SwissEphemerisService";

// Get planetary positions for a specific date
const positions = await swissEphemerisService.getPlanetaryPositions(
  new Date("2025-06-01"),
);

// Get seasonal transit information
const transits = swissEphemerisService.getSeasonalTransits("2025");

// Check data availability
const isAvailable = swissEphemerisService.isDataAvailable(new Date());
```

#### 2. Enhanced Astrology Service (`src/services/EnhancedAstrologyService.ts`)

Orchestrates multiple data sources to provide the most accurate astronomical
information.

**Key Features:**

- Multi-source data integration
- Automatic fallback mechanisms
- Confidence scoring
- Seasonal recommendations
- Transit analysis

**Usage:**

```typescript
import { enhancedAstrologyService } from "@/services/EnhancedAstrologyService";

// Get enhanced planetary positions
const enhancedData =
  await enhancedAstrologyService.getEnhancedPlanetaryPositions();

// Get seasonal recommendations
const recommendations =
  await enhancedAstrologyService.getSeasonalRecommendations();

// Get transit analysis
const transitAnalysis = await enhancedAstrologyService.getTransitAnalysis();
```

#### 3. Comprehensive Transit Database (`src/data/transits/comprehensiveTransitDatabase.ts`)

Provides detailed transit information for multiple years with seasonal mappings.

**Key Features:**

- 12 seasons per year with detailed breakdowns
- Planetary placements and aspects
- Seasonal themes and culinary influences
- Elemental dominance patterns
- Retrograde periods and eclipse seasons

**Usage:**

```typescript
import {
  getTransitForDate,
  getSeasonalAnalysis,
} from "@/data/transits/comprehensiveTransitDatabase";

// Get transit for specific date
const transit = getTransitForDate(new Date("2025-06-15"));

// Get seasonal analysis for date range
const analysis = getSeasonalAnalysis(
  new Date("2025-06-01"),
  new Date("2025-08-31"),
);
```

#### 4. Ephemeris Parser (`src/utils/ephemerisParser.ts`)

TypeScript conversion of the Python ephemeris parser for parsing Swiss Ephemeris
data.

**Key Features:**

- Astronomical position string parsing
- Aspect calculations
- Elemental analysis
- Data validation

**Usage:**

```typescript
import { ephemerisParser } from "@/utils/ephemerisParser";

// Parse astronomical position
const position = ephemerisParser.parseAstronomicalPosition("10c46");

// Calculate aspect between planets
const aspect = ephemerisParser.calculateAspect(120.5, 180.2);

// Parse ephemeris data
const entries = ephemerisParser.parseEphemerisData(rawData);
```

## Data Structure

### Swiss Ephemeris Data Format

```typescript
interface SwissEphemerisData {
  day: number;
  date: Date;
  sidereal_time: string;
  // Planet codes: A=Sun, B=Moon, C=Mercury, D=Venus, E=Mars, F=Jupiter, G=Saturn, O=Uranus, I=Neptune, J=Pluto
  A: number; // Sun longitude
  B: number; // Moon longitude
  C: number; // Mercury longitude
  D: number; // Venus longitude
  E: number; // Mars longitude
  F: number; // Jupiter longitude
  G: number; // Saturn longitude
  O: number; // Uranus longitude
  I: number; // Neptune longitude
  J: number; // Pluto longitude
  L: number; // North Node longitude
  K: number; // South Node longitude
  // Sign information
  A_sign?: string;
  B_sign?: string;
  // ... other planet signs
  // Retrograde status
  A_retrograde?: boolean;
  B_retrograde?: boolean;
  // ... other planet retrograde status
}
```

### Transit Season Format

```typescript
interface TransitSeason {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  sunSign: ZodiacSign;
  dominantElements: Record<string, number>;
  keyAspects: PlanetaryAspect[];
  planetaryPlacements: Record<string, CelestialPosition>;
  seasonalThemes: string[];
  culinaryInfluences: string[];
  alchemicalProperties: Record<string, number>;
  dominantPlanets: string[];
  retrogradePlanets: string[];
  specialEvents: string[];
}
```

## Seasonal Analysis

### 12 Seasons of the Year

The system provides detailed analysis for each of the 12 zodiac seasons:

#### Fire Seasons (Dynamic Energy)

- **Aries (March 20 - April 19)**: New beginnings, bold flavors, spicy dishes
- **Leo (July 23 - August 22)**: Creative expression, rich flavors, dramatic
  presentation
- **Sagittarius (November 22 - December 21)**: Adventurous cuisine,
  international flavors

#### Earth Seasons (Stable Energy)

- **Taurus (April 20 - May 20)**: Comfort foods, rich sauces, slow cooking
- **Virgo (August 23 - September 22)**: Precise preparation, healthy
  ingredients, attention to detail
- **Capricorn (December 22 - January 19)**: Traditional methods, hearty dishes,
  structured approach

#### Air Seasons (Intellectual Energy)

- **Gemini (May 21 - June 20)**: Variety, light dishes, quick preparation
- **Libra (September 23 - October 22)**: Balanced flavors, elegant presentation,
  harmonious combinations
- **Aquarius (January 20 - February 18)**: Innovative approaches, experimental
  cuisine, unique combinations

#### Water Seasons (Emotional Energy)

- **Cancer (June 21 - July 22)**: Nurturing comfort foods, family recipes,
  emotional nourishment
- **Scorpio (October 23 - November 21)**: Deep, complex flavors, transformative
  cooking methods
- **Pisces (February 19 - March 19)**: Intuitive cooking, dreamy flavors,
  spiritual nourishment

### Elemental Dominance Patterns

Each season has specific elemental dominance that influences culinary
recommendations:

```typescript
// Example: Early Aries (March 20 - April 19)
dominantElements: {
  Fire: 0.45,    // Dynamic, bold energy
  Air: 0.25,     // Intellectual stimulation
  Earth: 0.20,   // Grounding stability
  Water: 0.10    // Emotional depth
}
```

## Culinary Recommendations

### Element-Based Cuisine Suggestions

#### Fire Element (Dynamic, Bold)

- **Cuisines**: Mexican, Thai, Indian, Korean
- **Cooking Methods**: Grilling, stir-frying, high-heat roasting
- **Characteristics**: Spicy, bold flavors, quick preparation

#### Earth Element (Stable, Comforting)

- **Cuisines**: Italian, French, Mediterranean, Southern US
- **Cooking Methods**: Slow cooking, braising, stewing, baking
- **Characteristics**: Rich, comforting, traditional

#### Air Element (Light, Intellectual)

- **Cuisines**: Japanese, Vietnamese, Greek, Middle Eastern
- **Cooking Methods**: Steaming, light sautéing, fresh preparation
- **Characteristics**: Light, varied, quick, fresh

#### Water Element (Nurturing, Emotional)

- **Cuisines**: Seafood-focused, Nordic, Coastal Mediterranean
- **Cooking Methods**: Poaching, soups and stews, gentle simmering
- **Characteristics**: Nurturing, comforting, emotional

### Seasonal Themes and Influences

Each season provides specific culinary themes:

```typescript
// Example: Early Gemini Season
seasonalThemes: [
  'Communication',
  'Variety',
  'Light dishes',
  'Fresh ingredients',
  'Social dining'
],
culinaryInfluences: [
  'Quick cooking methods',
  'Fresh herbs',
  'Varied textures',
  'Light sauces',
  'Sharing plates'
]
```

## Integration with Existing System

### Enhanced Food Recommendations

The Swiss Ephemeris integration enhances the existing food recommendation system
by:

1. **Improved Accuracy**: More precise planetary positions for better alchemical
   calculations
2. **Seasonal Context**: Detailed seasonal analysis for contextually appropriate
   recommendations
3. **Transit Awareness**: Knowledge of current transits for enhanced timing
4. **Elemental Balance**: Better understanding of elemental influences on food
   choices

### Alchemical Calculations

The enhanced data feeds into the existing alchemical calculation system:

```typescript
// Enhanced alchemical calculation with Swiss Ephemeris data
const enhancedData =
  await enhancedAstrologyService.getEnhancedPlanetaryPositions();
const alchemicalResult = alchemize(enhancedData.planetaryPositions);

// Seasonal recommendations enhance the result
const seasonalRecs =
  await enhancedAstrologyService.getSeasonalRecommendations();
const finalRecommendation = combineAlchemicalAndSeasonal(
  alchemicalResult,
  seasonalRecs,
);
```

## Performance and Caching

### Caching Strategy

- **Swiss Ephemeris Service**: 5-minute cache for planetary positions
- **Enhanced Astrology Service**: 10-minute cache for enhanced data
- **Astrologize API**: 5-minute check interval to avoid excessive API calls

### Data Availability

- **Swiss Ephemeris**: Always available (local data)
- **Transit Database**: Always available (local data)
- **Astrologize API**: Dependent on external service availability

## Error Handling and Fallbacks

The system implements robust error handling with multiple fallback levels:

1. **Primary**: Astrologize API (highest accuracy)
2. **Secondary**: Swiss Ephemeris data (high accuracy)
3. **Tertiary**: Transit database analysis (good accuracy)
4. **Final**: Existing astronomical calculations (reliable fallback)

## Future Enhancements

### Planned Features

1. **Extended Transit Database**: Add more years (2026-2030)
2. **Eclipse Season Calculations**: Automatic eclipse season detection
3. **Major Transit Alerts**: Notifications for significant transits
4. **Personal Transit Analysis**: User-specific transit calculations
5. **Historical Data Analysis**: Long-term transit pattern analysis

### Data Expansion

- **More Planetary Bodies**: Add Chiron, Lilith, and other asteroids
- **Aspect Patterns**: Complex aspect pattern recognition
- **Lunar Phases**: Detailed lunar phase integration
- **Solar Returns**: Annual solar return calculations

## Usage Examples

### Basic Usage

```typescript
import {
  getEnhancedPlanetaryPositions,
  getSeasonalRecommendations,
} from "@/services/EnhancedAstrologyService";

// Get current enhanced data
const data = await getEnhancedPlanetaryPositions();

// Get seasonal recommendations
const recommendations = await getSeasonalRecommendations();

console.log("Data Source:", data.dataSource);
console.log("Confidence:", data.confidence);
console.log("Dominant Elements:", data.dominantElements);
console.log("Recommended Cuisines:", recommendations.recommendedCuisines);
```

### Advanced Usage

```typescript
import { swissEphemerisService } from "@/services/SwissEphemerisService";
import { getTransitAnalysis } from "@/services/EnhancedAstrologyService";

// Get detailed transit analysis
const analysis = await getTransitAnalysis(new Date("2025-06-15"));

// Access seasonal information
console.log("Current Season:", analysis.currentSeason?.name);
console.log("Key Aspects:", analysis.keyAspects);
console.log("Retrograde Planets:", analysis.retrogradePlanets);

// Get Swiss Ephemeris specific data
const siderealTime = swissEphemerisService.getSiderealTime(new Date());
console.log("Sidereal Time:", siderealTime);
```

## Conclusion

The Swiss Ephemeris integration significantly enhances the accuracy and depth of
the astrological food recommendation system. By combining multiple data sources
and providing detailed seasonal analysis, the system can offer more precise and
contextually appropriate culinary recommendations.

The comprehensive transit database ensures that users receive recommendations
that are not only astronomically accurate but also seasonally and thematically
appropriate, creating a more holistic and effective food recommendation
experience.
