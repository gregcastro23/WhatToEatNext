# Astrologize API Integration

This project now integrates with the astrologize API to get real-time planetary
positions for enhanced alchemical calculations. This replaces static/hardcoded
planetary data with live astronomical data.

## 🌟 Features

- **Real-time planetary positions** for all 10 planets (Sun through Pluto)
- **Automatic fallback** to local calculations if API is unavailable
- **Location-based calculations** with custom latitude/longitude
- **React hooks** for easy integration in components
- **Caching** to avoid excessive API calls
- **Real-time Kalchm & Monica constant calculations** using live planetary data

## 🔧 API Endpoint

The integration uses the astrologize API at:

```
https://alchm-backend.onrender.com/astrologize
```

## 📁 Files Added/Modified

### New Files:

- `src/services/astrologizeApi.ts` - Main API integration service
- `src/hooks/useRealtimePlanetaryPositions.ts` - React hooks for components
- `src/components/RealtimeAlchemicalCalculator.tsx` - Demo component
- `test-astrologize-integration.js` - Test script

### Modified Files:

- `src/app/api/planetary-positions/route.ts` - Updated to use astrologize API
- `src/utils/astrologyUtils.ts` - Enhanced with real-time data option

## 🚀 Usage Examples

### 1. Basic API Usage

```typescript
import {
  getCurrentPlanetaryPositions,
  getPlanetaryPositionsForDateTime,
} from "@/services/astrologizeApi";

// Get current planetary positions
const currentPositions = await getCurrentPlanetaryPositions();

// Get positions for specific date/time/location
const customPositions = await getPlanetaryPositionsForDateTime(
  new Date("2025-01-09"),
  { latitude: 40.7498, longitude: -73.7976 },
);
```

### 2. React Hook Usage

```typescript
import { useRealtimePlanetaryPositions } from '@/hooks/useRealtimePlanetaryPositions';

function MyComponent() {
  const {
    positions,
    loading,
    error,
    isRealtime,
    isConnected,
    refresh
  } = useRealtimePlanetaryPositions({
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    location: { latitude: 40.7498, longitude: -73.7976 }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>Current Planets ({isRealtime ? 'Real-time' : 'Cached'})</h3>
      {Object.entries(positions || {}).map(([planet, position]) => (
        <div key={planet}>
          {planet}: {position.sign} {position.degree}°{position.minute}'
        </div>
      ))}
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

### 3. API Endpoint Usage

```javascript
// GET current positions
fetch("/api/planetary-positions")
  .then((res) => res.json())
  .then((data) => {
    console.log("Positions:", data.positions);
    console.log("Source:", data.source); // 'astrologize-api-realtime' or fallback
  });

// POST for specific date/location
fetch("/api/planetary-positions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    date: "2025-01-09T15:30:00Z",
    latitude: 40.7498,
    longitude: -73.7976,
  }),
});
```

### 4. Alchemical Calculations with Real-time Data

```typescript
import { useRealtimePlanetaryPositions } from '@/hooks/useRealtimePlanetaryPositions';

function AlchemicalCalculator() {
  const { positions } = useRealtimePlanetaryPositions();

  if (!positions) return null;

  // Convert to elemental properties
  const elementCounts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  Object.values(positions).forEach(position => {
    const element = getElementFromSign(position.sign);
    elementCounts[element]++;
  });

  // Your Kalchm/Monica calculations here...
  const spirit = elementCounts.Fire + Math.round(elementCounts.Air * 0.7);
  const essence = elementCounts.Water + Math.round(elementCounts.Earth * 0.5);
  // ... rest of calculations

  return <div>Real-time alchemical state...</div>;
}
```

## 🧪 Testing

Run the test script to verify integration:

```bash
node test-astrologize-integration.js
```

This will:

1. Test the astrologize API directly
2. Test your local API endpoints (if server is running)
3. Verify data format compatibility
4. Show elemental analysis for alchemical calculations

## 📊 Data Format

The API returns planetary positions in this format:

```typescript
{
  "Sun": {
    "sign": "cancer",
    "degree": 10,
    "minute": 44,
    "exactLongitude": 100.73,
    "isRetrograde": false
  },
  "Moon": {
    "sign": "libra",
    "degree": 5,
    "minute": 40,
    "exactLongitude": 185.67,
    "isRetrograde": false
  }
  // ... other planets
}
```

## ⚙️ Configuration

### Default Location

The default location is set to New York City:

```typescript
const DEFAULT_LOCATION = {
  latitude: 40.7498,
  longitude: -73.7976,
};
```

### Cache Settings

- **Cache duration**: 5 minutes for real-time data
- **Refresh interval**: 5 minutes (configurable)
- **Fallback**: Automatic fallback to local calculations

### Error Handling

The system gracefully handles:

- API unavailability (falls back to local calculations)
- Network errors (cached data used)
- Invalid responses (default positions used)

## 🔄 Integration with Existing System

The integration is designed to be non-breaking:

1. **Existing code continues to work** - your existing
   `calculatePlanetaryPositions()` calls now automatically try the real-time API
   first
2. **Fallback protection** - if the API fails, it falls back to your existing
   calculations
3. **Same data format** - the API data is converted to match your existing
   `PlanetPosition` interface

## 🌍 Location-Based Calculations

You can specify custom locations for more accurate calculations:

```typescript
const positions = await getCurrentPlanetaryPositions({
  latitude: 51.5074, // London
  longitude: -0.1278,
});
```

This affects:

- House calculations
- Rising sign (Ascendant)
- Local planetary aspects

## 🎯 Integration with Your Kalchm System

The real-time planetary data feeds directly into your alchemical calculations:

1. **Planetary positions** → **Elemental distribution**
2. **Elemental distribution** → **Spirit, Essence, Matter, Substance values**
3. **Alchemical values** → **Heat, Entropy, Reactivity calculations**
4. **Thermodynamic metrics** → **Kalchm and Monica constants**

This creates a dynamic system where your alchemical calculations update
automatically based on real astronomical conditions.

## 🚀 Next Steps

1. **Start your development server**: `yarn dev`
2. **Test the integration**: Visit `/api/planetary-positions`
3. **Add the component**: Use `RealtimeAlchemicalCalculator` in your app
4. **Customize the mapping**: Adjust how planetary positions convert to
   alchemical values
5. **Enhance the calculations**: Add more sophisticated astrological factors

## 🔍 Monitoring

Monitor the integration through:

- Console logs showing data source (`astrologize-api-realtime` vs fallbacks)
- Connection status indicators in the UI
- Last updated timestamps
- Error notifications for failed API calls

The system is designed to be reliable and always provide meaningful astrological
data for your alchemical calculations, whether from real-time sources or
carefully calibrated fallbacks.
