# WhatToEatNext API Documentation

**Version:** 1.0.0
**Last Updated:** October 28, 2025

This API provides alchemical culinary recommendations based on real-time astronomical calculations and astrological influences. All endpoints can be called by external frontends connecting to the alchm-kitchen backend.

---

## Base URL

**Local Development:**

```
http://localhost:3000/api
```

**Production:**

```
https://your-domain.com/api
```

---

## Authentication

Currently, no authentication is required. All endpoints are publicly accessible.

---

## API Endpoints

### 1. Get Cuisine Recommendations

Returns personalized cuisine recommendations based on current astrological moment, including nested recipes and sauce pairings.

#### **GET** `/api/cuisines/recommend`

**Description:** Get cuisine recommendations for the current astrological moment.

**Request:**

```bash
curl http://localhost:3000/api/cuisines/recommend
```

**Response:**

```json
{
  "success": true,
  "current_moment": {
    "zodiac_sign": "Scorpio",
    "season": "Autumn",
    "meal_type": "Dinner",
    "timestamp": "2025-10-28T23:30:00.000Z"
  },
  "cuisine_recommendations": [
    {
      "cuisine_id": "italian-001",
      "name": "Italian",
      "description": "Mediterranean cuisine emphasizing fresh ingredients...",
      "elemental_properties": {
        "Fire": 0.3,
        "Water": 0.2,
        "Earth": 0.35,
        "Air": 0.15
      },
      "nested_recipes": [
        {
          "recipe_id": "recipe-001",
          "name": "Margherita Pizza",
          "description": "Classic Neapolitan pizza...",
          "prep_time": "20 min",
          "cook_time": "15 min",
          "servings": 4,
          "difficulty": "Medium",
          "ingredients": [
            {
              "name": "Pizza dough",
              "amount": "500",
              "unit": "g"
            }
          ],
          "instructions": [
            "Preheat oven to 500°F...",
            "Roll out pizza dough..."
          ],
          "meal_type": "Dinner",
          "seasonal_fit": "High - fresh ingredients peak in current season"
        }
      ],
      "recommended_sauces": [
        {
          "sauce_name": "Pesto Genovese",
          "description": "Bright, herbaceous sauce...",
          "key_ingredients": ["Basil", "Pine nuts", "Parmesan"],
          "elemental_properties": {
            "Fire": 0.2,
            "Water": 0.15,
            "Earth": 0.45,
            "Air": 0.2
          },
          "compatibility_score": 0.92,
          "reason": "Earth-dominant profile complements current planetary alignment"
        }
      ],
      "seasonal_context": "Perfect for Autumn - ingredients are at peak freshness",
      "astrological_score": 0.88,
      "compatibility_reason": "Strong Earth element aligns with Scorpio's grounding energy"
    }
  ],
  "total_recommendations": 2,
  "timestamp": "2025-10-28T23:30:00.000Z",
  "metadata": {
    "api_version": "1.0.0",
    "data_source": "local-calculation",
    "can_be_called_externally": true
  }
}
```

#### **POST** `/api/cuisines/recommend`

**Description:** Get cuisine recommendations with custom filters and datetime.

**Request Body:**

```json
{
  "datetime": "2025-12-25T18:00:00.000Z",
  "dietary_restrictions": ["vegetarian", "gluten-free"],
  "preferred_cuisines": ["italian", "mediterranean"]
}
```

**Request:**

```bash
curl -X POST http://localhost:3000/api/cuisines/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "dietary_restrictions": ["vegetarian"],
    "preferred_cuisines": ["italian"]
  }'
```

**Response:** Same structure as GET, with additional field:

```json
{
  "applied_filters": {
    "dietary_restrictions": ["vegetarian"],
    "preferred_cuisines": ["italian"]
  }
}
```

---

### 2. Get Current Moment

Returns the current astrological moment including planetary positions and elemental properties.

#### **GET/POST** `/api/current-moment`

**Description:** Get current planetary positions and alchemical state.

**Request:**

```bash
curl http://localhost:3000/api/current-moment
```

**Response:**

```json
{
  "timestamp": "2025-10-28T23:30:00.000Z",
  "zodiac_sign": "Scorpio",
  "season": "Autumn",
  "planetary_positions": {
    "Sun": {
      "sign": "scorpio",
      "degree": 5,
      "minute": 55,
      "exactLongitude": 215.93,
      "isRetrograde": false
    },
    "Moon": {
      "sign": "virgo",
      "degree": 26,
      "minute": 45,
      "exactLongitude": 176.76,
      "isRetrograde": false
    }
  },
  "elemental_balance": {
    "Fire": 0.25,
    "Water": 0.3,
    "Earth": 0.25,
    "Air": 0.2
  },
  "alchemical_properties": {
    "Spirit": 4,
    "Essence": 7,
    "Matter": 6,
    "Substance": 2
  }
}
```

---

### 3. Get Astrological Positions

Calculate planetary positions for any date/time using the astronomy-engine library.

#### **GET** `/api/astrologize`

**Description:** Get planetary positions for current time.

**Query Parameters:**

- `latitude` (optional): Default 40.7498 (NYC)
- `longitude` (optional): Default -73.7976 (NYC)
- `zodiacSystem` (optional): 'tropical' (default) or 'sidereal'

**Request:**

```bash
curl "http://localhost:3000/api/astrologize?latitude=51.5074&longitude=-0.1278"
```

#### **POST** `/api/astrologize`

**Description:** Get planetary positions for specific date/time.

**Request Body:**

```json
{
  "year": 2025,
  "month": 12,
  "date": 25,
  "hour": 18,
  "minute": 30,
  "latitude": 40.7498,
  "longitude": -73.7976,
  "zodiacSystem": "tropical"
}
```

**Response:**

```json
{
  "_celestialBodies": {
    "sun": {
      "key": "sun",
      "label": "Sun",
      "Sign": {
        "key": "capricorn",
        "zodiac": "capricorn",
        "label": "Capricorn"
      },
      "ChartPosition": {
        "Ecliptic": {
          "DecimalDegrees": 273.45,
          "ArcDegrees": {
            "degrees": 3,
            "minutes": 27,
            "seconds": 0
          }
        }
      },
      "isRetrograde": false
    }
  },
  "birth_info": {
    "year": 2025,
    "month": 12,
    "date": 25,
    "hour": 18,
    "minute": 30,
    "latitude": 40.7498,
    "longitude": -73.7976,
    "ayanamsa": "TROPICAL"
  },
  "metadata": {
    "source": "local-astronomy-engine",
    "timestamp": "2025-10-28T23:30:00.000Z",
    "calculatedAt": "2025-12-25T18:30:00.000Z"
  }
}
```

---

### 4. Get Alchemical Properties

Calculate alchemical properties (ESMS - Spirit, Essence, Matter, Substance) from planetary positions.

#### **GET/POST** `/api/alchemize`

**Description:** Calculate alchemical properties for current or custom moment.

**Request:**

```bash
# GET for current moment
curl http://localhost:3000/api/alchemize

# POST for custom datetime
curl -X POST http://localhost:3000/api/alchemize \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2025,
    "month": 12,
    "date": 25,
    "hour": 18,
    "minute": 30
  }'
```

**Response:**

```json
{
  "success": true,
  "timestamp": "2025-10-28T23:30:00.000Z",
  "request": {
    "useCustomDate": false,
    "customDateTime": null,
    "location": {
      "latitude": 40.7498,
      "longitude": -73.7976
    },
    "zodiacSystem": "tropical"
  },
  "planetaryPositions": {
    "Sun": {
      "sign": "scorpio",
      "degree": 5,
      "minute": 55,
      "exactLongitude": 215.93,
      "isRetrograde": false
    }
  },
  "alchemicalResult": {
    "Spirit": 4,
    "Essence": 7,
    "Matter": 6,
    "Substance": 2,
    "thermodynamic": {
      "heat": 0.45,
      "entropy": 0.62,
      "reactivity": 0.58,
      "gregsEnergy": 0.09,
      "kalchm": 1.23,
      "monica": 0.87
    }
  },
  "metadata": {
    "positionsSource": "api",
    "currentMomentUpdated": true,
    "apiCallId": "alchemize_1730156400000_abc123"
  }
}
```

---

### 5. Health Check

Simple endpoint to verify API is running.

#### **GET** `/api/health`

**Request:**

```bash
curl http://localhost:3000/api/health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-10-28T23:30:00.000Z",
  "version": "1.0.0"
}
```

---

## Data Models

### Elemental Properties

All elements are normalized to sum to 1.0:

```typescript
{
  Fire: number; // 0.0 - 1.0
  Water: number; // 0.0 - 1.0
  Earth: number; // 0.0 - 1.0
  Air: number; // 0.0 - 1.0
}
```

### Alchemical Properties (ESMS)

Spirit, Essence, Matter, Substance - calculated from planetary positions:

```typescript
{
  Spirit: number; // Integer count
  Essence: number; // Integer count
  Matter: number; // Integer count
  Substance: number; // Integer count
}
```

### Thermodynamic Properties

Derived from elemental and alchemical properties:

```typescript
{
  heat: number; // Combined spiritual and fire energy
  entropy: number; // Measure of disorder/volatility
  reactivity: number; // Rate of change potential
  gregsEnergy: number; // Net energy: heat - (entropy × reactivity)
  kalchm: number; // Alchemical equilibrium
  monica: number; // Stability metric
}
```

---

## Integration Examples

### React/Next.js Frontend

```typescript
// Fetch cuisine recommendations
const response = await fetch("/api/cuisines/recommend");
const data = await response.json();

if (data.success) {
  console.log("Current zodiac:", data.current_moment.zodiac_sign);
  console.log("Recommended cuisines:", data.cuisine_recommendations);
}
```

### Node.js Backend

```javascript
const axios = require("axios");

async function getCuisineRecommendations() {
  const response = await axios.get(
    "http://localhost:3000/api/cuisines/recommend",
  );
  return response.data;
}
```

### Python

```python
import requests

def get_cuisine_recommendations():
    response = requests.get('http://localhost:3000/api/cuisines/recommend')
    return response.json()

data = get_cuisine_recommendations()
print(f"Current zodiac: {data['current_moment']['zodiac_sign']}")
```

### External PostgreSQL Backend Integration

```sql
-- Store API response in PostgreSQL
CREATE TABLE cuisine_recommendations (
    id SERIAL PRIMARY KEY,
    zodiac_sign VARCHAR(50),
    season VARCHAR(50),
    cuisine_data JSONB,
    astrological_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert recommendation
INSERT INTO cuisine_recommendations (zodiac_sign, season, cuisine_data, astrological_score)
VALUES ('Scorpio', 'Autumn', '{"name": "Italian", ...}'::jsonb, 0.88);
```

---

## Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information",
  "timestamp": "2025-10-28T23:30:00.000Z"
}
```

HTTP Status Codes:

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. Recommended for production:

- 100 requests per minute per IP
- 1000 requests per hour per IP

---

## CORS

All endpoints support CORS for external frontend integration. Headers included:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

---

## Development Notes

### Local Astronomy Engine

This API uses the `astronomy-engine` library for real-time planetary position calculations. No external API dependencies means:

- ✅ Fast response times
- ✅ No network latency
- ✅ No API rate limits
- ✅ Works offline
- ✅ Highly accurate (VSOP87 model)

### Data Sources

- **Planetary positions:** Calculated locally using astronomy-engine
- **Alchemical mappings:** Based on traditional planetary correspondences
- **Cuisine data:** Currently mock data; in production would query PostgreSQL database

---

## Future Enhancements

1. **Database Integration:** Connect to PostgreSQL for real cuisine/recipe data
2. **User Preferences:** Store user dietary restrictions and preferences
3. **Recommendation History:** Track and learn from user selections
4. **Advanced Filtering:** Multi-dimensional filtering by ingredients, cooking time, difficulty
5. **Recipe Ratings:** User ratings and feedback system
6. **Seasonal Ingredients:** Real-time seasonal ingredient availability
7. **WebSocket Support:** Real-time updates as planetary positions change

---

## Support

For issues or questions:

- GitHub: https://github.com/your-repo/what-to-eat-next
- Email: support@your-domain.com

---

**Generated with Claude Code**
_Alchemical Culinary Intelligence_
