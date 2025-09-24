# 🌙 Current Moment Management System

## Overview

The Current Moment Management System provides centralized, automated updating of
planetary positions across all storage locations in the WhatToEatNext project.
When any alchemize or astrologize API is called, the system automatically
updates all position storage files to maintain consistency and accuracy.

## Key Features

✅ **Centralized Management**: Single source of truth for current planetary
positions  
✅ **Automatic Updates**: All APIs trigger position updates across the entire
system  
✅ **Multi-Format Support**: Updates positions in different file formats
automatically  
✅ **Notebook Integration**: Keeps `current-moment-chart.ipynb` synchronized  
✅ **Fallback Safety**: Graceful degradation when APIs fail  
✅ **Comprehensive Logging**: Full audit trail of all updates

## Architecture

### Core Components

1. **CurrentMomentManager** (`src/services/CurrentMomentManager.ts`)
   - Central service managing all position updates
   - Handles API calls, data formatting, and file updates
   - Provides caching and error handling

2. **API Integration**
   - `/api/alchemize` - New endpoint for alchemical calculations
   - `/api/astrologize` - Enhanced with auto-update functionality
   - `/api/current-moment` - Management and status endpoint

3. **Auto-Updated Files**
   - `current-moment-chart.ipynb` - Jupyter notebook with latest positions
   - `src/constants/systemDefaults.ts` - TypeScript defaults
   - `src/utils/streamlinedPlanetaryPositions.ts` - Streamlined utilities
   - `src/utils/accurateAstronomy.ts` - Astronomy calculations
   - `src/utils/astronomiaCalculator.ts` - Calculator utilities

## API Endpoints

### `/api/alchemize` - NEW!

Calculate alchemical properties with automatic position updates.

**GET Request (Current Time)**

```
GET /api/alchemize?latitude=40.7498&longitude=-73.7976&zodiacSystem=tropical
```

**POST Request (Custom Time)**

```json
{
  "year": 2025,
  "month": 1,
  "date": 3,
  "hour": 14,
  "minute": 30,
  "latitude": 40.7498,
  "longitude": -73.7976,
  "zodiacSystem": "tropical"
}
```

**Response**

```json
{
  "success": true,
  "timestamp": "2025-01-03T19:30:00.000Z",
  "request": {
    "useCustomDate": true,
    "customDateTime": "2025-01-03T19:30:00.000Z",
    "location": { "latitude": 40.7498, "longitude": -73.7976 },
    "zodiacSystem": "tropical"
  },
  "planetaryPositions": {
    "Sun": { "sign": "capricorn", "degree": 13, "minute": 25, "exactLongitude": 283.42, "isRetrograde": false },
    // ... other planets
  },
  "alchemicalResult": {
    "heat": 0.156,
    "entropy": 0.234,
    "reactivity": 0.891,
    "gregsEnergy": 0.067,
    "kalchm": 2.34,
    "monica": 1.56
  },
  "metadata": {
    "positionsSource": "api",
    "currentMomentUpdated": true,
    "apiCallId": "alchemize_1704301800000_abc123def"
  }
}
```

### `/api/astrologize` - ENHANCED!

Now automatically updates current moment data when called.

Same API as before, but now triggers position updates across all storage
locations.

### `/api/current-moment` - NEW!

Management and status endpoint for the Current Moment system.

**GET Request (Status Check)**

```
GET /api/current-moment
GET /api/current-moment?refresh=true  # Force refresh
```

**POST Request (Manual Update)**

```json
{
  "action": "update",
  "customDateTime": "2025-01-03T19:30:00.000Z",  // Optional
  "latitude": 40.7498,                            // Optional
  "longitude": -73.7976                           // Optional
}
```

**Response**

```json
{
  "success": true,
  "action": "update",
  "timestamp": "2025-01-03T19:30:00.000Z",
  "message": "Current moment updated successfully",
  "currentMoment": {
    "timestamp": "2025-01-03T19:30:00.000Z",
    "date": "January 3, 2025 at 2:30 PM EST",
    "location": {
      "latitude": 40.7498,
      "longitude": -73.7976,
      "timezone": "EST"
    },
    "planetaryPositions": { /* ... */ },
    "metadata": {
      "source": "api",
      "apiCallTimestamp": "2025-01-03T19:30:00.000Z",
      "lastUpdated": "2025-01-03T19:30:00.000Z"
    }
  },
  "updatedFiles": [
    "current-moment-chart.ipynb",
    "src/constants/systemDefaults.ts",
    "src/utils/streamlinedPlanetaryPositions.ts",
    "src/utils/accurateAstronomy.ts",
    "src/utils/astronomiaCalculator.ts"
  ]
}
```

## Usage Examples

### 1. Get Current Alchemical Properties

```bash
curl "http://localhost:3000/api/alchemize"
```

### 2. Calculate for Specific Date/Time

```bash
curl -X POST "http://localhost:3000/api/alchemize" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2025,
    "month": 1,
    "date": 3,
    "hour": 14,
    "minute": 30,
    "latitude": 40.7498,
    "longitude": -73.7976
  }'
```

### 3. Check Current Moment Status

```bash
curl "http://localhost:3000/api/current-moment"
```

### 4. Force Update All Files

```bash
curl -X POST "http://localhost:3000/api/current-moment" \
  -H "Content-Type: application/json" \
  -d '{"action": "update"}'
```

### 5. Update for Custom Date/Location

```bash
curl -X POST "http://localhost:3000/api/current-moment" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update",
    "customDateTime": "2025-01-03T19:30:00.000Z",
    "latitude": 51.5074,
    "longitude": -0.1278
  }'
```

## File Update Details

### Jupyter Notebook (`current-moment-chart.ipynb`)

- Updates `live_positions` dictionary with current data
- Refreshes timestamp and metadata comments
- Maintains Python format for data analysis

### TypeScript Files

- **systemDefaults.ts**: Updates `DEFAULT_PLANETARY_POSITIONS` constant
- **streamlinedPlanetaryPositions.ts**: Updates `basePositions` object
- **accurateAstronomy.ts**: Updates `REFERENCE_POSITIONS` and `REFERENCE_DATE`
- **astronomiaCalculator.ts**: Updates `CURRENT_POSITIONS` constant

### Data Formats

Each file receives the same planetary data but formatted appropriately:

- **Notebook**: Python dictionary with elements and retrograde flags
- **TypeScript**: Typed objects with proper ZodiacSign casting
- **Calculator**: Lowercase keys with exact longitude calculations

## Benefits

### 🔄 **Consistency**

- All position storage locations stay synchronized
- No more manual updating of multiple files
- Single source of truth for current positions

### ⚡ **Real-Time**

- Positions update automatically when APIs are called
- Fresh data for all calculations
- Reduced stale data issues

### 🛡️ **Reliability**

- Fallback positions when APIs fail
- Graceful error handling
- Comprehensive logging

### 🔧 **Maintainability**

- Centralized position management logic
- Easy to add new storage locations
- Clear separation of concerns

## Error Handling

The system includes comprehensive error handling:

1. **API Failures**: Falls back to default positions
2. **File Update Failures**: Logs errors but doesn't fail entire request
3. **Format Errors**: Validates data before updates
4. **Network Issues**: Circuit breaker pattern with timeouts

## Logging

All operations are logged with appropriate levels:

- **INFO**: Successful updates and API calls
- **WARN**: Non-critical failures (file update issues)
- **ERROR**: Critical failures (API errors, data corruption)

## Monitoring

Check system health via:

```bash
curl "http://localhost:3000/api/current-moment" | jq '.status'
```

Returns:

```json
{
  "isDataFresh": true,
  "lastUpdated": "2025-01-03T19:30:00.000Z",
  "source": "api",
  "locationCount": 11
}
```

## Development Notes

### Adding New Storage Locations

To add a new file to the update process:

1. Add update method to `CurrentMomentManager` class
2. Include in `propagateUpdates()` method
3. Create appropriate formatting function
4. Test with dry-run functionality

### Customizing Position Formats

Each file type has its own formatting function in `CurrentMomentManager`:

- `formatPositionsForNotebook()` - Python dictionary format
- `formatPositionsForSystemDefaults()` - TypeScript with types
- `formatPositionsForStreamlined()` - Simple object format
- etc.

## Testing

Use the management API to test the system:

```bash
# Test current moment retrieval
curl "http://localhost:3000/api/current-moment"

# Test manual update
curl -X POST "http://localhost:3000/api/current-moment" \
  -H "Content-Type: application/json" \
  -d '{"action": "update"}'

# Test alchemize integration
curl "http://localhost:3000/api/alchemize"
```

## Migration Complete

✅ **Before**: 10+ files with different position data from different dates  
✅ **After**: All files automatically synchronized with latest positions  
✅ **Integration**: APIs automatically trigger updates  
✅ **Maintenance**: Single service manages all position data

The system is now optimized for accurate, real-time planetary position
management!
