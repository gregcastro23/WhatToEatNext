"""
alchm.kitchen - Unified Backend Service
Handles recipe recommendations, alchemical calculations, and astrological insights
Phase 1 Infrastructure Migration - September 26, 2025

Architecture:
- Calls Render alchemize API for planetary calculations
- Provides unified API for frontend
- Manages PostgreSQL database for recipes and recommendations
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import random
import httpx
import asyncio
from sqlalchemy.orm import Session
from sqlalchemy import text

# Add parent directory to path for database imports
import sys
import os


# Database imports
from database import get_db, Recipe, Ingredient, Recommendation, SystemMetric, ElementalProperties, ZodiacAffinity, SeasonalAssociation, TransitHistory, SavedChart

# New Auth Middleware import
from backend.alchm_kitchen.auth_middleware import get_current_user

from alchm_kitchen.recipe_generator import get_astrological_recipes
try:
    import swisseph as swe
except ImportError:
    swe = None


# Lunar Engine import
from backend.utils.lunar_engine import get_current_lunar_phase, get_lunar_modifier
# Seasonal Engine import
from backend.utils.seasonal_engine import get_seasonal_modifiers
# Transit Engine import
from backend.utils.transit_engine import get_transit_details, get_cooking_ritual, calculate_total_potency_score, get_planetary_hour
# Lunar Oracle import
from backend.utils.lunar_oracle import get_optimal_cooking_windows
# Alchemical Quantities import
from backend.utils.alchemical_quantities import calculate_alchemical_quantities
# Wellness Analytics import
from backend.utils.wellness_analytics import analyze_alchemical_balance
# Transmutation Oracle import
from backend.utils.transmutation_oracle import TransmutationOracle
# Collective Synastry Engine import
from backend.utils.collective_engine import ChartData, CollectiveSynastryEngine # New imports
# Centralized celestial config
from backend.config.celestial_config import FOREST_HILLS_COORDINATES, USER_BIRTH_DATA

# External data imports for cuisine and sauce recommendations


# Import cuisine data (we'll need to handle this carefully)
try:
    from src.data.cuisines import cuisines
    CUISINES_AVAILABLE = True
except ImportError:
    CUISINES_AVAILABLE = False
    cuisines = {}

try:
    from src.data.sauces import allSauces
    SAUCES_AVAILABLE = True
except ImportError:
    SAUCES_AVAILABLE = False
    allSauces = {}

# Configuration for external APIs
ALCHEMIZE_API_URL = os.getenv("ALCHEMIZE_API_URL", "https://alchmize.onrender.com/api/alchemize")
# Fallback URL if the above doesn't work
ALCHEMIZE_API_URL_FALLBACK = os.getenv("ALCHEMIZE_API_URL", "https://alchmize.onrender.com")
PLANETARY_AGENTS_URL = os.getenv("PLANETARY_AGENTS_URL", "http://localhost:8000")

# Helper function for logging system metrics
async def log_system_metric(db: Session, name: str, value: float, unit: str = None, tags: Dict[str, Any] = None):
    """Log a system metric to the database."""
    try:
        metric = SystemMetric(
            metric_name=name,
            metric_value=value,
            metric_unit=unit,
            tags=tags or {}
        )
        db.add(metric)
        db.commit()
    except Exception as e:
        # Log error but don't fail the main operation
        print(f"Failed to log system metric {name}: {e}")

app = FastAPI(
    title="alchm.kitchen - Unified Backend API",
    description="Unified backend for recipe recommendations and alchemical calculations",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ==========================================
# PROTECTED USER ROUTE
# ==========================================

@app.get("/api/me")
async def get_me(user: dict = Depends(get_current_user)):
    """
    A protected route that returns the claims of the authenticated user.
    If the user is not authenticated, the get_current_user dependency
    will raise an HTTPException.
    """
    return user

# ... (previous imports)
from backend.utils.natal_alchemy import calculate_natal_alchemical_quantities

class OnboardingRequest(BaseModel):
    birth_date: str # YYYY-MM-DD
    birth_time: str # HH:MM
    latitude: float
    longitude: float
    city_name: Optional[str] = "Unknown Location"

@app.post("/api/user/onboarding")
async def user_onboarding(
    data: OnboardingRequest,
    user: dict = Depends(get_current_user)
):
    """
    Onboard a user: Calculate their Natal Chart and Alchemical Constitution.
    """
    try:
        # Parse date and time
        b_date = datetime.strptime(data.birth_date, "%Y-%m-%d")
        b_time = datetime.strptime(data.birth_time, "%H:%M")
        
        # Calculate Planetary Positions
        chart_data = calculate_planetary_positions_swisseph(
            b_date.year, b_date.month, b_date.day,
            b_time.hour, b_time.minute
        )
        
        if not chart_data or "positions" not in chart_data:
             raise HTTPException(status_code=500, detail="Failed to calculate natal chart")
             
        # Calculate Alchemical Quantities
        alchemy_stats = calculate_natal_alchemical_quantities(chart_data["positions"])
        
        # Return the comprehensive profile
        return {
            "user_id": user.get("sub"),
            "birth_data": data.dict(),
            "natal_chart": chart_data["positions"],
            "alchemical_quantities": alchemy_stats,
            "message": "Onboarding successful. Welcome, Alchemist."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Onboarding failed: {str(e)}")

# ==========================================
# LOCAL ALCHEMICAL CALCULATION ENDPOINT
# ==========================================

class AlchemicalQuantitiesRequest(BaseModel):
    recipe: Dict[str, Any]
    kinetic_rating: float
    planetary_hour_ruler: str
    thermo_rating: float

@app.post("/api/alchemical/quantities")
async def calculate_alchemical_quantities_endpoint(request: AlchemicalQuantitiesRequest):
    """
    Calculate Alchemical Quantities (Spirit, Essence, Matter, Substance)
    using the local backend logic.
    """
    try:
        # Create a simple object to match the interface expected by the utility
        class RecipeObj:
            def __init__(self, data):
                self.elementalProperties = data.get('elementalProperties', {})
                self.nutritional_profile = data.get('nutritional_profile', {})

        recipe_obj = RecipeObj(request.recipe)
        
        result = calculate_alchemical_quantities(
            recipe_obj,
            request.kinetic_rating,
            request.planetary_hour_ruler,
            request.thermo_rating
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation failed: {str(e)}")



# ==========================================
# ALCHEMICAL CALCULATIONS (via Render API)
# ==========================================

class AlchemizeRequest(BaseModel):
    year: Optional[int] = None
    month: Optional[int] = None  # 1-indexed (January = 1, February = 2, etc.)
    date: Optional[int] = None
    hour: Optional[int] = None
    minute: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    zodiacSystem: Optional[str] = 'tropical'  # 'tropical' | 'sidereal'
    planetaryPositions: Optional[Dict[str, Any]] = None

class AlchemizeResponse(BaseModel):
    elementalProperties: Dict[str, float]
    thermodynamicProperties: Dict[str, float]
    esms: Dict[str, float]
    kalchm: float
    monica: float
    score: float
    normalized: bool
    confidence: float
    metadata: Dict[str, Any]

async def call_render_alchemize_api(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Call the Render alchemize API for planetary calculations."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Try primary URL first
        urls_to_try = [ALCHEMIZE_API_URL, ALCHEMIZE_API_URL_FALLBACK]

        for url in urls_to_try:
            try:
                response = await client.post(url, json=request_data)
                response.raise_for_status()
                return response.json()
            except (httpx.RequestError, httpx.HTTPStatusError) as e:
                print(f"Failed to call {url}: {e}")
                continue

        # If both URLs fail, raise an error
        raise HTTPException(status_code=503, detail=f"Failed to call alchemize API after trying {len(urls_to_try)} URLs")

@app.post("/alchemize", response_model=AlchemizeResponse)
async def alchemize_current_moment(request: AlchemizeRequest):
    """Get current alchemical state from Render API."""
    try:
        request_data = request.model_dump(exclude_unset=True)
        result = await call_render_alchemize_api(request_data)

        # Transform response to match our interface
        return AlchemizeResponse(
            elementalProperties=result.get('elementalProperties', {}),
            thermodynamicProperties=result.get('thermodynamicProperties', {}),
            esms=result.get('esms', {}),
            kalchm=result.get('kalchm', 0),
            monica=result.get('monica', 0),
            score=result.get('score', 0),
            normalized=result.get('normalized', False),
            confidence=result.get('confidence', 0),
            metadata=result.get('metadata', {})
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alchemical calculation failed: {str(e)}")

@app.get("/planetary/current")
async def get_current_planetary_positions():
    """Get current planetary positions via Render API."""
    try:
        # Call with current moment (no date specified)
        result = await call_render_alchemize_api({})
        return {
            "planetary_positions": result.get('planetaryPositions', {}),
            "timestamp": datetime.now().isoformat(),
            "source": "render_alchemize_api"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get planetary positions: {str(e)}")

# ==========================================
# PLANETARY CALCULATIONS
# ==========================================
from backend.utils.celestial_calculations import (
    calculate_planetary_positions_swisseph,
    calculate_planetary_positions_pyephem
)



class PlanetaryPositionsRequest(BaseModel):
    year: Optional[int] = None
    month: Optional[int] = None  # 1-indexed
    day: Optional[int] = None
    hour: Optional[int] = 0
    minute: Optional[int] = 0
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    zodiacSystem: Optional[str] = "tropical"

@app.post("/api/planetary/positions")
async def calculate_planetary_positions(request: PlanetaryPositionsRequest):
    """
    Calculate planetary positions using Swiss Ephemeris (high precision).
    This endpoint is called by the Next.js frontend for astrological calculations.
    """
    try:
        # Use current time if not specified
        now = datetime.now()
        year = request.year or now.year
        month = request.month or now.month
        day = request.day or now.day
        hour = request.hour or now.hour
        minute = request.minute or now.minute
        zodiac_system = request.zodiacSystem or "tropical"

        # Calculate positions
        result = calculate_planetary_positions_swisseph(
            year, month, day, hour, minute, zodiac_system
        )

        return {
            "birth_info": {
                "year": year,
                "month": month,
                "date": day,
                "hour": hour,
                "minute": minute
            },
            "planetary_positions": result["positions"],
            "metadata": {
                "source": result["source"],
                "precision": result["precision"],
                "zodiacSystem": result["zodiacSystem"],
                "timestamp": datetime.now().isoformat(),
                "calculatedAt": f"{year}-{month:02d}-{day:02d}T{hour:02d}:{minute:02d}:00"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate planetary positions: {str(e)}")

@app.get("/api/planetary/positions")
async def calculate_planetary_positions_get(
    year: Optional[int] = None,
    month: Optional[int] = None,
    day: Optional[int] = None,
    hour: Optional[int] = 0,
    minute: Optional[int] = 0,
    zodiacSystem: Optional[str] = "tropical"
):
    """GET endpoint for planetary positions."""
    request = PlanetaryPositionsRequest(
        year=year, month=month, day=day,
        hour=hour, minute=minute, zodiacSystem=zodiacSystem
    )
    return await calculate_planetary_positions(request)

# ==========================================
# ELEMENTAL CALCULATIONS (Local with Caching)
# ==========================================

class ElementalProperties(BaseModel):
    Fire: float
    Water: float
    Earth: float
    Air: float

class RecipeGeneratorRequest(BaseModel):
    birthDate: str # YYYY-MM-DD
    birthTime: str # HH:MM

class ChartSummary(BaseModel):
    sunSign: str
    moonSign: str
    ascendant: str
    celestialBodies: Dict[str, Any] # Detailed planetary positions

class RecipeGeneratorResponse(BaseModel):
    chart: ChartSummary
    recommendations: List[str]

class RecommendationRequest(BaseModel):
    current_time: str
    location: Optional[Dict[str, float]] = None
    current_elements: Optional[ElementalProperties] = None
    cuisine_preferences: List[str] = []
    dietary_restrictions: List[str] = []
    max_prep_time: Optional[int] = None
    limit: int = 10

@app.post("/recommend/recipes")
async def get_recipe_recommendations(
    request: RecommendationRequest,
    db: Session = Depends(get_db)
):
    """Get personalized recipe recommendations from database"""
    start_time = datetime.now()

    # Build database query
    query = db.query(Recipe).filter(Recipe.is_public == True)

    # Apply filters
    if request.cuisine_preferences:
        query = query.filter(Recipe.cuisine.in_(request.cuisine_preferences))

    if request.max_prep_time:
        query = query.filter(Recipe.prep_time_minutes <= request.max_prep_time)

    if request.dietary_restrictions:
        # Filter recipes that contain ALL required dietary restrictions
        for restriction in request.dietary_restrictions:
            query = query.filter(Recipe.dietary_tags.contains([restriction]))

    # Get recipes with their elemental properties
    recipes = query.limit(request.limit * 2).all()  # Get more for scoring

    recommendations = []
    for recipe in recipes:
        # Calculate elemental compatibility score
        elemental_score = 0.5  # Default neutral score
        planetary_score = 0.5  # Default neutral score
        match_reasons = []

        if request.current_elements:
            # Calculate elemental harmony (simplified)
            # In Phase 2, this will use the actual alchemical calculation service
            user_fire = request.current_elements.Fire
            user_water = request.current_elements.Water
            user_earth = request.current_elements.Earth
            user_air = request.current_elements.Air

            # Get recipe's elemental properties (from joined table)
            recipe_elements = db.query(ElementalProperties).filter(
                ElementalProperties.entity_type == 'recipe',
                ElementalProperties.entity_id == recipe.id
            ).first()

            if recipe_elements:
                # Calculate harmony score based on elemental balance
                harmony = 1 - (
                    abs(user_fire - recipe_elements.fire) +
                    abs(user_water - recipe_elements.water) +
                    abs(user_earth - recipe_elements.earth) +
                    abs(user_air - recipe_elements.air)
                ) / 4

                elemental_score = harmony
                match_reasons.append(f"Elemental harmony score: {harmony:.2f}")

        # Cuisine preference bonus
        if request.cuisine_preferences and recipe.cuisine in request.cuisine_preferences:
            planetary_score += 0.2
            match_reasons.append(f"Preferred {recipe.cuisine} cuisine")

        # Calculate final score
        total_score = (elemental_score * 0.6 + planetary_score * 0.4)

        recommendations.append({
            "recipe": {
                "id": str(recipe.id),
                "name": recipe.name,
                "cuisine": recipe.cuisine,
                "prep_time": recipe.prep_time_minutes,
                "difficulty": recipe.difficulty_level,
                "elemental_score": elemental_score,
                "planetary_alignment": planetary_score,
                "match_reasons": match_reasons
            },
            "score": round(total_score, 3),
            "match_reasons": match_reasons
        })

    # Sort by score and limit results
    recommendations.sort(key=lambda x: x["score"], reverse=True)
    final_recommendations = recommendations[:request.limit]

    # Store recommendation in database for analytics
    if final_recommendations:
        recommendation_record = Recommendation(
            request_context=request.dict(),
            recommended_recipes=[r["recipe"]["id"] for r in final_recommendations],
            recipe_scores={r["recipe"]["id"]: r["score"] for r in final_recommendations},
            algorithm_version="1.0.0"
        )
        db.add(recommendation_record)
        db.commit()

    # Log metrics
    execution_time = (datetime.now() - start_time).total_seconds() * 1000
    await log_system_metric(db, "recipe_recommendation_time", execution_time, "ms")
    await log_system_metric(db, "recipe_recommendation_count", 1)
    await log_system_metric(db, "recipes_returned", len(final_recommendations))

    return {
        "recommendations": final_recommendations,
        "total_count": len(final_recommendations),
        "request_context": {
            "timestamp": request.current_time,
            "elemental_state": request.current_elements.dict() if request.current_elements else None,
            "preferences": {
                "cuisines": request.cuisine_preferences,
                "dietary_restrictions": request.dietary_restrictions
            }
        },
        "metadata": {
            "service": "alchm.kitchen Kitchen Intelligence",
            "algorithm_version": "1.0.0",
            "calculation_method": "alchemical_harmony_scoring",
            "execution_time_ms": execution_time
        }
    }

# Astrological Recipe Endpoints - Phase 5
@app.get("/astrological/zodiac-recipes")
async def get_zodiac_based_recipes(
    zodiac_sign: str,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Get recipe recommendations based on zodiac affinity of ingredients."""
    try:
        # Validate zodiac sign
        valid_signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        if zodiac_sign not in valid_signs:
            raise HTTPException(status_code=400, detail=f"Invalid zodiac sign: {zodiac_sign}")

        # Find recipes that contain ingredients with high zodiac affinity
        # This is a complex query that joins multiple tables
        recipes_with_affinity = db.execute(text("""
            SELECT DISTINCT
                r.id, r.name, r.description, r.cuisine,
                AVG(za.affinity_strength) as avg_affinity,
                COUNT(za.id) as ingredient_matches
            FROM recipes r
            JOIN recipe_ingredients ri ON r.id = ri.recipe_id
            JOIN ingredients i ON ri.ingredient_id = i.id
            JOIN zodiac_affinities za ON za.entity_id = i.id
                AND za.entity_type = 'ingredient'
                AND za.zodiac_sign = :zodiac_sign
                AND za.affinity_strength >= 0.6
            WHERE r.is_public = true
            GROUP BY r.id, r.name, r.description, r.cuisine
            ORDER BY avg_affinity DESC, ingredient_matches DESC
            LIMIT :limit
        """), {"zodiac_sign": zodiac_sign, "limit": limit}).fetchall()

        recommendations = []
        for row in recipes_with_affinity:
            recipe_id, name, description, cuisine, avg_affinity, ingredient_matches = row

            recommendations.append({
                "recipe_id": str(recipe_id),
                "name": name,
                "description": description,
                "cuisine": cuisine,
                "zodiac_affinity_score": float(avg_affinity),
                "matching_ingredients": ingredient_matches,
                "reason": f"Contains {ingredient_matches} ingredient(s) harmonious with {zodiac_sign} energy"
            })

        await log_system_metric(db, "zodiac_recipe_recommendations", len(recommendations),
                               "recipes", {"zodiac_sign": zodiac_sign})

        return {
            "zodiac_sign": zodiac_sign,
            "recipe_recommendations": recommendations,
            "total_found": len(recommendations)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get zodiac recipe recommendations: {str(e)}")

@app.get("/astrological/seasonal-recipes")
async def get_seasonal_recipes(
    season: str,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Get recipe recommendations optimized for the current season."""
    try:
        # Validate season
        valid_seasons = ['Spring', 'Summer', 'Autumn', 'Winter']
        if season not in valid_seasons:
            raise HTTPException(status_code=400, detail=f"Invalid season: {season}")

        # Find recipes with seasonal ingredients
        seasonal_recipes = db.execute(text("""
            SELECT DISTINCT
                r.id, r.name, r.description, r.cuisine,
                AVG(sa.strength) as avg_seasonal_score,
                COUNT(sa.id) as seasonal_ingredients
            FROM recipes r
            JOIN recipe_ingredients ri ON r.id = ri.recipe_id
            JOIN ingredients i ON ri.ingredient_id = i.id
            JOIN seasonal_associations sa ON sa.entity_id = i.id
                AND sa.entity_type = 'ingredient'
                AND sa.season = :season
                AND sa.strength >= 0.7
            WHERE r.is_public = true
            GROUP BY r.id, r.name, r.description, r.cuisine
            ORDER BY avg_seasonal_score DESC, seasonal_ingredients DESC
            LIMIT :limit
        """), {"season": season, "limit": limit}).fetchall()

        recommendations = []
        for row in seasonal_recipes:
            recipe_id, name, description, cuisine, avg_score, seasonal_ingredients = row

            recommendations.append({
                "recipe_id": str(recipe_id),
                "name": name,
                "description": description,
                "cuisine": cuisine,
                "seasonal_score": float(avg_score),
                "seasonal_ingredients": seasonal_ingredients,
                "reason": f"Features {seasonal_ingredients} seasonal ingredient(s) perfect for {season}"
            })

        await log_system_metric(db, "seasonal_recipe_recommendations", len(recommendations),
                               "recipes", {"season": season})

        return {
            "season": season,
            "recipe_recommendations": recommendations,
            "total_found": len(recommendations)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get seasonal recipe recommendations: {str(e)}")

@app.get("/astrological/personalized-cooking")
async def get_personalized_cooking_plan(
    zodiac_sign: Optional[str] = None,
    season: Optional[str] = None,
    preferences: Optional[str] = None,
    limit: int = 3,
    db: Session = Depends(get_db)
):
    """Get a personalized cooking plan combining zodiac and seasonal insights."""
    try:
        cooking_plan = {
            "zodiac_sign": zodiac_sign,
            "season": season,
            "preferences": preferences,
            "recommendations": [],
            "insights": []
        }

        # Get zodiac-based recipes
        if zodiac_sign:
            zodiac_recipes = await get_zodiac_based_recipes(zodiac_sign, limit, db)
            cooking_plan["recommendations"].extend([
                {
                    "type": "zodiac_harmony",
                    "priority": "high",
                    **rec
                } for rec in zodiac_recipes.get("recipe_recommendations", [])
            ])
            cooking_plan["insights"].append(f"Recipes harmonized with your {zodiac_sign} energy patterns")

        # Get seasonal recipes
        if season:
            seasonal_recipes = await get_seasonal_recipes(season, limit, db)
            cooking_plan["recommendations"].extend([
                {
                    "type": "seasonal_optimal",
                    "priority": "high",
                    **rec
                } for rec in seasonal_recipes.get("recipe_recommendations", [])
            ])
            cooking_plan["insights"].append(f"Fresh, seasonal ingredients perfect for {season}")

        # Remove duplicates and sort by priority/score
        seen_recipes = set()
        unique_recommendations = []

        for rec in cooking_plan["recommendations"]:
            recipe_id = rec.get("recipe_id")
            if recipe_id and recipe_id not in seen_recipes:
                seen_recipes.add(recipe_id)
                unique_recommendations.append(rec)

        # Sort by priority and score
        priority_order = {"high": 0, "medium": 1, "low": 2}
        unique_recommendations.sort(key=lambda x: (
            priority_order.get(x.get("priority", "low"), 2),
            -(x.get("zodiac_affinity_score", 0) + x.get("seasonal_score", 0))
        ))

        cooking_plan["recommendations"] = unique_recommendations[:limit]

        # Add general insights
        if zodiac_sign and season:
            cooking_plan["insights"].append(f"Your {zodiac_sign} energy aligns beautifully with {season} seasonal abundance")

        await log_system_metric(db, "personalized_cooking_plans", len(cooking_plan["recommendations"]),
                               "plans", {"zodiac_sign": zodiac_sign, "season": season})

        return cooking_plan

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create personalized cooking plan: {str(e)}")

@app.post("/api/astrological/recipe-recommendations-by-chart")
async def get_recipe_recommendations_by_chart(
    request: PlanetaryPositionsRequest,
    db: Session = Depends(get_db)
):
    """
    Get recipe recommendations based on Ascendant, Sun, and Moon signs.
    """
    try:
        if not swe:
            raise HTTPException(status_code=500, detail="Swiss Ephemeris not available")

        # Calculate time
        year = request.year or datetime.now().year
        month = request.month or datetime.now().month
        day = request.day or datetime.now().day
        hour = request.hour or 0
        minute = request.minute or 0

        # Calculate Julian Day
        jul_day = swe.julday(year, month, day, hour + minute / 60.0)

        flags = swe.FLG_SWIEPH | swe.FLG_SPEED
        if request.zodiacSystem == 'sidereal':
            flags = swe.FLG_SIDEREAL | swe.FLG_SPEED
            swe.set_sid_mode(swe.SIDM_LAHIRI)

        # Calculate Sun and Moon
        sun_res = swe.calc_ut(jul_day, swe.SUN, flags)
        moon_res = swe.calc_ut(jul_day, swe.MOON, flags)

        zodiac_signs = [
            "aries", "taurus", "gemini", "cancer", "leo", "virgo",
            "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
        ]

        sun_sign = zodiac_signs[int(sun_res[0][0] / 30)]
        moon_sign = zodiac_signs[int(moon_res[0][0] / 30)]

        # Calculate Ascendant
        ascendant_sign = "unknown"
        if request.latitude is not None and request.longitude is not None:
            # swe.houses returns (cusps, ascmc)
            # ascmc[0] is Ascendant
            cusps, ascmc = swe.houses(jul_day, request.latitude, request.longitude, b'P')
            ascendant_sign = zodiac_signs[int(ascmc[0] / 30)]

        # Get Recipes
        # Capitalize signs for DB matching if needed (depends on DB data, usually Title Case)
        pass_ascendant = ascendant_sign.capitalize() if ascendant_sign != "unknown" else "Aries" # Default?

        recommendations = get_astrological_recipes(
            sun_sign.capitalize(),
            moon_sign.capitalize(),
            pass_ascendant,
            db
        )

        return {
            "chart_points": {
                "Sun": sun_sign.capitalize(),
                "Moon": moon_sign.capitalize(),
                "Ascendant": ascendant_sign.capitalize()
            },
            "recommendations": recommendations
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get chart recommendations: {str(e)}")

# Current Moment Cuisine Recommendations - Phase 6
@app.get("/cuisines/recommend")
async def get_current_moment_cuisine_recommendations(
    zodiac_sign: Optional[str] = None,
    season: Optional[str] = None,
    meal_type: Optional[str] = None,
    limit: int = 3,
    db: Session = Depends(get_db)
):
    """Get cuisine recommendations based on current astrological moment with nested recipes and sauces."""
    try:
        # Get current astrological state if not provided
        current_state = {}

        if not zodiac_sign or not season:
            try:
                # Import and use current moment calculation
                from src.utils.astrologyUtils import getCurrentAstrologicalState

                current_state = await getCurrentAstrologicalState()
                zodiac_sign = zodiac_sign or current_state.get('currentZodiac')
                season = season or current_state.get('currentSeason')
            except Exception as e:
                # Fallback to defaults
                zodiac_sign = zodiac_sign or 'Libra'
                season = season or 'Autumn'

        # Validate inputs
        valid_signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        valid_seasons = ['Spring', 'Summer', 'Autumn', 'Winter']
        valid_meals = ['breakfast', 'lunch', 'dinner', 'dessert']

        if zodiac_sign not in valid_signs:
            raise HTTPException(status_code=400, detail=f"Invalid zodiac sign: {zodiac_sign}")
        if season not in valid_seasons:
            raise HTTPException(status_code=400, detail=f"Invalid season: {season}")
        if meal_type and meal_type not in valid_meals:
            raise HTTPException(status_code=400, detail=f"Invalid meal type: {meal_type}")

        # Calculate cuisine compatibility scores based on astrological factors
        cuisine_scores = await calculate_cuisine_astrological_compatibility(
            zodiac_sign, season, db
        )

        # Sort cuisines by compatibility score
        sorted_cuisines = sorted(cuisine_scores.items(), key=lambda x: x[1], reverse=True)
        top_cuisines = sorted_cuisines[:limit]

        # Build comprehensive recommendations with nested data
        recommendations = []
        for cuisine_id, score in top_cuisines:
            try:
                cuisine_data = await get_cuisine_with_nested_data(
                    cuisine_id, season, meal_type, zodiac_sign, db
                )
                if cuisine_data:
                    recommendations.append({
                        **cuisine_data,
                        "astrological_score": score,
                        "compatibility_reason": f"Harmonizes with {zodiac_sign} energy and {season} seasonal flow"
                    })
                else:
                    print(f"DEBUG: No cuisine data returned for {cuisine_id}")
            except Exception as e:
                print(f"Error processing cuisine {cuisine_id}: {e}")
                # Continue with other cuisines even if one fails

        try:
            await log_system_metric(db, "current_moment_cuisine_recommendations", len(recommendations),
                                   "cuisines", {"zodiac_sign": zodiac_sign, "season": season, "meal_type": meal_type})
        except Exception as e:
            print(f"Failed to log system metric: {e}")
            # Don't fail the entire request if logging fails

        return {
            "current_moment": {
                "zodiac_sign": zodiac_sign,
                "season": season,
                "meal_type": meal_type,
                "timestamp": datetime.now().isoformat()
            },
            "cuisine_recommendations": recommendations,
            "total_recommendations": len(recommendations),
            "debug_info": {
                "cuisine_scores": cuisine_scores,
                "top_cuisines": top_cuisines
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get cuisine recommendations: {str(e)}")

async def calculate_cuisine_astrological_compatibility(zodiac_sign: str, season: str, db: Session) -> Dict[str, float]:
    """Calculate cuisine compatibility scores based on astrological factors."""
    scores = {}

    # Zodiac affinity scores
    zodiac_affinities = db.query(ZodiacAffinity).filter(
        ZodiacAffinity.zodiac_sign == zodiac_sign,
        ZodiacAffinity.affinity_strength > 0.5
    ).all()

    # Seasonal compatibility scores
    seasonal_assocs = db.query(SeasonalAssociation).filter(
        SeasonalAssociation.season == season,
        SeasonalAssociation.strength > 0.6
    ).all()

    # Combine scores for each cuisine
    cuisine_weights = {
        'italian': 1.0, 'french': 1.0, 'japanese': 1.0, 'indian': 1.0,
        'chinese': 1.0, 'mexican': 1.0, 'thai': 1.0, 'greek': 1.0,
        'korean': 1.0, 'vietnamese': 1.0, 'middle-eastern': 1.0, 'american': 0.8,
        'russian': 0.7, 'african': 0.7
    }

    for cuisine_id, base_weight in cuisine_weights.items():
        # Calculate zodiac score
        zodiac_score = 0
        cuisine_affinities = [a for a in zodiac_affinities if a.entity_type == 'cuisine' and str(a.entity_id) == cuisine_id]
        if cuisine_affinities:
            zodiac_score = max(a.affinity_strength for a in cuisine_affinities)

        # Calculate seasonal score
        seasonal_score = 0
        cuisine_seasonals = [s for s in seasonal_assocs if s.entity_type == 'cuisine' and str(s.entity_id) == cuisine_id]
        if cuisine_seasonals:
            seasonal_score = max(s.strength for s in cuisine_seasonals)

        # Combine scores with base weight
        combined_score = (zodiac_score * 0.4 + seasonal_score * 0.4 + base_weight * 0.2)
        scores[cuisine_id] = combined_score

    return scores

async def get_cuisine_with_nested_data(cuisine_id: str, season: str, meal_type: Optional[str],
                                     zodiac_sign: str, db: Session) -> Optional[Dict[str, Any]]:
    """Get comprehensive cuisine data with nested recipes and sauces."""
    try:
        # Get cuisine data from external source or database
        cuisine_data = None
        print(f"DEBUG: CUISINES_AVAILABLE={CUISINES_AVAILABLE}, cuisine_id={cuisine_id}")
        if CUISINES_AVAILABLE and cuisine_id in cuisines:
            cuisine_data = cuisines[cuisine_id]
            print(f"DEBUG: Found cuisine data for {cuisine_id}")
        else:
            # Fallback to database query
            # For now, return a basic structure
            cuisine_names = {
                'italian': 'Italian', 'french': 'French', 'japanese': 'Japanese',
                'indian': 'Indian', 'chinese': 'Chinese', 'mexican': 'Mexican',
                'thai': 'Thai', 'greek': 'Greek', 'korean': 'Korean',
                'vietnamese': 'Vietnamese', 'middle-eastern': 'Middle Eastern',
                'american': 'American', 'russian': 'Russian', 'african': 'African'
            }
            cuisine_data = {
                'id': cuisine_id,
                'name': cuisine_names.get(cuisine_id, cuisine_id.title()),
                'description': f'Authentic {cuisine_names.get(cuisine_id, cuisine_id.title())} cuisine',
                'elementalProperties': {'Fire': 0.25, 'Water': 0.25, 'Earth': 0.25, 'Air': 0.25}
            }

        if not cuisine_data:
            return None

        # Get nested recipes for this cuisine and season
        nested_recipes = await get_nested_recipes_for_cuisine(cuisine_id, season, meal_type, db)
        print(f"DEBUG: Got {len(nested_recipes)} nested recipes for {cuisine_id}")

        # Get sauce recommendations
        sauce_recommendations = await get_sauce_recommendations_for_cuisine(cuisine_id, zodiac_sign, season)

        return {
            "cuisine_id": cuisine_id,
            "name": cuisine_data.get('name', cuisine_id.title()),
            "description": cuisine_data.get('description', ''),
            "elemental_properties": cuisine_data.get('elementalProperties', {}),
            "nested_recipes": nested_recipes,
            "recommended_sauces": sauce_recommendations,
            "seasonal_context": f"Perfect for {season} with {zodiac_sign} energy"
        }

    except Exception as e:
        print(f"Error getting cuisine data for {cuisine_id}: {e}")
        return None

async def get_nested_recipes_for_cuisine(cuisine_id: str, season: str,
                                       meal_type: Optional[str], db: Session) -> List[Dict[str, Any]]:
    """Get nested recipes for a specific cuisine, season, and meal type."""
    try:
        # Query database for recipes matching criteria
        # Map cuisine_id to proper enum value (capitalize first letter)
        cuisine_enum_value = cuisine_id.replace('-', ' ').title()
        if cuisine_id == 'middle-eastern':
            cuisine_enum_value = 'Middle Eastern'

        print(f"DEBUG: Looking for cuisine '{cuisine_enum_value}' (from '{cuisine_id}')")

        query = db.query(Recipe).filter(
            Recipe.cuisine == cuisine_enum_value,
            Recipe.is_public == True
        )

        # Add meal type filter if specified
        if meal_type:
            # This would require a meal_type field in recipes table
            # For now, we'll get recent recipes
            query = query.order_by(Recipe.created_at.desc())

        recipes = query.limit(3).all()
        print(f"DEBUG: Found {len(recipes)} recipes for cuisine '{cuisine_enum_value}'")

        nested_recipes = []
        for recipe in recipes:
            try:
                # Get recipe ingredients
                ingredients_result = db.execute(text("""
                    SELECT i.name, ri.amount, ri.unit, ri.notes
                    FROM recipe_ingredients ri
                    JOIN ingredients i ON ri.ingredient_id = i.id
                    WHERE ri.recipe_id = :recipe_id
                    ORDER BY ri.sort_order
                """), {"recipe_id": recipe.id})
                ingredients = ingredients_result.fetchall()

                nested_recipes.append({
                    "recipe_id": str(recipe.id),
                    "name": recipe.name,
                    "description": recipe.description,
                    "prep_time": recipe.prep_time,
                    "cook_time": recipe.cook_time,
                    "servings": recipe.servings,
                    "difficulty": recipe.difficulty,
                    "ingredients": [
                        {
                            "name": row[0],
                            "amount": row[1],
                            "unit": row[2],
                            "notes": row[3]
                        } for row in ingredients
                    ],
                    "instructions": recipe.instructions or [],
                    "meal_type": meal_type or "general",
                    "seasonal_fit": f"Excellent {season} choice"
                })
            except Exception as e:
                print(f"Error processing recipe {recipe.id}: {e}")
                # Continue with other recipes even if one fails

        return nested_recipes

    except Exception as e:
        print(f"Error getting nested recipes for {cuisine_id}: {e}")
        return []

async def get_sauce_recommendations_for_cuisine(cuisine_id: str, zodiac_sign: str, season: str) -> List[Dict[str, Any]]:
    """Get sauce recommendations for a cuisine based on astrological factors."""
    try:
        sauce_recommendations = []

        if SAUCES_AVAILABLE:
            # Get sauces that match the cuisine and astrological factors
            for sauce_name, sauce_data in allSauces.items():
                if sauce_data.get('cuisine', '').lower() == cuisine_id.lower():
                    # Check astrological compatibility
                    astro_match = any(sign.lower() in sauce_data.get('astrologicalInfluences', [])
                                    for sign in [zodiac_sign.lower()])

                    # Check seasonal compatibility
                    seasonal_match = season.lower() in sauce_data.get('seasonality', '').lower()

                    if astro_match or seasonal_match:
                        sauce_recommendations.append({
                            "sauce_name": sauce_name,
                            "description": sauce_data.get('description', ''),
                            "key_ingredients": sauce_data.get('keyIngredients', []),
                            "elemental_properties": sauce_data.get('elementalProperties', {}),
                            "compatibility_score": 0.8 if astro_match and seasonal_match else 0.6,
                            "reason": f"Matches {zodiac_sign} energy" if astro_match else f"Perfect for {season}"
                        })

        # If no sauces found, provide generic recommendations
        if not sauce_recommendations:
            generic_sauces = {
                'italian': ['Marinara', 'Pesto', 'Alfredo'],
                'french': ['Béarnaise', 'Hollandaise', 'Béchamel'],
                'japanese': ['Teriyaki', 'Miso', 'Ponzu'],
                'indian': ['Butter Chicken Curry', 'Tikka Masala', 'Raita'],
                'chinese': ['Sweet and Sour', 'Kung Pao', 'Black Bean'],
                'mexican': ['Salsa Verde', 'Mole', 'Enchilada Sauce'],
                'thai': ['Pad Thai Sauce', 'Green Curry', 'Massaman Curry']
            }

            for sauce in generic_sauces.get(cuisine_id, ['Traditional Sauce']):
                sauce_recommendations.append({
                    "sauce_name": sauce,
                    "description": f"Authentic {sauce} for {cuisine_id.title()} cuisine",
                    "compatibility_score": 0.7,
                    "reason": f"Traditional {season.lower()} pairing with {zodiac_sign} harmony"
                })

        return sauce_recommendations[:3]  # Limit to 3 sauce recommendations

    except Exception as e:
        print(f"Error getting sauce recommendations for {cuisine_id}: {e}")
        return []


class RecipeRecommendationRequest(BaseModel):
    year: int
    month: int
    day: int
    hour: int
    minute: int
    latitude: float
    longitude: float
    include_lunar_data: bool = False
    secondary_chart_ids: Optional[List[str]] = None # New field

class RitualRequest(BaseModel):
    recipe_id: str
    secondary_chart_ids: Optional[List[str]] = None
    collective_smes_scores: Optional[Dict[str, float]] = None # Aggregated scores for collective rituals

@app.post("/api/astrological/recipe-recommendations-by-chart")
async def get_recipe_recommendations_by_chart(
    request: RecipeRecommendationRequest,
    db: Session = Depends(get_db)
):
    """
    Get recipe recommendations based on a full astrological chart.
    Optionally includes lunar phase modifications.
    """
    try:
        # 1. Get planetary positions for the birth chart
        chart_data = calculate_planetary_positions_swisseph(
            request.year, request.month, request.day, request.hour, request.minute
        )

        if not chart_data or "positions" not in chart_data:
            raise HTTPException(status_code=500, detail="Failed to calculate planetary positions for the chart.")

        positions = chart_data["positions"]

        # 2. Get lunar data if requested and seasonal data
        lunar_phase_data = None
        if request.include_lunar_data:
            lunar_phase_data = get_current_lunar_phase()

        seasonal_modifiers_data = get_seasonal_modifiers()
        current_seasonal_zodiac = seasonal_modifiers_data['current_zodiac']
        fire_boost_ingredients = seasonal_modifiers_data['fire']
        earth_boost_ingredients = seasonal_modifiers_data['earth']
        air_boost_ingredients = seasonal_modifiers_data['air']
        water_boost_ingredients = seasonal_modifiers_data['water']

        # 3. Build a query to get recipes based on zodiac affinities of their ingredients
        zodiac_signs_in_chart = {pos["sign"] for pos in positions.values()}

        query = """
            SELECT
                r.id,
                r.name,
                r.description,
                r.cuisine,
                i.name as ingredient_name,
                i.category as ingredient_category,
                za.zodiac_sign,
                za.affinity_strength
            FROM recipes r
            JOIN recipe_ingredients ri ON r.id = ri.recipe_id
            JOIN ingredients i ON ri.ingredient_id = i.id
            JOIN zodiac_affinities za ON za.entity_id = i.id
            WHERE za.entity_type = 'ingredient'
            AND za.zodiac_sign IN :zodiac_signs
            AND r.is_public = true
        """

        results = db.execute(text(query), {"zodiac_signs": tuple(zodiac_signs_in_chart)}).fetchall()

        # 4. Process the results and apply lunar and seasonal modifiers
        recipe_scores = {}

        for row in results:
            recipe_id, name, description, cuisine, ingredient_name, ingredient_category, zodiac_sign, affinity_strength = row
            if recipe_id not in recipe_scores:
                recipe_scores[recipe_id] = {
                    "name": name,
                    "description": description,
                    "cuisine": cuisine,
                    "weighted_environmental_score": 0,
                    "matching_ingredients": []
                }

            base_score = affinity_strength
            lunar_modifier = 1.0

            if request.include_lunar_data and lunar_phase_data:
                lunar_modifier = get_lunar_modifier(lunar_phase_data["phase_name"], ingredient_category)

            seasonal_modifier = 1.0
            # Apply seasonal boosts based on ingredient category/name
            # This is a simplified approach, a more robust system might map categories to elemental types
            ingredient_lower = ingredient_name.lower()

            if any(boost in ingredient_lower for boost in fire_boost_ingredients):
                if current_seasonal_zodiac in ['Aries', 'Leo', 'Sagittarius']:
                    seasonal_modifier *= 1.2 # Boost for Fire signs
                else:
                    seasonal_modifier *= 0.9 # Slight penalty for non-fire seasons
            elif any(boost in ingredient_lower for boost in earth_boost_ingredients):
                if current_seasonal_zodiac in ['Taurus', 'Virgo', 'Capricorn']:
                    seasonal_modifier *= 1.2
                else:
                    seasonal_modifier *= 0.9
            elif any(boost in ingredient_lower for boost in air_boost_ingredients):
                if current_seasonal_zodiac in ['Gemini', 'Libra', 'Aquarius']:
                    seasonal_modifier *= 1.2
                else:
                    seasonal_modifier *= 0.9
            elif any(boost in ingredient_lower for boost in water_boost_ingredients):
                if current_seasonal_zodiac in ['Cancer', 'Scorpio', 'Pisces']:
                    seasonal_modifier *= 1.2
                else:
                    seasonal_modifier *= 0.9


            weighted_environmental_score = base_score * lunar_modifier * seasonal_modifier
            recipe_scores[recipe_id]["weighted_environmental_score"] += weighted_environmental_score
            recipe_scores[recipe_id]["matching_ingredients"].append({
                "ingredient": ingredient_name,
                "sign": zodiac_sign,
                "base_affinity": affinity_strength,
                "lunar_modifier": lunar_modifier,
                "seasonal_modifier": seasonal_modifier,
                "weighted_environmental_score": weighted_environmental_score
            })

        # 5. Sort and format the response
        sorted_recipes = sorted(recipe_scores.items(), key=lambda item: item[1]["weighted_environmental_score"], reverse=True)

        # Get optimal cooking windows for the next 24 hours
        optimal_windows = get_optimal_cooking_windows(days=1)

        # --- Get common transit and planetary hour data once before the loop ---
        current_latitude = FOREST_HILLS_COORDINATES["latitude"]
        current_longitude = FOREST_HILLS_COORDINATES["longitude"]

        common_transit_info = get_transit_details()
        if "error" in common_transit_info:
            raise HTTPException(status_code=500, detail=common_transit_info["error"])
        common_dominant_transit = common_transit_info.get("dominant_transit")
        common_sun_element = common_transit_info.get("sun_element")
        common_planetary_hour_ruler = get_planetary_hour(current_latitude, current_longitude)
        # --- End common data acquisition ---

        # --- Collective Synastry Logic (if secondary charts are provided) ---
        collective_potency_modifier = 1.0 # Base modifier
        if request.secondary_chart_ids:
            synastry_engine = CollectiveSynastryEngine(db)
            # Construct ChartData for the primary user
            primary_chart_data = ChartData(
                year=request.year, month=request.month, day=request.day,
                hour=request.hour, minute=request.minute,
                latitude=request.latitude, longitude=request.longitude,
                timezone_str=FOREST_HILLS_COORDINATES["timezone"] # Assuming primary user in Forest Hills TZ
            )
            participant_charts = [primary_chart_data]

            # Fetch and add secondary charts
            for chart_id in request.secondary_chart_ids:
                saved_chart = db.query(SavedChart).filter(SavedChart.id == chart_id).first()
                if saved_chart:
                    participant_charts.append(ChartData(
                        year=saved_chart.birth_date.year,
                        month=saved_chart.birth_date.month,
                        day=saved_chart.birth_date.day,
                        hour=int(saved_chart.birth_time.split(':')[0]), # Assuming 'HH:MM' format
                        minute=int(saved_chart.birth_time.split(':')[1]),
                        latitude=saved_chart.birth_latitude,
                        longitude=saved_chart.birth_longitude,
                        timezone_str=saved_chart.timezone_str
                    ))
                else:
                    print(f"WARNING: Secondary chart with ID {chart_id} not found.")

            if len(participant_charts) > 1: # Only calculate collective if more than one participant
                collective_deficits_analysis = await synastry_engine.calculate_collective_elemental_deficits(participant_charts)
                collective_profile = collective_deficits_analysis["collective_deficit_analysis"]["harmonizing_profile"]

                # Adjust potency based on collective needs vs. planetary hour
                # This is a simplified weighting, can be refined.
                if common_planetary_hour_ruler:
                    # Map planetary hour ruler to its element
                    PLANETARY_ELEMENTS_MAP = {
                        "Sun": "Fire", "Venus": "Earth", "Mercury": "Air", "Moon": "Water",
                        "Saturn": "Earth", "Jupiter": "Fire", "Mars": "Fire"
                    } # Duplicated from transit_engine.py, could be centralized

                    hour_element = PLANETARY_ELEMENTS_MAP.get(common_planetary_hour_ruler)

                    if collective_profile == "Spirit-boosting (Kinetic)" and hour_element == "Fire":
                        collective_potency_modifier *= 1.2
                    elif collective_profile == "Matter-grounding (Stabilizing)" and hour_element == "Earth":
                        collective_potency_modifier *= 1.2
                    # More complex rules can be added here
        # --- End Collective Synastry Logic ---

        recommendations = []
        for recipe_id, data in sorted_recipes[:10]: # Return top 10
            is_match = data["weighted_environmental_score"] > 1.0
            details = ""
            if is_match:
                details = f"Aligns with current environmental energies! Current: {lunar_phase_data['phase_name']} + {current_seasonal_zodiac} Season"

            # Check for optimal cooking window
            optimal_window = None
            if not "error" in optimal_windows:
                for window in optimal_windows:
                    for ingredient in data["matching_ingredients"]:
                        # This is a simplification. A more robust implementation would
                        # map ingredient categories to food types.
                        if window["food_type"].lower() in ingredient["ingredient"].lower():
                            optimal_window = window
                            break
                    if optimal_window:
                        break

            # Get elemental properties for the recipe
            elemental_properties = db.query(ElementalProperties).filter(
                ElementalProperties.entity_type == 'recipe',
                ElementalProperties.entity_id == recipe_id
            ).first()

            # Fetch full recipe object for calculations
            full_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
            if not full_recipe:
                continue # Skip if recipe not found

            # Temporarily assign elemental properties for calculation context
            # In a real system, this would be passed explicitly or the recipe object would already have it
            full_recipe.elementalProperties = {
                "Fire": elemental_properties.fire,
                "Water": elemental_properties.water,
                "Earth": elemental_properties.earth,
                "Air": elemental_properties.air,
            } if elemental_properties else None

            # Calculate Total Potency Score and Kinetic/Thermo ratings
            potency_scores_and_physics = calculate_total_potency_score(
                full_recipe,
                common_dominant_transit,
                common_sun_element,
                common_planetary_hour_ruler
            )
            # Apply collective potency modifier
            potency_scores_and_physics["total_potency_score"] *= collective_potency_modifier

            # Calculate SMES scores using the updated alchemical_quantities function
            smes_quantities = calculate_alchemical_quantities(
                full_recipe,
                potency_scores_and_physics["kinetic_rating"],
                common_planetary_hour_ruler,
                potency_scores_and_physics["thermo_rating"]
            )

            recommendations.append({
                "recipe_id": str(recipe_id),
                "name": data["name"],
                "weighted_environmental_score": data["weighted_environmental_score"],
                "matching_ingredients": data["matching_ingredients"],
                "isEnvironmentalMatch": is_match,
                "environmentalMatchDetails": details,
                "optimal_cooking_window": optimal_window,
                "elementalProperties": {
                    "Fire": elemental_properties.fire,
                    "Water": elemental_properties.water,
                    "Earth": elemental_properties.earth,
                    "Air": elemental_properties.air,
                } if elemental_properties else None,
                # --- New SMES and Physical Quantities ---
                "spirit_score": smes_quantities["spirit_score"],
                "matter_score": smes_quantities["matter_score"],
                "essence_score": smes_quantities["essence_score"],
                "substance_score": smes_quantities["substance_score"],
                "kinetic_val": smes_quantities["kinetic_val"],
                "thermo_val": smes_quantities["thermo_val"],
                "total_potency_score": potency_scores_and_physics["total_potency_score"],
                "collective_potency_modifier_applied": collective_potency_modifier, # Indicate if modifier was applied
                # --- End New Quantities ---
            })
        response_data = {
            "request_params": request.model_dump(),
            "lunar_phase": lunar_phase_data,
            "seasonal_context": {
                "current_zodiac_season": current_seasonal_zodiac,
                "boosted_ingredients": seasonal_modifiers_data
            },
            "recommendations": recommendations,
        }

        return response_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recipe recommendations: {str(e)}")

@app.post("/api/rituals/generate-cooking-instruction")
async def generate_cooking_instruction(request: RitualRequest, db: Session = Depends(get_db)):
    """
    Generates a custom cooking ritual based on the user's current
    most influential transit.
    """
    try:
        # Get recipe details
        recipe = db.query(Recipe).filter(Recipe.id == request.recipe_id).first()
        if not recipe:
            raise HTTPException(status_code=404, detail="Recipe not found")

        recipe.elementalProperties = db.query(ElementalProperties).filter(
            ElementalProperties.entity_type == 'recipe',
            ElementalProperties.entity_id == request.recipe_id
        ).first()

        transit_info = get_transit_details()
        if "error" in transit_info:
            raise HTTPException(status_code=500, detail=transit_info["error"])

        dominant_transit = transit_info.get("dominant_transit")
        sun_element = transit_info.get("sun_element")
        ritual = get_cooking_ritual(recipe, dominant_transit)

        # Get planetary hour
        # Using hardcoded coordinates for Forest Hills, Queens
        latitude = FOREST_HILLS_COORDINATES["latitude"]
        longitude = FOREST_HILLS_COORDINATES["longitude"]
        planetary_hour_ruler = get_planetary_hour(latitude, longitude)
        potency_scores = calculate_total_potency_score(recipe, dominant_transit, sun_element, planetary_hour_ruler)

        # Get optimal cooking window
        optimal_windows = get_optimal_cooking_windows(days=1)
        suggested_timestamp = None
        if not "error" in optimal_windows:
            for window in optimal_windows:
                if window["food_type"].lower() in recipe.category.lower():
                    suggested_timestamp = f"{window['date']}T{window['start_time']}:00"
                    break

        # Log the generated ritual
        is_collective_ritual = bool(request.secondary_chart_ids)
        num_participants = (len(request.secondary_chart_ids) + 1) if is_collective_ritual else 1

        # Use collective scores if provided, otherwise use individual recipe scores
        spirit_score_to_log = request.collective_smes_scores.get("spirit_score", 0.0) if request.collective_smes_scores else potency_scores["spirit_score"]
        essence_score_to_log = request.collective_smes_scores.get("essence_score", 0.0) if request.collective_smes_scores else potency_scores["essence_score"]
        matter_score_to_log = request.collective_smes_scores.get("matter_score", 0.0) if request.collective_smes_scores else potency_scores["matter_score"]
        substance_score_to_log = request.collective_smes_scores.get("substance_score", 0.0) if request.collective_smes_scores else potency_scores["substance_score"]

        # Potency scores already include kinetic_rating and thermo_rating, so these are individual
        # For now, we log the recipe's inherent kinetic/thermo from potency_scores
        kinetic_rating_to_log = potency_scores["kinetic_rating"]
        thermo_rating_to_log = potency_scores["thermo_rating"]

        new_ritual_log = TransitHistory(
            recipe_id=request.recipe_id,
            dominant_transit=dominant_transit,
            ritual_instruction=ritual,
            potency_score=potency_scores["total_potency_score"],
            kinetic_rating=kinetic_rating_to_log,
            thermo_rating=thermo_rating_to_log,
            spirit_score=spirit_score_to_log,
            essence_score=essence_score_to_log,
            matter_score=matter_score_to_log,
            substance_score=substance_score_to_log,
            is_collective=is_collective_ritual,
            participant_count=num_participants,
        )
        db.add(new_ritual_log)
        db.commit()

        return {
            "recipe_id": request.recipe_id,
            "dominant_transit": dominant_transit,
            "ritual_instruction": ritual,
            "suggested_timestamp": suggested_timestamp,
            "total_potency_score": potency_scores["total_potency_score"],
            "current_elemental_balance": transit_info.get("current_elemental_balance"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate cooking instruction: {str(e)}")

@app.post("/api/recipe-generator", response_model=RecipeGeneratorResponse)
async def generate_personalized_recipe(request: RecipeGeneratorRequest, db: Session = Depends(get_db)):
    """
    Generate personalized recipe recommendations based on user's birth chart.
    """
    try:
        birth_date_obj = datetime.strptime(request.birthDate, "%Y-%m-%d")
        birth_time_obj = datetime.strptime(request.birthTime, "%H:%M")

        year = birth_date_obj.year
        month = birth_date_obj.month
        day = birth_date_obj.day
        hour = birth_time_obj.hour
        minute = birth_time_obj.minute

        # For simplicity, using a fixed location. In a real app, this would come from user input.
        latitude = 34.0522  # Example: Los Angeles
        longitude = -118.2437 # Example: Los Angeles

        # 1. Calculate Planetary Positions
        # This function provides positions for planets and nodes
        planetary_positions_data = calculate_planetary_positions_swisseph(
            year, month, day, hour, minute
        )
        celestial_bodies = planetary_positions_data["positions"]

        # 2. Calculate Ascendant and House Cusps for Tropical Zodiac
        # This requires geographical coordinates and exact time for house system calculation
        import swisseph as swe
        swe.set_ephe_path('') # Use built-in ephemeris

        # Calculate Julian day for the birth moment
        julian_day = swe.julday(year, month, day, hour + minute / 60.0)

        # Get the sidereal time at Greenwich (GST)
        # GST is needed for house calculation
        # swe.swe_get_house_pos outputs (house_cusps, ascmc)
        # ascmc[0] is Ascendant, ascmc[1] is Midheaven
        house_cusps_tropical, ascmc_tropical = swe.houses(
            julian_day, latitude, longitude, b'P' # 'P' for Placidus house system
        )

        # Calculate Ascendant sign
        ascendant_longitude = ascmc_tropical[0] # Ascendant is the first element
        ascendant_sign_index = int(ascendant_longitude / 30)
        zodiac_signs_list = [ # Ensure this list matches the one in calculate_planetary_positions_swisseph
            "aries", "taurus", "gemini", "cancer", "leo", "virgo",
            "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
        ]
        ascendant_sign = zodiac_signs_list[ascendant_sign_index]

        # Determine Sun and Moon signs directly from celestial_bodies
        sun_sign = celestial_bodies.get("Sun", {}).get("sign", "Unknown")
        moon_sign = celestial_bodies.get("Moon", {}).get("sign", "Unknown")

        chart_summary = ChartSummary(
            sunSign=sun_sign.capitalize(),
            moonSign=moon_sign.capitalize(),
            ascendant=ascendant_sign.capitalize(),
            celestialBodies=celestial_bodies # Contains all planetary positions
        )

        # 3. Generate Food Recommendations based on the chart
        # For a simplified first version, we can use the Sun Sign for recommendations.
        # We also need a 'db' session for get_zodiac_based_recipes,
        # but this endpoint doesn't directly depend on the database for chart generation,
        # only for recommendations.

        zodiac_recommendations_response = await get_zodiac_based_recipes(
            zodiac_sign=sun_sign.capitalize(),
            limit=5,
            db=db
        )
        food_recommendations = [rec["name"] for rec in zodiac_recommendations_response.get("recipe_recommendations", [])]


        return RecipeGeneratorResponse(
            chart=chart_summary,
            recommendations=food_recommendations
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate personalized recipe: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
