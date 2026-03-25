# 🏺 alchm.kitchen Backend API Specification
**Host:** `http://localhost:8001`  
**Framework:** FastAPI (Python 3.11)

This document specifies the endpoints and data structures for the WhatToEatNext backend service.

---

## 🏥 System Health & Authentication

### `GET /health`
*   **Description:** Health Check to verify service, database, and Redis status.
*   **Responses:**
    *   `200`: `{"status": "healthy", "service": "alchm.kitchen", "version": "2.0.0"}`

### `GET /api/me`
*   **Description:** Returns claims for the currently authenticated user.
*   **Authentication:** Requires a valid JWT in the Authorization header.
*   **Responses:**
    *   `200`: Successful Response (User object)
    *   `401`: Unauthorized

---

## 🔮 Astrological & Alchemical Services

### `POST /api/user/onboarding`
*   **Description:** Onboards a user by calculating their Natal Chart and Alchemical Constitution.
*   **Request Body (OnboardingRequest):**
    ```json
    {
      "birth_date": "string (YYYY-MM-DD)",
      "birth_time": "string (HH:MM)",
      "latitude": "number",
      "longitude": "number",
      "city_name": "string (Optional)",
      "state_country": "string (Optional)"
    }
    ```
*   **Responses:**
    *   `200`: Successful Response (Profile + Alchemical Stats)
    *   `422`: Validation Error

### `POST /api/recipe-generator`
*   **Description:** Generates personalized recipe recommendations based on the user's birth chart.
*   **Request Body (RecipeGeneratorRequest):**
    ```json
    {
      "birthDate": "string (YYYY-MM-DD)",
      "birthTime": "string (HH:MM)"
    }
    ```
*   **Responses:**
    *   `200`: Returns `ChartSummary` and a list of `recommendations`.

---

## 🍳 Culinary Matching & Recommendations

### `GET /cuisines/recommend`
*   **Description:** Recommends cuisines based on the current astrological moment or provided parameters.
*   **Query Parameters:**
    *   `zodiac_sign`: `string` (Optional - e.g., "Aries")
    *   `season`: `string` (Optional - e.g., "Spring")
    *   `meal_type`: `string` (Optional - e.g., "dinner")
*   **Responses:**
    *   `200`: List of cuisines with compatibility scores and nested recipes.

### `POST /recommend/recipes`
*   **Description:** Returns specific recipes from the database matched to the user's elemental balance.
*   **Request Body (RecommendationRequest):**
    ```json
    {
      "current_time": "string (ISO)",
      "current_elements": "ElementalProperties (Object)",
      "cuisine_preferences": "string[]",
      "dietary_restrictions": "string[]",
      "limit": "number (default: 10)"
    }
    ```

---

## 🎨 Visuals & Rituals

### `POST /api/generate-alchemical-image`
*   **Description:** Generates an alchemical visual prompt and bridges to the NanoBananaPro engine.
*   **Responses:**
    *   `200`: Returns `url` and the 150-word `prompt`.

### `POST /api/rituals/generate-cooking-instruction`
*   **Description:** Generates a custom cooking ritual based on the dominant transit (e.g., "Stir clockwise under the influence of Mars").

---

## 🧬 Schemas (Data Models)

### `ElementalProperties`
```json
{
  "Fire": "float (0.0 - 1.0)",
  "Water": "float (0.0 - 1.0)",
  "Earth": "float (0.0 - 1.0)",
  "Air": "float (0.0 - 1.0)"
}
```

### `ChartSummary`
```json
{
  "sunSign": "string",
  "moonSign": "string",
  "ascendant": "string",
  "celestialBodies": "Object"
}
```
