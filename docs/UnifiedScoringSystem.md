# Unified Scoring System Documentation

## Overview

The Unified Scoring System is a comprehensive, extensible framework for evaluating and ranking culinary recommendations based on multiple astrological and alchemical factors. It replaces fragmented scoring logic throughout the application with a centralized, transparent, and debuggable system.

## Architecture

### Core Components

1. **UnifiedScoringService** - Main service class (singleton)
2. **Scoring Modules** - Pure functions for each effect type
3. **Interfaces** - Type definitions for context, results, and data
4. **Data Sources** - Integration with APIs and services

### Design Principles

- **Modular**: Each effect is calculated by a separate pure function
- **Extensible**: New effects can be added without changing existing code
- **Transparent**: Full breakdown of all scoring factors provided
- **Debuggable**: Detailed logging and metadata for troubleshooting
- **Fallback-Safe**: Graceful degradation when data sources are unavailable

## Scoring Effects

### Primary Effects (High Impact)

#### 1. Elemental Compatibility (Weight: 0.9)
- **Purpose**: Measures how well item elements align with current astrological state
- **Calculation**: Same elements reinforce each other (Fire + Fire = positive)
- **Range**: 0.0 to 0.4
- **Key Principle**: Elements are NOT opposing - all combinations are harmonious

#### 2. Transit Effect (Weight: 0.8)
- **Purpose**: Evaluates current planetary transits affecting item's ruling planets
- **Calculation**: Positive aspects (trine, sextile) boost score; challenging aspects (square, opposition) reduce it
- **Range**: -0.5 to 0.5
- **Data Source**: Astrologize API or Swiss Ephemeris

#### 3. Dignity Effect (Weight: 0.7)
- **Purpose**: Considers planetary strength in current signs
- **Calculation**: Strong dignity = positive effect, weak dignity = negative effect
- **Range**: -0.3 to 0.3
- **Factors**: Exaltation, domicile, detriment, fall

#### 4. Aspect Effect (Weight: 0.7)
- **Purpose**: Evaluates current planetary aspects affecting item's rulers
- **Calculation**: Harmonious aspects boost, challenging aspects reduce
- **Range**: -0.3 to 0.3
- **Orb Sensitivity**: Closer aspects have stronger effects

### Secondary Effects (Moderate Impact)

#### 5. Seasonal Effect (Weight: 0.6)
- **Purpose**: Aligns recommendations with current season
- **Calculation**: +0.2 for seasonal items, -0.1 for out-of-season, 0 for non-seasonal
- **Range**: -0.1 to 0.2
- **Seasons**: spring, summer, autumn, winter

#### 6. Thermodynamic Effect (Weight: 0.6)
- **Purpose**: Matches cooking methods/complexity to current alchemical energy
- **Calculation**: High energy favors active methods, high entropy favors complexity
- **Range**: -0.1 to 0.2
- **Data Source**: RealAlchemizeService

#### 7. Retrograde Effect (Weight: 0.6)
- **Purpose**: Accounts for retrograde planets affecting item's rulers
- **Calculation**: Generally negative, with exceptions (Mercury retrograde + traditional methods)
- **Range**: -0.3 to 0.0
- **Special Cases**: Mercury retrograde can favor traditional cooking

#### 8. Location Effect (Weight: 0.5)
- **Purpose**: Considers geographic planetary influences
- **Calculation**: Enhanced influence of item's ruling planets at current location
- **Range**: -0.2 to 0.2
- **Data Source**: PlanetaryLocationService

#### 9. Kalchm Resonance (Weight: 0.5)
- **Purpose**: Transformation potential based on Kalchm constant
- **Calculation**: High Kalchm favors fermentation/transformation processes
- **Range**: -0.05 to 0.1
- **Threshold**: Kalchm > 2.0 = positive, < 0.5 = negative

### Tertiary Effects (Lower Impact)

#### 10. Lunar Phase Effect (Weight: 0.4)
- **Purpose**: Aligns item types with lunar energy
- **Calculation**: Different phases favor different item types
- **Range**: -0.05 to 0.25
- **Peak**: Full Moon generally strongest for most items

#### 11. Monica Optimization (Weight: 0.4)
- **Purpose**: Efficiency optimization based on Monica constant
- **Calculation**: High Monica values favor optimization and efficiency
- **Range**: -0.03 to 0.08
- **Application**: Affects cooking method selection

#### 12. Tarot Effect (Weight: 0.3)
- **Purpose**: Future integration with tarot system
- **Calculation**: Currently placeholder with item type affinities
- **Range**: 0.0 to 0.15
- **Status**: Placeholder for future expansion

## Usage Examples

### Basic Usage

```typescript
import { scoreRecommendation, ScoringContext } from './UnifiedScoringService';

const context: ScoringContext = {
  dateTime: new Date(),
  location: {
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York',
    name: 'New York City'
  },
  item: {
    name: 'Basil',
    type: 'ingredient',
    elementalProperties: { Fire: 0.3, Water: 0.1, Earth: 0.2, Air: 0.4 },
    seasonality: ['summer', 'spring'],
    planetaryRulers: ['Mercury', 'Mars']
  }
};

const result = await scoreRecommendation(context);
console.log(`Score: ${result.score} (${result.confidence} confidence)`);
```

### Advanced Usage with Custom Weights

```typescript
const context: ScoringContext = {
  dateTime: new Date(),
  item: {
    name: 'Japanese Cuisine',
    type: 'cuisine',
    elementalProperties: { Fire: 0.15, Water: 0.4, Earth: 0.25, Air: 0.2 },
    planetaryRulers: ['Moon', 'Mercury']
  },
  preferences: {
    culturalPreferences: ['Japanese'],
    intensityPreference: 'mild'
  },
  options: {
    weights: {
      seasonalEffect: 1.2,  // Boost seasonal importance
      locationEffect: 0.8,  // Reduce location importance
      elementalCompatibility: 1.1  // Boost elemental matching
    },
    debugMode: true
  }
};

const result = await scoreRecommendation(context);
```

### Batch Scoring for Comparisons

```typescript
import { UnifiedScoringService } from './UnifiedScoringService';

const service = UnifiedScoringService.getInstance();
const items = [/* array of items */];

const scores = await Promise.all(
  items.map(item => service.scoreRecommendation({ 
    dateTime: new Date(), 
    item 
  }))
);

// Sort by score
const ranked = scores
  .map((result, index) => ({ item: items[index], ...result }))
  .sort((a, b) => b.score - a.score);
```

## Data Sources Integration

### Primary Sources

1. **Astrologize API** (`/api/astrologize`)
   - Real-time planetary positions
   - Aspect calculations
   - Dignity information
   - Confidence: 0.95

2. **Swiss Ephemeris Data**
   - High-precision astronomical calculations
   - Fallback when API unavailable
   - Confidence: 0.7

3. **RealAlchemizeService**
   - Current alchemical state
   - Thermodynamic properties
   - Kalchm and Monica constants

4. **PlanetaryLocationService**
   - Geographic planetary influences
   - Location-based calculations

### Fallback Strategy

```
Astrologize API → Swiss Ephemeris → Minimal Fallback
     (0.95)           (0.7)            (0.1)
```

## Result Structure

```typescript
interface ScoringResult {
  score: number;              // Final score (0-1)
  confidence: number;         // Confidence level (0-1)
  breakdown: ScoringBreakdown; // Individual effect scores
  sources: string[];          // Data sources used
  notes: string[];           // Explanatory notes
  metadata: {
    timestamp: Date;
    location?: GeographicCoordinates;
    dominantEffects: string[]; // Top 3 effects
    warnings: string[];        // Any warnings
  };
}
```

## Performance Considerations

### Caching Strategy

- **Astrological Data**: Cache by date/time/location (1-hour TTL)
- **Alchemical State**: Real-time calculation (no cache)
- **Location Influences**: Cache by coordinates (24-hour TTL)

### Optimization

- **Parallel API Calls**: Multiple effects calculated simultaneously
- **Lazy Loading**: Import scoring modules only when needed
- **Fallback Logic**: Fast degradation when external services fail

## Debugging

### Debug Mode

Enable debug mode for detailed logging:

```typescript
const context: ScoringContext = {
  // ... other properties
  options: {
    debugMode: true
  }
};
```

### Interpreting Results

1. **Score Range**: 0.0 to 1.0 (higher is better)
2. **Confidence**: Data quality indicator
3. **Dominant Effects**: Top 3 influences on the score
4. **Warnings**: Potential issues or low-confidence factors

### Common Issues

- **Low Confidence**: Check data source availability
- **Unexpected Scores**: Review dominant effects and breakdown
- **API Failures**: Check fallback data sources

## Integration with Existing Services

### Migrated Services

1. **AlchemicalRecommendationService**
   - `findCompatibleIngredients()` now uses unified scoring
   - Async method signatures
   - Improved accuracy

### Integration Pattern

```typescript
// Before
const score = oldService.calculateScore(item, state);

// After
const context: ScoringContext = {
  dateTime: new Date(),
  item: transformToScoringItem(item),
  // ... other context
};
const result = await scoreRecommendation(context);
const score = result.score;
```

## Future Enhancements

### Planned Features

1. **Tarot Integration**: Full tarot card system integration
2. **User Learning**: Adaptive weights based on user preferences
3. **Cultural Cuisine Matching**: Enhanced cultural compatibility
4. **Seasonal Transit Database**: More detailed seasonal effects
5. **House System Integration**: Astrological houses consideration

### Extension Points

- **New Scoring Modules**: Add functions to `calculateXxxEffect()`
- **Custom Weights**: User-configurable weight profiles
- **Additional Data Sources**: Weather, market data, etc.
- **Machine Learning**: Pattern recognition for improved scoring

## Best Practices

### For Developers

1. **Always handle async**: Scoring is asynchronous
2. **Check confidence**: Low confidence may need fallback logic
3. **Use debug mode**: During development and troubleshooting
4. **Respect elemental principles**: Fire doesn't oppose Water
5. **Cache results**: When scoring many items simultaneously

### For Content

1. **Provide elemental properties**: Essential for compatibility
2. **Include planetary rulers**: Enables astrological effects
3. **Add seasonality data**: Improves seasonal recommendations
4. **Cultural origins**: Enhances location-based scoring

## Testing

### Unit Tests

```typescript
import { calculateElementalCompatibility } from './UnifiedScoringService';

describe('Elemental Compatibility', () => {
  it('should favor same elements', () => {
    const current = { Fire: 0.8, Water: 0.1, Earth: 0.05, Air: 0.05 };
    const item = { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 };
    
    const score = calculateElementalCompatibility(
      { planetaryPositions: {}, /* ... */ } as any,
      { item: { elementalProperties: item }, /* ... */ } as any
    );
    
    expect(score).toBeGreaterThan(0.1);
  });
});
```

### Integration Tests

Test the full scoring pipeline with realistic data to ensure all components work together correctly.

## Conclusion

The Unified Scoring System provides a robust, extensible foundation for culinary recommendations that honors both astrological principles and practical considerations. Its modular design ensures maintainability while delivering transparent, meaningful results to users. 