# Planetary Position System Guide

## Overview
The application calculates planetary positions for astrological analysis and food recommendations. The system has multiple fallback mechanisms to ensure reliable data:

1. **Primary Method**: Uses the astronomy-engine to calculate precise positions based on modern astronomical algorithms.
2. **Transit Date Validation**: Validates calculated positions against transit dates stored in planet data files.
3. **Current Position Fallback**: Uses the latest known positions (May 16, 2024) when calculations fail.

## Planetary Transit Validation

The system includes a transit date validation mechanism that:

- Checks calculated planetary positions against known transit dates in each planet's data file
- Corrects any planet's sign if it doesn't match the expected transit period
- Preserves the exact degree within the sign for accuracy
- Recalculates longitude values when signs are corrected
- Provides current positions based on the browser's date when online calculations fail

This ensures that food recommendations always use accurate planetary positions, even when astronomical calculations cannot be performed.

## Adding/Updating Transit Dates

When a planet moves into a new sign, update its transit dates in the corresponding data file:

```javascript
// Example: src/data/planets/mars.ts
TransitDates: {
  'Leo': { 'Start': '2024-05-01', 'End': '2024-06-30' },
  'Virgo': { 'Start': '2024-07-01', 'End': '2024-08-31' }
}
```

## Testing

The planetary position system includes automated tests to verify:
- Correct transit sign detection based on dates
- Position validation and correction
- Fallback position accuracy 