# Planetary Agents Backend Integration

**Date**: September 24, 2025
**Status**: ✅ Complete and Functional

## 🎯 Overview

Successfully integrated the Planetary Agents Backend (running on port 8000) with the WhatToEatNext frontend to provide real-time celestial data for enhanced food recommendations.

## 📊 What We Accomplished

### 1. Backend Connection

- **Backend URL**: http://localhost:8000
- **Status**: ✅ Connected and operational
- **Available Endpoints**:
  - `/api/planetary/current-hour` - Real-time planetary hour data
  - `/api/planetary/forecast` - 24-hour planetary predictions
  - `/api/kinetics/*` - Kinetics calculations
  - `/api/alchemy/*` - Alchemical transformations

### 2. Data We're Getting From Backend

From the NYC test call, we successfully retrieve:

```json
{
  "planet": "Mercury",
  "dayType": "night",
  "hourIndex": 14,
  "modifiers": {
    "Spirit": 0.2,
    "Air": 0.3,
    "substance": 0.1
  },
  "startTime": "2025-09-24T04:52:30.000Z",
  "endTime": "2025-09-24T05:53:15.000Z"
}
```

This provides:

- **Current planetary ruler** (Mercury, Sun, Moon, etc.)
- **Elemental modifiers** for alchemical properties
- **Timing windows** for optimal food preparation
- **Day/Night designation** for energy calculations

### 3. Architecture Components

#### A. PlanetaryAgentsAdapter (`src/services/PlanetaryAgentsAdapter.ts`)

- Transforms planetary backend responses into kinetics-compatible format
- Handles API calls to `/api/planetary/*` endpoints
- Generates power predictions for 24-hour forecasts
- Maps planetary hours to elemental totals
- Creates resonance nodes for visualization

#### B. PlanetaryKineticsClient (Updated)

- Now uses PlanetaryAgentsAdapter for real backend data
- Maintains caching and request deduplication
- Provides fallbacks when backend is offline
- Supports group dynamics calculations

#### C. Visual Components

**PlanetaryPowerWidget** (`src/components/PlanetaryPowerWidget.tsx`)

- Real-time planetary hour display with symbols (☉ ☽ ☿ ♀ ♂ ♃ ♄)
- Power level indicator (0-100%)
- Elemental balance visualization
- Compact mode for headers/sidebars
- Location-aware calculations

**PlanetaryFoodRecommendations** (`src/components/PlanetaryFoodRecommendations.tsx`)

- Cuisine recommendations based on current planetary hour
- Cooking method suggestions aligned with celestial energy
- Ingredient recommendations harmonized with elements
- Temporal insights for optimal meal timing
- Aspect phase guidance (applying/exact/separating)

### 4. Planetary-Food Mappings

We've implemented comprehensive mappings:

| Planet  | Elements       | Cuisines                        | Cooking Methods              |
| ------- | -------------- | ------------------------------- | ---------------------------- |
| Sun     | Fire, Spirit   | Italian, Indian, Mexican        | Grilling, Roasting, Flambé   |
| Moon    | Water, Essence | Japanese, Thai, French          | Steaming, Poaching, Braising |
| Mercury | Air, Spirit    | Chinese, Vietnamese, Greek      | Stir-frying, Quick Sauté     |
| Venus   | Earth, Water   | French, Italian, Middle-Eastern | Baking, Caramelizing         |
| Mars    | Fire, Matter   | Mexican, Indian, Korean         | Grilling, Smoking, High-heat |
| Jupiter | Fire, Air      | Mediterranean, Indian, American | Roasting, Baking, Fermenting |
| Saturn  | Earth, Matter  | German, Russian, Ethiopian      | Slow-roasting, Preserving    |

### 5. React Hook Integration

**usePlanetaryKinetics** (`src/hooks/usePlanetaryKinetics.ts`)

Provides:

- `kinetics` - Full planetary data response
- `currentPowerLevel` - Real-time power percentage
- `dominantElement` - Current strongest element (Fire/Water/Earth/Air)
- `seasonalInfluence` - Season-based modifications
- `temporalRecommendations` - Time-based food suggestions
- `refreshKinetics()` - Manual data refresh
- `checkHealth()` - Backend health monitoring

## 🚀 Usage Examples

### Basic Widget Integration

```tsx
import PlanetaryPowerWidget from '@/components/PlanetaryPowerWidget';

// Full display
<PlanetaryPowerWidget />

// Compact for header
<PlanetaryPowerWidget compact />

// Specific location
<PlanetaryPowerWidget location={{ lat: 40.7128, lon: -74.0060 }} />
```

### Food Recommendations

```tsx
import PlanetaryFoodRecommendations from '@/components/PlanetaryFoodRecommendations';

// General recommendations
<PlanetaryFoodRecommendations />

// Filtered by cuisine preference
<PlanetaryFoodRecommendations
  cuisinePreferences={['Italian', 'French']}
/>
```

### Direct Hook Usage

```tsx
import { usePlanetaryKinetics } from "@/hooks/usePlanetaryKinetics";

const MyComponent = () => {
  const { currentPowerLevel, dominantElement, kinetics, refreshKinetics } =
    usePlanetaryKinetics({
      location: { lat: 40.7128, lon: -74.006 },
      updateInterval: 300000, // 5 minutes
      enableAutoUpdate: true,
    });

  return (
    <div>
      <h3>Power: {(currentPowerLevel * 100).toFixed(0)}%</h3>
      <p>Element: {dominantElement}</p>
      <button onClick={refreshKinetics}>Refresh</button>
    </div>
  );
};
```

## 🔧 Environment Configuration

Added to `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_PLANETARY_KINETICS_URL=http://localhost:8000
```

## 📱 Demo Pages

### Test Page: `/test-planetary`

- Backend connection diagnostics
- Raw data visualization
- Health check monitoring
- Manual refresh controls

### Demo Page: `/planetary-demo`

- Full widget showcase
- Multiple location examples
- Cuisine-specific recommendations
- Integration code examples
- Compact vs. full display modes

## 🎨 Visual Features

1. **Planetary Symbols**: ☉ (Sun), ☽ (Moon), ☿ (Mercury), ♀ (Venus), ♂ (Mars), ♃ (Jupiter), ♄ (Saturn)
2. **Power Indicators**: Color-coded bars (green=high, yellow=medium, red=low)
3. **Elemental Charts**: Mini bar charts showing Fire/Water/Earth/Air balance
4. **Seasonal Badges**: Current season display
5. **Timing Indicators**: Next transition times and planetary sequence

## 🔮 Data Flow

1. **Backend** (Port 8000) → Planetary calculations with astronomical accuracy
2. **Adapter** → Transforms to kinetics-compatible format
3. **Client** → Caches and manages requests
4. **Hook** → Provides React-friendly interface
5. **Components** → Visual display with auto-updates

## ⚡ Performance Features

- **Caching**: 5-minute TTL reduces backend calls
- **Request Deduplication**: Prevents duplicate simultaneous requests
- **Fallback Data**: Graceful degradation when backend offline
- **Auto-updates**: Configurable intervals (default 5 minutes)
- **Lazy Loading**: Components only fetch when mounted

## 🎯 Integration Benefits

1. **Real-time Accuracy**: Live planetary positions vs. static calculations
2. **Reduced Frontend Load**: Complex astronomical calculations offloaded to backend
3. **Enhanced Recommendations**: Celestial timing improves food harmony
4. **Scalability**: Backend can serve multiple frontend instances
5. **Flexibility**: Easy to add new planetary features

## 📈 Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] User-specific planetary birth charts
- [ ] Group dining optimization with multiple users
- [ ] Advanced aspect calculations (conjunctions, trines, squares)
- [ ] Historical planetary data for recipe analysis
- [ ] Lunar phase integration for preservation recommendations

## 🔍 Testing Recommendations

1. **Verify Backend**: `curl http://localhost:8000/`
2. **Test Current Hour**: `curl -X POST http://localhost:8000/api/planetary/current-hour -H "Content-Type: application/json" -d '{"location":{"lat":40.7128,"lon":-74.0060}}'`
3. **Visit Demo Page**: http://localhost:3001/planetary-demo
4. **Check Test Page**: http://localhost:3001/test-planetary

## ✅ Success Metrics

- ✅ Backend connectivity established
- ✅ Real-time data flowing to frontend
- ✅ Planetary calculations accurate
- ✅ Components rendering with live data
- ✅ Caching reducing redundant requests
- ✅ Fallbacks working when offline
- ✅ Multiple locations supported
- ✅ Cuisine filtering operational
- ✅ Timing recommendations active

## 🎉 Conclusion

The Planetary Agents Backend is now fully integrated, providing real-time celestial data that enhances food recommendations with astronomical precision. The system is production-ready with proper error handling, caching, and visual feedback.

Access the demo at: **http://localhost:3001/planetary-demo**
