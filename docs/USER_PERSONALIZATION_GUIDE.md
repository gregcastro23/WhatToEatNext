# User Personalization System Guide

**Last Updated:** November 23, 2025

## Overview

The WhatToEatNext personalization system uses astrological natal charts and real-time planetary positions to provide highly personalized culinary recommendations. By comparing a user's birth chart with the current moment's chart, the system identifies cosmic harmonies and provides tailored suggestions.

## Architecture

### Three-Layer Personalization System

```
┌─────────────────────────────────────────────────────┐
│ Layer 1: User Natal Chart (Birth Data)             │
│ - Planetary positions at birth                      │
│ - Elemental balance (Fire/Water/Earth/Air)         │
│ - Alchemical properties (Spirit/Essence/Matter/Sub) │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Layer 2: Moment Chart (Current Planetary Positions) │
│ - Real-time planetary positions                     │
│ - Elemental balance of the moment                   │
│ - Alchemical properties of the moment               │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Layer 3: Chart Comparison & Personalization         │
│ - Elemental harmony (0-1 score)                     │
│ - Alchemical alignment (0-1 score)                  │
│ - Planetary resonance (0-1 score)                   │
│ - Overall harmony (weighted composite)              │
└─────────────────────────────────────────────────────┘
```

## Core Components

### 1. Chart Comparison Service

**Location:** `src/services/ChartComparisonService.ts`

**Key Functions:**

- `calculateMomentChart(dateTime?, location?)` - Calculate planetary chart for any moment
- `compareCharts(natalChart, momentChart?)` - Compare natal vs moment charts
- `getPersonalizationBoost(itemElemental, itemAlchemical, chartComparison)` - Calculate boost multiplier

**Data Structures:**

```typescript
interface MomentChart {
  dateTime: string;
  location: { latitude: number; longitude: number };
  planetaryPositions: Record<Planet, ZodiacSign>;
  dominantElement: Element;
  elementalBalance: ElementalProperties;
  alchemicalProperties: AlchemicalProperties;
  calculatedAt: string;
}

interface ChartComparison {
  natalChart: NatalChart;
  momentChart: MomentChart;
  overallHarmony: number; // 0-1
  elementalHarmony: number; // 0-1
  alchemicalAlignment: number; // 0-1
  planetaryResonance: number; // 0-1
  insights: {
    favorableElements: Element[];
    challengingElements: Element[];
    harmonicPlanets: Planet[];
    recommendations: string[];
  };
  elementalBoosts: Partial<ElementalProperties>;
  alchemicalBoosts: Partial<AlchemicalProperties>;
}
```

### 2. Personalized Recommendation Service

**Location:** `src/services/PersonalizedRecommendationService.ts`

**Key Functions:**

- `scoreItem(item, context)` - Score single item with personalization
- `scoreItems(items, context)` - Score multiple items, return sorted
- `getTopRecommendations(items, context, limit)` - Get top N recommendations
- `calculateCompatibility(item, natalChart)` - Get 0-1 compatibility score

**Usage Example:**

```typescript
import { personalizedRecommendationService } from '@/services/PersonalizedRecommendationService';

const recommendations = await personalizedRecommendationService.getTopRecommendations(
  cuisineItems,
  {
    natalChart: user.profile.natalChart,
    includeReasons: true
  },
  10 // limit
);
```

### 3. User Chart Helpers

**Location:** `src/utils/userChartHelpers.ts`

**Convenience Functions:**

```typescript
// Get user's natal chart
const chart = await getUserNatalChart(userId);

// Get chart comparison for user
const comparison = await getUserChartComparison(userId);

// Get personalized recommendations
const recommendations = await getPersonalizedRecommendationsForUser(
  userId,
  items,
  10
);

// Get user's favorable elements
const favorable = await getUserFavorableElements(userId);

// Get personalized insights
const insights = await getUserPersonalizedInsights(userId);

// Check if it's a good time
const isGoodTime = await isGoodTimeForUser(userId);
```

## API Endpoints

### POST /api/personalized-recommendations

Get personalized recommendations for a user.

**Request:**

```json
{
  "userId": "user_12345",
  // OR
  "email": "user@example.com",

  "includeChartAnalysis": true,  // optional, default true
  "datetime": "2025-11-23T12:00:00Z"  // optional, default current time
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "user_12345",
    "userName": "John Doe",
    "chartComparison": {
      "overallHarmony": 0.78,
      "elementalHarmony": 0.82,
      "alchemicalAlignment": 0.71,
      "planetaryResonance": 0.75,
      "insights": {
        "favorableElements": ["Fire", "Air"],
        "challengingElements": ["Water", "Earth"],
        "harmonicPlanets": ["Sun", "Mercury", "Jupiter"],
        "recommendations": [
          "Excellent cosmic alignment! This is a favorable time for culinary exploration.",
          "Emphasize Fire and Air elements in your meal choices."
        ]
      }
    },
    "recommendations": {
      "favorableElements": ["Fire", "Air"],
      "challengingElements": ["Water", "Earth"],
      "harmonicPlanets": ["Sun", "Mercury", "Jupiter"],
      "insights": [...],
      "suggestedCuisines": ["Mexican", "Indian", "Thai", "BBQ", "French", "Light"],
      "suggestedCookingMethods": ["Grilling", "Roasting", "Quick-frying"]
    }
  }
}
```

## User Onboarding Flow

### 1. Birth Data Collection

**Endpoint:** POST `/api/onboarding`

**Required Fields:**
- Email
- Name
- Birth data:
  - dateTime (ISO 8601)
  - latitude
  - longitude
  - timezone (optional)

**Example:**

```typescript
const response = await fetch('/api/onboarding', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    birthData: {
      dateTime: '1990-05-15T14:30:00Z',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    }
  })
});
```

### 2. Natal Chart Calculation

The onboarding API automatically:
1. Calculates planetary positions for birth date/time/location
2. Derives elemental balance from zodiac signs
3. Calculates alchemical properties from planets
4. Stores natal chart in user profile

### 3. Profile Storage

User profile structure:

```typescript
interface UserProfile {
  userId: string;
  name?: string;
  email?: string;
  preferences?: Record<string, unknown>;
  birthData?: BirthData;
  natalChart?: NatalChart;
  groupMembers?: GroupMember[];
  diningGroups?: DiningGroup[];
}

interface NatalChart {
  birthData: BirthData;
  planetaryPositions: Record<Planet, ZodiacSign>;
  dominantElement: Element;
  dominantModality: Modality;
  elementalBalance: ElementalProperties;
  alchemicalProperties: AlchemicalProperties;
  calculatedAt: string;
}
```

## Personalization Algorithm

### Scoring Formula

```
personalizedScore = baseScore × personalizationBoost

personalizationBoost = (
  elementalBoost +
  alchemicalBoost +
  overallHarmonyMultiplier
)

Range: 0.7 to 1.3
```

### Elemental Harmony Calculation

Uses **cosine similarity** between natal and moment elemental properties:

```
similarity = dotProduct(natal, moment) / (||natal|| × ||moment||)
harmony = (similarity + 1) / 2  // Normalize to 0-1
```

### Alchemical Alignment Calculation

1. Normalize ESMS values (sum to 1.0)
2. Calculate cosine similarity
3. Normalize to 0-1 range

### Planetary Resonance Calculation

For each planet, score based on sign relationship:
- **Same sign:** 1.0 (perfect)
- **Same element:** 0.8 (strong)
- **Compatible elements:** 0.6 (moderate)
  - Fire + Air
  - Earth + Water
- **Other:** 0.3 (neutral)

Average across all planets for final resonance score.

### Overall Harmony

Weighted composite:
```
overallHarmony = (
  elementalHarmony × 0.4 +
  alchemicalAlignment × 0.3 +
  planetaryResonance × 0.3
)
```

## Integration Examples

### Example 1: Basic Personalized Recommendations

```typescript
import { getPersonalizedRecommendationsForUser } from '@/utils/userChartHelpers';

async function getRecommendations(userId: string) {
  const items = [
    {
      id: 'italian-001',
      name: 'Italian Cuisine',
      elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 },
      alchemicalProperties: { Spirit: 2, Essence: 5, Matter: 7, Substance: 3 },
      baseScore: 0.7
    },
    // ... more items
  ];

  const recommendations = await getPersonalizedRecommendationsForUser(
    userId,
    items,
    5,  // top 5
    true  // include reasons
  );

  return recommendations;
}
```

### Example 2: Check User Compatibility

```typescript
import { calculateUserItemCompatibility } from '@/utils/userChartHelpers';

async function checkCompatibility(userId: string, recipeId: string) {
  const recipe = await getRecipe(recipeId);

  const compatibility = await calculateUserItemCompatibility(userId, {
    id: recipe.id,
    name: recipe.name,
    elementalProperties: recipe.elementalProperties,
    alchemicalProperties: recipe.alchemicalProperties
  });

  if (compatibility > 0.7) {
    return 'Highly compatible!';
  } else if (compatibility > 0.5) {
    return 'Good match';
  } else {
    return 'Consider alternatives';
  }
}
```

### Example 3: Display User Insights

```typescript
import { getUserPersonalizedInsights } from '@/utils/userChartHelpers';

async function displayDailyInsights(userId: string) {
  const insights = await getUserPersonalizedInsights(userId);

  if (!insights) {
    return 'Please complete onboarding';
  }

  return {
    cosmicWeather: insights.overallHarmony > 0.7 ? 'Excellent' : 'Good',
    focus: insights.favorableElements.join(', '),
    avoid: insights.challengingElements.join(', '),
    supportivePlanets: insights.harmonicPlanets.join(', '),
    advice: insights.recommendations
  };
}
```

## Caching Strategy

### Chart Comparison Cache

- **Cache Duration:** 5 minutes
- **Key:** Natal chart calculation timestamp
- **Rationale:** Moment chart changes slowly, cache reduces API calls

### Auto-Cleanup

Cache automatically removes expired entries to prevent memory bloat.

## Performance Considerations

### Optimization Tips

1. **Batch Scoring:** Use `scoreItems()` instead of multiple `scoreItem()` calls
2. **Cache Results:** Chart comparisons are cached for 5 minutes
3. **Limit Recommendations:** Request only the top N you need
4. **Skip Reasons:** Set `includeReasons: false` if not displaying explanations

### Expected Performance

- **Moment Chart Calculation:** ~500ms (API call)
- **Chart Comparison:** ~10ms (computation)
- **Single Item Scoring:** ~1ms
- **100 Items Scoring:** ~50ms

## Testing

### Sample Test Data

```typescript
// Sample user with natal chart
const testUser = {
  id: 'test_user_001',
  profile: {
    natalChart: {
      planetaryPositions: {
        Sun: 'gemini',
        Moon: 'leo',
        Mercury: 'taurus',
        // ...
      },
      elementalBalance: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
      alchemicalProperties: { Spirit: 4, Essence: 6, Matter: 6, Substance: 2 }
    }
  }
};

// Sample item
const testItem = {
  id: 'test_item_001',
  name: 'Test Cuisine',
  elementalProperties: { Fire: 0.4, Water: 0.1, Earth: 0.3, Air: 0.2 },
  alchemicalProperties: { Spirit: 3, Essence: 5, Matter: 7, Substance: 2 },
  baseScore: 0.6
};
```

## Troubleshooting

### Issue: User has no recommendations

**Solution:** Check if user completed onboarding:
```typescript
const hasChart = await userHasNatalChart(userId);
if (!hasChart) {
  // Redirect to onboarding
}
```

### Issue: All scores are the same

**Solution:** Check item properties are properly set:
```typescript
// Ensure items have elemental and alchemical properties
items.forEach(item => {
  console.log(item.elementalProperties, item.alchemicalProperties);
});
```

### Issue: Personalization boost not applied

**Solution:** Verify natal chart exists and has valid data:
```typescript
const chart = await getUserNatalChart(userId);
console.log(chart?.planetaryPositions);
console.log(chart?.elementalBalance);
```

## Future Enhancements

### Planned Features

1. **Transits & Progressions:** Advanced astrological techniques
2. **Aspect Analysis:** Detailed planetary aspect calculations
3. **House System:** Integration of astrological houses
4. **Group Compatibility:** Multi-user dining group recommendations
5. **Historical Tracking:** Track recommendation accuracy over time
6. **Machine Learning:** Learn from user feedback to refine scores

## References

- [Planetary Alchemy Mapping](../src/utils/planetaryAlchemyMapping.ts)
- [Natal Chart Types](../src/types/natalChart.ts)
- [Celestial Types](../src/types/celestial.ts)
- [User Context](../src/contexts/UserContext/index.tsx)

---

**For Questions:** Contact the development team or refer to inline code documentation.
