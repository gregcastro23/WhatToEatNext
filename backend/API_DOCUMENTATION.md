# WhatToEatNext Backend API Documentation
**Base URL:** `http://localhost:8001`
**Environment:** Python / FastAPI (Mac Mini Docker)

## Endpoints

### `GET /health`
- **Description:** Health Check. Verifies API, Database, and Redis connectivity.
- **Response:** `200 OK`

### `GET /api/me`
- **Description:** Get current authenticated user claims.
- **Auth:** Requires JWT in Authorization header.

### `POST /api/user/onboarding`
- **Description:** Calculate Natal Chart & Alchemical Constitution for a new user.
- **Request Body (OnboardingRequest):**
  - `birth_date`: string (Required, YYYY-MM-DD)
  - `birth_time`: string (Required, HH:MM)
  - `latitude`: number (Required)
  - `longitude`: number (Required)
  - `city_name`: string (Optional)

### `POST /api/recipe-generator`
- **Description:** Generate personalized recipe recommendations based on birth chart.
- **Request Body (RecipeGeneratorRequest):**
  - `birthDate`: string (Required)
  - `birthTime`: string (Required)

### `POST /api/alchemical/quantities`
- **Description:** SEMS calculation for a specific recipe.
- **Request Body:**
  - `recipe`: object
  - `kinetic_rating`: number
  - `planetary_hour_ruler`: string
  - `thermo_rating`: number

### `POST /api/generate-alchemical-image`
- **Description:** Generate a 150-word visual prompt for NanoBananaPro.
- **Request Body:**
  - `name`: string
  - `elementalProperties`: object
  - `monicaScore`: number

### `GET /cuisines/recommend`
- **Description:** Current moment cuisine recommendations.
- **Query Params:** `zodiac_sign`, `season`, `meal_type`.

### `POST /api/astrological/recipe-recommendations-by-chart`
- **Description:** Advanced recommendations based on full birth chart and transits.

### `POST /api/rituals/generate-cooking-instruction`
- **Description:** Dominant transit-based ritual generation.
- **Request Body:**
  - `recipe_id`: string
  - `secondary_chart_ids`: string[] (Optional)

---
**Note:** This documentation reflects the state of the unified backend service running on the Mac Mini.
