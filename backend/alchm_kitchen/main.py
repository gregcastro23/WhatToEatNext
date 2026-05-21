"""
alchm.kitchen - Unified Backend Service
Handles recipe recommendations, alchemical calculations, and astrological insights
Phase 1 Infrastructure Migration - September 26, 2025
Phase 2 Stability Patch - May 6, 2026 (SQL Fixes & Transaction Safety)

Architecture:
- Calculates alchemical and planetary data locally with Swiss Ephemeris
- Provides unified API for frontend
- Manages PostgreSQL database for recipes and recommendations
"""
from fastapi import FastAPI, HTTPException, Depends, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import math
import random
import asyncio
import time
from sqlalchemy.orm import Session
from sqlalchemy import text

# Add parent directory to path for database imports
import sys
import os


# Database imports
from backend.database import get_db, Recipe, Ingredient, Recommendation, SystemMetric, ElementalProperties, ZodiacAffinity, SeasonalAssociation, TransitHistory, SavedChart

# New Auth Middleware import
from backend.alchm_kitchen.auth_middleware import get_current_user

from backend.alchm_kitchen.recipe_generator import get_astrological_recipes
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
from backend.schemas.planetary import CelestialCoordinates
# Lunar Oracle import
from backend.utils.lunar_oracle import get_optimal_cooking_windows
# Alchemical Quantities import
from backend.utils.alchemical_quantities import calculate_alchemical_quantities
# Wellness Analytics import
from backend.utils.wellness_analytics import analyze_alchemical_balance
# Transmutation Oracle import
from backend.utils.transmutation_oracle import TransmutationOracle
# Image Generator import
from backend.utils.image_generator import generate_visual_prompt, NanoBananaPro
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

# Startup event to log configuration
@app.on_event("startup")
async def startup_event():
    """Log startup configuration and test database connection for Railway deployment."""
    import os
    import socket
    port = os.getenv("PORT", "8000")
    database_url = os.getenv("DATABASE_URL", "not set")
    
    # Get hostname/IP for debugging
    hostname = socket.gethostname()
    try:
        ip_addr = socket.gethostbyname(hostname)
    except:
        ip_addr = "unknown"
        
    # Mask the password in the URL for logging
    masked_db = database_url
    if "@" in database_url:
        try:
            prefix, suffix = database_url.split("@", 1)
            if "://" in prefix:
                protocol, creds = prefix.split("://", 1)
                masked_db = f"{protocol}://***@{suffix}"
            else:
                masked_db = f"***@{suffix}"
        except:
            masked_db = "masked"
            
    print(f"🚀 alchm.kitchen Backend Starting...")
    print(f"   Hostname: {hostname} ({ip_addr})")
    print(f"   PORT: {port}")
    print(f"   DATABASE_URL: {masked_db}")
    print(f"   Environment: {os.getenv('ENVIRONMENT', 'development')}")
    
    # Test Database Connection (Non-blocking)
    async def test_db():
        try:
            from backend.database.connection import get_db_engine
            from sqlalchemy import text
            print(f"   Testing database connection in background...")
            engine = get_db_engine()
            
            # Define connection test
            def check():
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
            
            # Run in executor with timeout to avoid blocking startup
            loop = asyncio.get_event_loop()
            await asyncio.wait_for(loop.run_in_executor(None, check), timeout=5.0)
            print(f"   ✅ Database connection successful")
        except asyncio.TimeoutError:
            print(f"   ⚠️ Database connection test timed out (may still be connecting...)")
        except Exception as e:
            print(f"   ❌ Database connection failed: {str(e)}")

    asyncio.create_task(test_db())
    
    print(f"✅ Startup complete - ready to accept requests on port {port}")

# CORS Configuration
raw_cors = os.getenv(
    "CORS_ALLOWED_ORIGINS", 
    "https://alchm.kitchen,https://v0-alchm-kitchen.vercel.app,http://localhost:3000,http://localhost:3001"
)
CORS_ALLOWED_ORIGINS = [o.strip().rstrip('/') for o in raw_cors.split(",") if o.strip()]

# Ensure key frontend domains are always allowed
for origin in ["https://alchm.kitchen", "https://www.alchm.kitchen"]:
    if origin not in CORS_ALLOWED_ORIGINS:
        CORS_ALLOWED_ORIGINS.append(origin)

# Add wildcard if empty or explicitly requested
# NOTE: If allow_credentials is True, allow_origins cannot be ["*"]
if not CORS_ALLOWED_ORIGINS or "*" in CORS_ALLOWED_ORIGINS:
    # If we have a wildcard but need credentials, we should use a more specific list
    # or set allow_credentials=False. For this app, we'll fallback to the default origins.
    if "*" in CORS_ALLOWED_ORIGINS:
        CORS_ALLOWED_ORIGINS = [o for o in CORS_ALLOWED_ORIGINS if o != "*"]
    
    if not CORS_ALLOWED_ORIGINS:
        CORS_ALLOWED_ORIGINS = [
            "https://alchm.kitchen",
            "https://v0-alchm-kitchen.vercel.app",
            "http://localhost:3000",
            "http://localhost:3001"
        ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ==========================================
# EXTERNAL DATA SERVICE (Migrated Data)
# ==========================================

import json
from functools import lru_cache

DATA_JSON_PATH = os.path.join(os.path.dirname(__file__), "data", "json")

@lru_cache(maxsize=32)
def load_json_file_cached(filename: str):
    """Load and parse a JSON file from disk with LRU caching."""
    full_path = os.path.join(DATA_JSON_PATH, filename)
    try:
        if os.path.exists(full_path):
            with open(full_path, "r") as f:
                return json.load(f)
        return None
    except Exception as e:
        print(f"Error loading JSON data from {filename}: {e}")
        return None

def load_json_file(filename: str):
    """Public wrapper for JSON loading."""
    # We use the cached version for performance
    return load_json_file_cached(filename)

@app.get("/api/v1/cuisines")
async def get_all_cuisines():
    """Return all cuisines available in the system."""
    data = load_json_file("cuisines.json")
    if not data:
        raise HTTPException(status_code=404, detail="Cuisine data not found")
    
    # Filter to only return the primary capitalized cuisines to avoid 14MB payload
    primary_cuisines = {k: v for k, v in data.items() if k[0].isupper()}
    return primary_cuisines

@app.get("/api/v1/cuisines/{cuisine_id}")
async def get_cuisine_by_id(cuisine_id: str):
    """Return full details for a specific cuisine."""
    # Try individual file first (more memory efficient)
    individual_file = f"cuisines/{cuisine_id.capitalize()}.json"
    data = load_json_file(individual_file)
    
    if not data:
        # Fallback to the main map
        full_map = load_json_file("cuisines.json")
        data = full_map.get(cuisine_id) or full_map.get(cuisine_id.capitalize())
        
    if not data:
        raise HTTPException(status_code=404, detail=f"Cuisine {cuisine_id} not found")
    return data

@app.get("/api/v1/sauces")
async def get_all_sauces():
    """Return all sauces available in the system."""
    data = load_json_file("sauces.json")
    if not data:
        raise HTTPException(status_code=404, detail="Sauce data not found")
    return data

@app.get("/api/v1/ingredients")
async def get_all_ingredients():
    """Return all ingredients available in the system."""
    data = load_json_file("ingredients.json")
    if not data:
        raise HTTPException(status_code=404, detail="Ingredient data not found")
    return data


# ==========================================
# HEALTH CHECK
# ==========================================

@app.get("/health")
@app.get("/api/v1/health")
async def health_check():
    """Comprehensive health check including database and Redis connectivity."""
    db_status = "offline"
    redis_status = "offline"
    
    try:
        from backend.database.connection import get_db_engine

        engine = get_db_engine()
        # Perform low-overhead heartbeat query
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "online"
    except Exception as e:
        print(f"Database health check failed: {e}")

    try:
        from backend.database import get_redis_client
        client = get_redis_client()
        if client:
            redis_status = "online"
    except Exception as e:
        print(f"Redis health check failed: {e}")

    return {
        "status": "healthy" if db_status == "online" and redis_status == "online" else "degraded",
        "database": db_status,
        "redis": redis_status,
        "timestamp": datetime.now().isoformat(),
        "service": "alchm-backend"
    }
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
    state_country: Optional[str] = "Unknown"

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
    city_name: Optional[str] = None

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

        # Log the context for polish
        if request.city_name:
            print(f"[{request.city_name}] Calculating Quantities for request...")

        result = calculate_alchemical_quantities(
            recipe_obj,
            request.kinetic_rating,
            request.planetary_hour_ruler,
            request.thermo_rating
        )
        return result.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation failed: {str(e)}")



# ==========================================
# ALCHEMICAL CALCULATIONS (local Swiss Ephemeris)
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
    totalEffectValue: float
    dominantElement: str
    dominantModality: str
    aspects: Optional[List[Dict[str, Any]]] = None
    elementalProperties: Dict[str, float]
    thermodynamicProperties: Dict[str, float]
    esms: Dict[str, float]
    kalchm: float
    monica: float
    score: float
    normalized: bool
    confidence: float
    metadata: Dict[str, Any]

class PhilosophersStonePositionsRequest(BaseModel):
    year: Optional[int] = None
    month: Optional[int] = None
    day: Optional[int] = None
    hour: Optional[int] = None
    minute: Optional[int] = None
    customPlanets: Optional[Dict[str, Any]] = None

class PhilosophersStonePositionsResponse(BaseModel):
    elementalProperties: Dict[str, float]
    thermodynamicProperties: Dict[str, float]
    esms: Dict[str, float]
    planetaryMomentum: Dict[str, float]
    kalchm: float
    monica: float
    score: float
    normalized: bool
    confidence: float
    metadata: Dict[str, Any]
    perPlanet: Optional[Dict[str, Any]] = None

PLANET_ALCHM_PERIODS = {
    "Pluto": 247.94,
    "Neptune": 164.79,
    "Uranus": 84.01,
    "Saturn": 29.46,
    "Jupiter": 11.86,
    "Mars": 1.88,
    "Sun": 1.0,
    "Venus": 0.615,
    "Mercury": 0.241,
    "Moon": 0.075,
    "Ascendant": 0.003,
}
PERIOD_LOG_MIN = math.log10(0.003)
PERIOD_LOG_MAX = math.log10(247.94)

PLANETARY_ALCHEMY = {
    "Sun": {"Spirit": 1, "Essence": 0, "Matter": 0, "Substance": 0},
    "Moon": {"Spirit": 0, "Essence": 1, "Matter": 1, "Substance": 0},
    "Mercury": {"Spirit": 1, "Essence": 0, "Matter": 0, "Substance": 1},
    "Venus": {"Spirit": 0, "Essence": 1, "Matter": 1, "Substance": 0},
    "Mars": {"Spirit": 0, "Essence": 1, "Matter": 1, "Substance": 0},
    "Jupiter": {"Spirit": 1, "Essence": 1, "Matter": 0, "Substance": 0},
    "Saturn": {"Spirit": 1, "Essence": 0, "Matter": 1, "Substance": 0},
    "Uranus": {"Spirit": 0, "Essence": 1, "Matter": 1, "Substance": 0},
    "Neptune": {"Spirit": 0, "Essence": 1, "Matter": 0, "Substance": 1},
    "Pluto": {"Spirit": 0, "Essence": 1, "Matter": 1, "Substance": 0},
    "Ascendant": {"Spirit": 1, "Essence": 1, "Matter": 1, "Substance": 1},
}

PLANETARY_SECTARIAN_ELEMENTS = {
    "Sun": {"diurnal": "Fire", "nocturnal": "Fire"},
    "Moon": {"diurnal": "Water", "nocturnal": "Water"},
    "Mercury": {"diurnal": "Air", "nocturnal": "Earth"},
    "Venus": {"diurnal": "Water", "nocturnal": "Earth"},
    "Mars": {"diurnal": "Fire", "nocturnal": "Water"},
    "Jupiter": {"diurnal": "Air", "nocturnal": "Fire"},
    "Saturn": {"diurnal": "Air", "nocturnal": "Earth"},
    "Uranus": {"diurnal": "Water", "nocturnal": "Air"},
    "Neptune": {"diurnal": "Water", "nocturnal": "Water"},
    "Pluto": {"diurnal": "Earth", "nocturnal": "Water"},
}

ZODIAC_ELEMENTS = {
    "aries": "Fire",
    "taurus": "Earth",
    "gemini": "Air",
    "cancer": "Water",
    "leo": "Fire",
    "virgo": "Earth",
    "libra": "Air",
    "scorpio": "Water",
    "sagittarius": "Fire",
    "capricorn": "Earth",
    "aquarius": "Air",
    "pisces": "Water",
}

ZODIAC_MODALITIES = {
    "aries": "Cardinal",
    "cancer": "Cardinal",
    "libra": "Cardinal",
    "capricorn": "Cardinal",
    "taurus": "Fixed",
    "leo": "Fixed",
    "scorpio": "Fixed",
    "aquarius": "Fixed",
    "gemini": "Mutable",
    "virgo": "Mutable",
    "sagittarius": "Mutable",
    "pisces": "Mutable",
}

PLANETARY_DIGNITY = {
    "Sun": {"leo": 1, "aries": 2, "aquarius": -1, "libra": -2},
    "Moon": {"cancer": 1, "taurus": 2, "capricorn": -1, "scorpio": -2},
    "Mercury": {"gemini": 1, "virgo": 3, "sagittarius": 1, "pisces": -3},
    "Venus": {"libra": 1, "taurus": 1, "pisces": 2, "aries": -1, "scorpio": -1, "virgo": -2},
    "Mars": {"aries": 1, "scorpio": 1, "capricorn": 2, "taurus": -1, "libra": -1, "cancer": -2},
    "Jupiter": {"pisces": 1, "sagittarius": 1, "cancer": 2, "gemini": -1, "virgo": -1, "capricorn": -2},
    "Saturn": {"aquarius": 1, "capricorn": 1, "libra": 2, "cancer": -1, "leo": -1, "aries": -2},
    "Uranus": {"aquarius": 1, "scorpio": 2, "taurus": -3},
    "Neptune": {"pisces": 1, "cancer": 2, "virgo": -1, "capricorn": -2},
    "Pluto": {"scorpio": 1, "leo": 2, "taurus": -1, "aquarius": -2},
}

def normalize_alchm_weight(period_years: float) -> float:
    return (math.log10(max(period_years, 1e-9)) - PERIOD_LOG_MIN) / (PERIOD_LOG_MAX - PERIOD_LOG_MIN)

def is_sect_diurnal(moment: datetime) -> bool:
    return 6 <= moment.hour < 18

def get_planetary_sect_element(planet: str, diurnal: bool) -> str:
    entry = PLANETARY_SECTARIAN_ELEMENTS.get(planet)
    if not entry:
        return "Air"
    return entry["diurnal"] if diurnal else entry["nocturnal"]

def get_planetary_dignity(planet: str, sign: str) -> int:
    return PLANETARY_DIGNITY.get(planet, {}).get(sign.lower(), 0)

def parse_alchemize_moment(request: AlchemizeRequest) -> datetime:
    now = datetime.utcnow()
    return datetime(
        request.year if request.year is not None else now.year,
        request.month if request.month is not None else now.month,
        request.date if request.date is not None else now.day,
        request.hour if request.hour is not None else now.hour,
        request.minute if request.minute is not None else now.minute,
    )

def calculate_local_alchemize(request: AlchemizeRequest) -> Dict[str, Any]:
    """Calculate the alchemize payload locally, matching the frontend engine contract."""
    moment = parse_alchemize_moment(request)
    latitude = request.latitude if request.latitude is not None else FOREST_HILLS_COORDINATES["latitude"]
    longitude = request.longitude if request.longitude is not None else FOREST_HILLS_COORDINATES["longitude"]
    zodiac_system = request.zodiacSystem or "tropical"

    if request.planetaryPositions:
        positions = request.planetaryPositions
        positions_source = "request"
    else:
        calculated = calculate_planetary_positions_swisseph(
            moment.year,
            moment.month,
            moment.day,
            moment.hour,
            moment.minute,
            latitude,
            longitude,
            zodiac_system,
        )
        if "positions" not in calculated:
            raise HTTPException(status_code=500, detail=calculated.get("error", "Failed to calculate planetary positions"))
        positions = calculated["positions"]
        positions_source = calculated.get("source", "local")

    totals = {
        "Spirit": 0.0,
        "Essence": 0.0,
        "Matter": 0.0,
        "Substance": 0.0,
        "Fire": 0.0,
        "Water": 0.0,
        "Air": 0.0,
        "Earth": 0.0,
    }
    modality_counts = {"Cardinal": 0, "Fixed": 0, "Mutable": 0}
    planetary_momentum = {}
    diurnal = is_sect_diurnal(moment)

    for planet, position in positions.items():
        if not isinstance(position, dict):
            continue
        sign = str(position.get("sign", "")).lower()
        if not sign:
            continue

        alchemy = PLANETARY_ALCHEMY.get(planet)
        period = PLANET_ALCHM_PERIODS.get(planet, 1.0)
        alchm_weight = 1.0 if planet == "Ascendant" else normalize_alchm_weight(period)
        if alchemy:
            dignity_multiplier = max(0.5, 1.0 + get_planetary_dignity(planet, sign) * 0.15)
            for key, value in alchemy.items():
                totals[key] += value * dignity_multiplier * alchm_weight

        sign_element = ZODIAC_ELEMENTS.get(sign, "Air")
        sect_element = get_planetary_sect_element(planet, diurnal)
        totals[sign_element] += 0.6
        totals[sect_element] += 0.4

        modality = ZODIAC_MODALITIES.get(sign)
        if modality:
            modality_counts[modality] += 1
        planetary_momentum[planet] = 0

    spirit = totals["Spirit"]
    essence = totals["Essence"]
    matter = totals["Matter"]
    substance = totals["Substance"]
    fire = totals["Fire"]
    water = totals["Water"]
    air = totals["Air"]
    earth = totals["Earth"]

    heat_num = spirit ** 2 + fire ** 2
    heat_den = (substance + essence + matter + water + air + earth) ** 2
    heat = heat_num / (heat_den or 1)

    entropy_num = spirit ** 2 + substance ** 2 + fire ** 2 + air ** 2
    entropy_den = (essence + matter + earth + water) ** 2
    entropy = entropy_num / (entropy_den or 1)

    reactivity_num = spirit ** 2 + substance ** 2 + essence ** 2 + fire ** 2 + air ** 2 + water ** 2
    reactivity = (reactivity_num / (matter or 1)) + earth ** 2
    gregs_energy = heat - entropy * reactivity

    kalchm_denominator = (matter ** matter) * (substance ** substance)
    kalchm = ((spirit ** spirit) * (essence ** essence)) / (kalchm_denominator or 1)
    monica = 1.0
    if kalchm > 0 and math.isfinite(kalchm):
        ln_k = math.log(kalchm)
        if ln_k != 0 and reactivity != 0:
            monica = -gregs_energy / (reactivity * ln_k)

    element_total = max(1.0, fire + water + air + earth)
    elemental_properties = {
        "Fire": fire / element_total,
        "Water": water / element_total,
        "Earth": earth / element_total,
        "Air": air / element_total,
    }
    dominant_element = max({"Fire": fire, "Water": water, "Air": air, "Earth": earth}.items(), key=lambda item: item[1])[0]
    dominant_modality = max(modality_counts.items(), key=lambda item: item[1])[0]
    sun_position = positions.get("Sun", {}) if isinstance(positions.get("Sun"), dict) else {}
    sun_sign = str(sun_position.get("sign", ""))
    score = min(1.0, max(0.0, (spirit + essence + matter + substance + fire + water + air + earth) / 20))

    return {
        "elementalProperties": elemental_properties,
        "thermodynamicProperties": {
            "heat": heat,
            "entropy": entropy,
            "reactivity": reactivity,
            "gregsEnergy": gregs_energy,
        },
        "esms": {
            "Spirit": spirit,
            "Essence": essence,
            "Matter": matter,
            "Substance": substance,
        },
        "planetaryPositions": positions,
        "planetaryMomentum": planetary_momentum,
        "kalchm": kalchm,
        "monica": monica,
        "score": score,
        "normalized": True,
        "confidence": 0.8,
        "metadata": {
            "source": "local_swiss_ephemeris_alchemize",
            "positionsSource": positions_source,
            "dominantElement": dominant_element,
            "dominantModality": dominant_modality,
            "sunSign": sun_sign,
            "chartRuler": ZODIAC_ELEMENTS.get(sun_sign.lower(), "Air"),
            "isDiurnal": diurnal,
            "timestamp": moment.isoformat(),
            "zodiacSystem": zodiac_system,
        },
    }


def calculate_local_philosophers_stone(
    dt: datetime,
    custom_planets: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Detailed alchemize payload matching the planetary_agents canonical schema.

    Wraps calculate_local_alchemize, then:
    - replaces the placeholder zero momentum with real day-over-day longitude deltas
      (computed from Swiss Ephemeris positions at dt and dt - 1 day);
    - adds a perPlanet block (per-planet esms, sect/sign elements, weights, dignity).
    """
    req = AlchemizeRequest(
        year=dt.year,
        month=dt.month,
        date=dt.day,
        hour=dt.hour,
        minute=dt.minute,
        planetaryPositions=custom_planets,
    )
    base = calculate_local_alchemize(req)
    positions = base.get("planetaryPositions", {}) or {}

    prev_dt = dt - timedelta(days=1)
    prev_calc = calculate_planetary_positions_swisseph(
        prev_dt.year,
        prev_dt.month,
        prev_dt.day,
        prev_dt.hour,
        prev_dt.minute,
        FOREST_HILLS_COORDINATES["latitude"],
        FOREST_HILLS_COORDINATES["longitude"],
        "tropical",
    )
    prev_positions = prev_calc.get("positions", {}) if isinstance(prev_calc, dict) else {}

    diurnal = is_sect_diurnal(dt)
    per_planet: Dict[str, Any] = {}
    momentum: Dict[str, float] = {}

    for planet, position in positions.items():
        if not isinstance(position, dict):
            continue
        sign_raw = str(position.get("sign", "Aries"))
        sign_lower = sign_raw.lower() or "aries"

        period = PLANET_ALCHM_PERIODS.get(planet, 1.0)
        alchm_weight = 1.0 if planet == "Ascendant" else normalize_alchm_weight(period)

        alchemy = PLANETARY_ALCHEMY.get(planet)
        dignity = get_planetary_dignity(planet, sign_lower)
        dignity_multiplier = max(0.5, 1.0 + dignity * 0.15) if alchemy else 1.0

        planet_esms = {"Spirit": 0.0, "Essence": 0.0, "Matter": 0.0, "Substance": 0.0}
        if alchemy:
            for key in planet_esms:
                planet_esms[key] = alchemy[key] * dignity_multiplier * alchm_weight

        sign_element = ZODIAC_ELEMENTS.get(sign_lower, "Air")
        sect_element = get_planetary_sect_element(planet, diurnal)
        planet_elements = {"Fire": 0.0, "Water": 0.0, "Earth": 0.0, "Air": 0.0}
        planet_elements[sign_element] += 0.6
        planet_elements[sect_element] += 0.4

        per_planet[planet] = {
            "esms": planet_esms,
            "elements": planet_elements,
            "sign": sign_raw,
            "signElement": sign_element,
            "sectElement": sect_element,
            "alchmWeight": alchm_weight,
            "dignityMultiplier": dignity_multiplier,
        }

        prev = prev_positions.get(planet)
        if isinstance(prev, dict):
            curr_long = position.get("exactLongitude")
            if curr_long is None:
                curr_long = float(position.get("degree", 0)) + float(position.get("minute", 0)) / 60.0
            hist_long = prev.get("exactLongitude")
            if hist_long is None:
                hist_long = float(prev.get("degree", 0)) + float(prev.get("minute", 0)) / 60.0
            delta = float(curr_long) - float(hist_long)
            if delta > 180:
                delta -= 360
            elif delta < -180:
                delta += 360
            momentum[planet] = delta * alchm_weight
        else:
            momentum[planet] = 0.0

    base["planetaryMomentum"] = momentum
    base["perPlanet"] = per_planet
    base.pop("planetaryPositions", None)
    return base


class TokenRatesRequest(BaseModel):
    datetime: Optional[str] = None
    location: Optional[Dict[str, float]] = None
    elemental: Optional[Dict[str, float]] = None
    esms: Optional[Dict[str, float]] = None

class TokenRatesResult(BaseModel):
    Spirit: float
    Essence: float
    Matter: float
    Substance: float
    kalchm: float
    monica: float
    planetaryHour: Optional[str] = None
    isDaytime: Optional[bool] = None

@app.post("/api/tokens/calculate", response_model=TokenRatesResult)
async def calculate_token_rates_endpoint(request: TokenRatesRequest):
    """Calculate token rates (SMES + kalchm/monica) for the current or specified time."""
    try:
        dt = datetime.fromisoformat(request.datetime.replace('Z', '+00:00')) if request.datetime else datetime.utcnow()
    except Exception:
        dt = datetime.utcnow()
        
    loc = request.location or {"latitude": FOREST_HILLS_COORDINATES["latitude"], "longitude": FOREST_HILLS_COORDINATES["longitude"]}
    
    # Get planetary hour and day/night status using transit engine
    from backend.utils.transit_engine import get_planetary_hour, CelestialCoordinates
    coords = CelestialCoordinates(latitude=loc["latitude"], longitude=loc["longitude"], timezone=FOREST_HILLS_COORDINATES["timezone"])
    
    # Using a simplified day/night logic based on 6am-6pm if astral is missing
    is_day = 6 <= dt.hour < 18
    planetary_hour = "Sun"  # Default fallback
    
    try:
        from astral.sun import sun
        from astral import LocationInfo
        city = LocationInfo("Local", "Region", coords.timezone, loc["latitude"], loc["longitude"])
        s = sun(city.observer, date=dt)
        sunrise = s["sunrise"].replace(tzinfo=None)
        sunset = s["sunset"].replace(tzinfo=None)
        is_day = sunrise <= dt <= sunset
        
        # Simplified hour calculation based on Chaldean order
        CHALDEAN_ORDER = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"]
        if is_day:
            hour_length = (sunset - sunrise).total_seconds() / 12
            hour_index = int((dt - sunrise).total_seconds() / hour_length)
            day_of_week = (dt.weekday() + 1) % 7
            day_ruler = CHALDEAN_ORDER[day_of_week]
            day_ruler_index = CHALDEAN_ORDER.index(day_ruler)
            planetary_hour = CHALDEAN_ORDER[(day_ruler_index + hour_index) % 7]
        else:
            planetary_hour = "Moon"
    except Exception:
        pass
        
    return TokenRatesResult(
        Spirit=1.0, Essence=1.0, Matter=1.0, Substance=1.0,
        kalchm=1.0, monica=1.0,
        planetaryHour=planetary_hour,
        isDaytime=is_day
    )


@app.get("/api/chart-image")
@app.post("/api/chart-image")
async def get_chart_image(
    year: int = Query(None), month: int = Query(None), day: int = Query(None),
    hour: int = Query(0), minute: int = Query(0)
):
    """Generates a simplified SVG representation of the natal chart."""
    # Generate a beautiful SVG natal wheel
    svg_template = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
        <rect width="100%" height="100%" fill="#1a1a2e" />
        <circle cx="200" cy="200" r="180" fill="none" stroke="#f1c40f" stroke-width="2" />
        <circle cx="200" cy="200" r="140" fill="none" stroke="#f1c40f" stroke-width="1" />
        <circle cx="200" cy="200" r="100" fill="none" stroke="#e74c3c" stroke-width="1" stroke-dasharray="4" />
        <!-- Zodiac signs division -->
        {"".join([f'<line x1="200" y1="20" x2="200" y2="380" stroke="#4a4e69" stroke-width="1" transform="rotate({i*30} 200 200)" />' for i in range(12)])}
        <text x="200" y="40" fill="#f1c40f" text-anchor="middle" font-family="sans-serif" font-size="14">Ascendant</text>
        <text x="200" y="200" fill="#fff" text-anchor="middle" alignment-baseline="middle" font-family="sans-serif" font-size="20">Natal Chart</text>
        <text x="200" y="230" fill="#aaa" text-anchor="middle" font-family="sans-serif" font-size="12">{year}-{month}-{day}</text>
    </svg>"""
    from fastapi.responses import Response
    return Response(content=svg_template, media_type="image/svg+xml")

@app.post("/alchemize", response_model=AlchemizeResponse)
async def alchemize_current_moment(request: AlchemizeRequest):
    """Get current alchemical state from the local alchemize engine."""
    try:
        result = calculate_local_alchemize(request)

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
            metadata=result.get('metadata', {}),
            totalEffectValue=result.get('totalEffectValue', 0),
            dominantElement=result.get('dominantElement', 'Air'),
            dominantModality=result.get('dominantModality', 'Cardinal'),
            aspects=result.get('aspects', [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alchemical calculation failed: {str(e)}")


def _philosophers_stone_moment(
    year: Optional[int],
    month: Optional[int],
    day: Optional[int],
    hour: Optional[int],
    minute: Optional[int],
) -> datetime:
    now = datetime.utcnow()
    return datetime(
        year if year is not None else now.year,
        month if month is not None else now.month,
        day if day is not None else now.day,
        hour if hour is not None else 0,
        minute if minute is not None else 0,
    )


@app.get("/api/philosophers-stone/positions", response_model=PhilosophersStonePositionsResponse)
async def get_philosophers_stone_positions(
    year: Optional[int] = None,
    month: Optional[int] = None,
    day: Optional[int] = None,
    hour: Optional[int] = None,
    minute: Optional[int] = None,
):
    """Canonical alchemize_detailed schema (proxied by WTEN's /api/philosophers-stone/positions)."""
    try:
        dt = _philosophers_stone_moment(year, month, day, hour, minute)
        return calculate_local_philosophers_stone(dt)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Philosophers stone calculation failed: {str(e)}")


@app.post("/api/philosophers-stone/positions", response_model=PhilosophersStonePositionsResponse)
async def post_philosophers_stone_positions(request: PhilosophersStonePositionsRequest):
    """POST variant accepting customPlanets override (otherwise identical to GET)."""
    try:
        dt = _philosophers_stone_moment(
            request.year, request.month, request.day, request.hour, request.minute
        )
        return calculate_local_philosophers_stone(dt, custom_planets=request.customPlanets)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Philosophers stone calculation failed: {str(e)}")


@app.get("/planetary/current")
async def get_current_planetary_positions():
    """Get current planetary positions from the local Swiss Ephemeris engine."""
    try:
        now = datetime.utcnow()
        result = calculate_planetary_positions_swisseph(
            now.year,
            now.month,
            now.day,
            now.hour,
            now.minute,
            FOREST_HILLS_COORDINATES["latitude"],
            FOREST_HILLS_COORDINATES["longitude"],
            "tropical",
        )
        if "positions" not in result:
            raise HTTPException(status_code=500, detail=result.get("error", "Failed to calculate planetary positions"))
        return {
            "planetary_positions": result["positions"],
            "timestamp": datetime.now().isoformat(),
            "source": result.get("source", "local")
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
        # Preserve explicit zero values like 00:00; only fall back when a field is absent.
        now = datetime.now()
        year = request.year if request.year is not None else now.year
        month = request.month if request.month is not None else now.month
        day = request.day if request.day is not None else now.day
        hour = request.hour if request.hour is not None else 0
        minute = request.minute if request.minute is not None else 0
        latitude = request.latitude if request.latitude is not None else 0.0
        longitude = request.longitude if request.longitude is not None else 0.0
        zodiac_system = request.zodiacSystem or "tropical"

        # Calculate positions
        result = calculate_planetary_positions_swisseph(
            year, month, day, hour, minute, latitude, longitude, zodiac_system
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
        logger.error(f"Error calculating planetary positions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


class BulkPlanetaryPositionsRequest(BaseModel):
    start_date: str  # ISO format "2026-03-26T00:00:00Z"
    end_date: str    # ISO format
    interval_hours: Optional[int] = 24
    latitude: Optional[float] = 0.0
    longitude: Optional[float] = 0.0
    zodiacSystem: Optional[str] = "tropical"

@app.post("/api/planetary/positions/bulk")
async def calculate_bulk_planetary_positions(request: BulkPlanetaryPositionsRequest):
    """
    Calculate planetary positions over a timeframe using Swiss Ephemeris.
    Used for historical aggregation and standard deviation benchmarking.
    """
    try:
        start_dt = datetime.fromisoformat(request.start_date.replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(request.end_date.replace('Z', '+00:00'))
        
        interval = max(1, request.interval_hours)
        
        results = {}
        current_dt = start_dt
        
        iterations = 0
        while current_dt <= end_dt and iterations < 180:
            res = calculate_planetary_positions_swisseph(
                current_dt.year, current_dt.month, current_dt.day, 
                current_dt.hour, current_dt.minute, 
                request.latitude, request.longitude, request.zodiacSystem
            )
            
            iso_key = current_dt.isoformat()
            results[iso_key] = res["positions"]
            
            current_dt += timedelta(hours=interval)
            iterations += 1
            
        return {
            "success": True,
            "data": results,
            "metadata": {
                "source": "swisseph" if swe else "ephem",
                "count": iterations,
                "interval_hours": interval
            }
        }
    except Exception as e:
        print(f"Failed to compute bulk planetary positions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# INTERNAL SPECIALIZED ASTROLOGY ENDPOINTS
# ==========================================

@app.post("/internal/astrology/positions")
async def internal_calculate_positions(request: PlanetaryPositionsRequest):
    """
    Internal high-performance endpoint for Hono API.
    Calculates planetary positions with specialized speed and precision.
    """
    try:
        now = datetime.now()
        year = request.year if request.year is not None else now.year
        month = request.month if request.month is not None else now.month
        day = request.day if request.day is not None else now.day
        hour = request.hour if request.hour is not None else 0
        minute = request.minute if request.minute is not None else 0
        latitude = request.latitude if request.latitude is not None else 0.0
        longitude = request.longitude if request.longitude is not None else 0.0
        zodiac_system = request.zodiacSystem or "tropical"

        result = calculate_planetary_positions_swisseph(
            year, month, day, hour, minute, latitude, longitude, zodiac_system
        )
        return result
    except Exception as e:
        print(f"Internal calculation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class EpochEchoRequest(BaseModel):
    planet: str
    target_longitude: float
    max_lookback_years: Optional[int] = 200
    precision_degrees: Optional[float] = 1.0

@app.post("/internal/astrology/outer-epochs")
async def internal_calculate_outer_epochs(request: EpochEchoRequest):
    """
    Specialized endpoint to find 'Epoch Echoes' for slow-moving outer planets.
    Scans historical ephemeris to find the last time a planet was in a specific degree.
    """
    if not swe:
        raise HTTPException(status_code=500, detail="pyswisseph not available")

    planets_map = {
        "Jupiter": swe.JUPITER,
        "Saturn": swe.SATURN,
        "Uranus": swe.URANUS,
        "Neptune": swe.NEPTUNE,
        "Pluto": swe.PLUTO,
    }

    if request.planet not in planets_map:
        raise HTTPException(status_code=400, detail="Only outer planets supported for epoch echoes")

    planet_id = planets_map[request.planet]
    target = request.target_longitude % 360
    
    found_epochs = []
    current_time = datetime.now()
    
    jd = swe.julday(current_time.year, current_time.month, current_time.day, current_time.hour)
    
    # Scanning logic for slow movers
    step = 5 if request.planet in ["Jupiter", "Saturn"] else 20
    max_lookback_jd = jd - (request.max_lookback_years * 365.25)
    
    curr_jd = jd
    
    while curr_jd > max_lookback_jd and len(found_epochs) < 3:
        curr_jd -= step
        res, _ = swe.calc_ut(curr_jd, planet_id, swe.FLG_SWIEPH)
        pos = res[0] % 360
        
        # Approximate check
        if abs(pos - target) < 2.0: # Wide orb for discovery
             # Refine with binary search or smaller steps
             refined_jd = curr_jd
             # Return just the date components for simplicity
             y, m, d, h = swe.revjul(refined_jd)
             found_epochs.append({
                 "year": y, "month": m, "day": d, "hour": h,
                 "longitude": round(pos, 4)
             })
             # Skip backward significantly to avoid finding the same transit
             curr_jd -= 365 # Skip roughly a year
            
    return {
        "planet": request.planet,
        "target_longitude": target,
        "epochs": found_epochs,
        "metadata": {
            "max_lookback_years": request.max_lookback_years,
            "precision_degrees": request.precision_degrees,
            "source": "pyswisseph"
        }
    }

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

# ==========================================
# IMAGE GENERATION (Alchemical Pipeline)
# ==========================================

class ImageGenerationRequest(BaseModel):
    name: str
    description: Optional[str] = ""
    cuisine: Optional[str] = "Global"
    elementalProperties: Optional[Dict[str, float]] = None
    monicaScore: Optional[float] = None
    energyProfile: Optional[Dict[str, Any]] = None
    cookingMethods: Optional[List[str]] = None

class ImageGenerationResponse(BaseModel):
    url: str
    prompt: str

@app.post("/api/generate-alchemical-image", response_model=ImageGenerationResponse)
async def generate_alchemical_image_endpoint(request: ImageGenerationRequest):
    """
    Generate an alchemical visual prompt and bridge to Nano Banana Pro for image generation.
    Uses Redis to cache the prompt for 24 hours.
    """
    try:
        recipe_id = request.dict().get('id', 'unknown')
        cache_key = f"image_prompt:{recipe_id}"
        
        # Try to get cached prompt
        from backend.database import get_redis_client
        redis_client = get_redis_client()
        
        if redis_client:
            cached_prompt = redis_client.get(cache_key)
            if cached_prompt:
                # Need to handle bytes vs str depending on redis version/config
                if isinstance(cached_prompt, bytes):
                    cached_prompt = cached_prompt.decode('utf-8')
                
                # If we have a cached prompt, we still need to generate the image
                # (or we could cache the image URL too, but for now just the prompt)
                engine = NanoBananaPro()
                image_url = await engine.generate(cached_prompt)
                return ImageGenerationResponse(url=image_url, prompt=cached_prompt)

        recipe_data = request.dict()
        # Synthesize the 150-word visual prompt
        prompt = generate_visual_prompt(recipe_data)
        
        # Cache the prompt for 24 hours
        if redis_client:
            try:
                redis_client.setex(cache_key, 86400, prompt)
            except Exception as e:
                print(f"Failed to cache prompt in Redis: {e}")
        
        # Call the Nano Banana Pro bridge
        engine = NanoBananaPro()
        image_url = await engine.generate(prompt)
        
        return ImageGenerationResponse(url=image_url, prompt=prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")

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
                r.id, r.name, r.description, r.cuisine, r.read_model,
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
            GROUP BY r.id, r.name, r.description, r.cuisine, r.read_model
            ORDER BY avg_affinity DESC, ingredient_matches DESC
            LIMIT :limit
        """), {"zodiac_sign": zodiac_sign, "limit": limit}).fetchall()

        recommendations = []
        for row in recipes_with_affinity:
            recipe_id, name, description, cuisine, read_model, avg_affinity, ingredient_matches = row

            recipe_data = read_model if read_model else {
                "id": str(recipe_id),
                "name": name,
                "description": description,
                "cuisine": cuisine
            }

            recommendations.append({
                "recipe": recipe_data,
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
                r.id, r.name, r.description, r.cuisine, r.read_model,
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
            GROUP BY r.id, r.name, r.description, r.cuisine, r.read_model
            ORDER BY avg_seasonal_score DESC, seasonal_ingredients DESC
            LIMIT :limit
        """), {"season": season, "limit": limit}).fetchall()

        recommendations = []
        for row in seasonal_recipes:
            recipe_id, name, description, cuisine, read_model, avg_score, seasonal_ingredients = row

            recipe_data = read_model if read_model else {
                "id": str(recipe_id),
                "name": name,
                "description": description,
                "cuisine": cuisine
            }

            recommendations.append({
                "recipe": recipe_data,
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
                # Use backend-native calculation
                now = datetime.utcnow()
                result = calculate_planetary_positions_swisseph(
                    now.year, now.month, now.day, now.hour, now.minute,
                    FOREST_HILLS_COORDINATES["latitude"],
                    FOREST_HILLS_COORDINATES["longitude"],
                    "tropical"
                )
                
                if "positions" in result:
                    sun_pos = result["positions"].get("Sun", {})
                    zodiac_sign = zodiac_sign or sun_pos.get("sign")
                
                # Determine season from month
                if not season:
                    month = now.month
                    if month in [3, 4, 5]: season = "Spring"
                    elif month in [6, 7, 8]: season = "Summer"
                    elif month in [9, 10, 11]: season = "Autumn"
                    else: season = "Winter"
            except Exception as e:
                print(f"Native astrological state calculation failed: {e}")
                # Fallback to defaults
                zodiac_sign = zodiac_sign or 'Libra'
                season = season or 'Autumn'

        # Normalize and validate inputs
        if zodiac_sign:
            zodiac_sign = zodiac_sign.capitalize()
        
        if season:
            season = season.capitalize()
            # Map Fall to Autumn for database compatibility
            if season == "Fall":
                season = "Autumn"
        meal_type = meal_type.lower() if meal_type else None

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
                db.rollback()
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
    zodiac_affinities = []
    seasonal_assocs = []

    try:
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
    except Exception as e:
        print(f"Database query failed in calculate_cuisine_astrological_compatibility: {e}")
        # Continue with empty affinities/associations (will fall back to base weights)

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
        if zodiac_affinities:
            cuisine_affinities = [a for a in zodiac_affinities if a.entity_type == 'cuisine' and str(a.entity_id) == cuisine_id]
            if cuisine_affinities:
                zodiac_score = max(a.affinity_strength for a in cuisine_affinities)

        # Calculate seasonal score
        seasonal_score = 0
        if seasonal_assocs:
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
                    SELECT i.name, ri.quantity, ri.unit, ri.preparation_notes
                    FROM recipe_ingredients ri
                    JOIN ingredients i ON i.id = ri.ingredient_id
                    WHERE ri.recipe_id = :recipe_id
                    ORDER BY ri.order_index
                """), {"recipe_id": recipe.id})

                ingredients_rows = ingredients_result.fetchall()

                ingredients = []
                if ingredients_rows:
                    ingredients = [
                        {
                            "name": row[0],
                            "amount": float(row[1]) if row[1] is not None else 1.0,
                            "unit": row[2],
                            "notes": row[3] or ""
                        } for row in ingredients_rows
                    ]
                elif recipe.read_model and 'ingredients' in recipe.read_model:
                    # Fallback to read_model if relational table is empty
                    for ing in recipe.read_model['ingredients']:
                        if isinstance(ing, str):
                            ingredients.append({
                                "name": ing,
                                "amount": 1.0,
                                "unit": "unit",
                                "notes": ""
                            })
                        else:
                            ingredients.append({
                                "name": ing.get('name', 'Unknown'),
                                "amount": float(ing.get('amount', 1.0)),
                                "unit": ing.get('unit', 'unit'),
                                "notes": ing.get('notes', '')
                            })

                nested_recipes.append({
                    "recipe_id": str(recipe.id),
                    "name": recipe.name,
                    "description": recipe.description,
                    "prep_time": recipe.prep_time_minutes,
                    "cook_time": recipe.cook_time_minutes,
                    "servings": recipe.servings,
                    "difficulty": recipe.difficulty_level,
                    "ingredients": ingredients,
                    "instructions": recipe.instructions or [],
                    "meal_type": meal_type or "general",
                    "seasonal_fit": f"Excellent {season} choice"
                })
            except Exception as e:
                db.rollback()
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
                r.read_model,
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
            recipe_id, name, description, cuisine, read_model, ingredient_name, ingredient_category, zodiac_sign, affinity_strength = row
            if recipe_id not in recipe_scores:
                recipe_scores[recipe_id] = {
                    "name": name,
                    "description": description,
                    "cuisine": cuisine,
                    "read_model": read_model,
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
        common_planetary_hour_ruler = get_planetary_hour(CelestialCoordinates(latitude=current_latitude, longitude=current_longitude))
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

            # Use read_model for performance (avoiding N+1 queries)
            read_model = data.get("read_model")
            
            # If we have a read_model, we can reconstruct the recipe object partially
            # for the calculation functions, or we can use the data directly if they support dicts.
            if read_model:
                # Mock a recipe object that the calculation functions expect
                class RecipeObj:
                    def __init__(self, d):
                        self.__dict__.update(d)
                        self.id = d.get("id")
                        # Ensure elementalProperties is available if stored in read_model
                        self.elementalProperties = d.get("elemental_properties")
                
                full_recipe = RecipeObj(read_model)
            else:
                # Fallback to DB if read_model is missing (for older entries)
                full_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
                if full_recipe:
                    elemental_properties = db.query(ElementalProperties).filter(
                        ElementalProperties.entity_type == 'recipe',
                        ElementalProperties.entity_id == recipe_id
                    ).first()
                    full_recipe.elementalProperties = {
                        "Fire": elemental_properties.fire,
                        "Water": elemental_properties.water,
                        "Earth": elemental_properties.earth,
                        "Air": elemental_properties.air,
                    } if elemental_properties else None
            
            if not full_recipe:
                continue

            # Calculate Total Potency Score and Kinetic/Thermo ratings
            potency_scores_and_physics = calculate_total_potency_score(
                full_recipe,
                common_dominant_transit,
                common_sun_element,
                common_planetary_hour_ruler
            )
            # Apply collective potency modifier
            potency_scores_and_physics.total_potency_score *= collective_potency_modifier

            # Calculate SMES scores using the updated alchemical_quantities function
            smes_quantities = calculate_alchemical_quantities(
                full_recipe,
                potency_scores_and_physics.kinetic_rating,
                common_planetary_hour_ruler,
                potency_scores_and_physics.thermo_rating
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
                "spirit_score": smes_quantities.spirit_score,
                "matter_score": smes_quantities.matter_score,
                "essence_score": smes_quantities.essence_score,
                "substance_score": smes_quantities.substance_score,
                "kinetic_val": smes_quantities.kinetic_val,
                "thermo_val": smes_quantities.thermo_val,
                "total_potency_score": potency_scores_and_physics.total_potency_score,
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
        planetary_hour_ruler = get_planetary_hour(CelestialCoordinates(latitude=latitude, longitude=longitude))
        potency_scores = calculate_total_potency_score(recipe, dominant_transit, sun_element, planetary_hour_ruler)
        smes_quantities = calculate_alchemical_quantities(recipe, potency_scores.kinetic_rating, planetary_hour_ruler, potency_scores.thermo_rating)

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
        spirit_score_to_log = request.collective_smes_scores.get("spirit_score", 0.0) if request.collective_smes_scores else smes_quantities.spirit_score
        essence_score_to_log = request.collective_smes_scores.get("essence_score", 0.0) if request.collective_smes_scores else smes_quantities.essence_score
        matter_score_to_log = request.collective_smes_scores.get("matter_score", 0.0) if request.collective_smes_scores else smes_quantities.matter_score
        substance_score_to_log = request.collective_smes_scores.get("substance_score", 0.0) if request.collective_smes_scores else smes_quantities.substance_score

        # Potency scores already include kinetic_rating and thermo_rating, so these are individual
        # For now, we log the recipe's inherent kinetic/thermo from potency_scores
        kinetic_rating_to_log = potency_scores.kinetic_rating
        thermo_rating_to_log = potency_scores.thermo_rating

        new_ritual_log = TransitHistory(
            recipe_id=request.recipe_id,
            dominant_transit=dominant_transit,
            ritual_instruction=ritual,
            potency_score=potency_scores.total_potency_score,
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
            "total_potency_score": potency_scores.total_potency_score,
            "current_elemental_balance": transit_info.get("current_elemental_balance"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate cooking instruction: {str(e)}")

class AstroBlueprintRequest(BaseModel):
    year: int
    month: int
    day: int
    hour: int
    minute: int
    latitude: float
    longitude: float

class AstroBlueprintResponse(BaseModel):
    sun_sign: str
    moon_sign: str
    ascendant: str
    target_elemental_balance: Dict[str, float]
    cosmic_instructions: List[str]

@app.post("/api/astrological/context-blueprint", response_model=AstroBlueprintResponse)
async def generate_astro_context_blueprint(request: AstroBlueprintRequest):
    """
    Generates a lightweight Astrological Context Blueprint (Sun, Moon, Ascendant,
    and target elemental ratios) to pass to the Next.js Vercel AI SDK prompt
    for the advanced HSCA Cosmic Recipe Generation.
    """
    try:
        # 1. Calculate Planetary Positions
        planetary_positions_data = calculate_planetary_positions_swisseph(
            request.year, request.month, request.day, request.hour, request.minute
        )
        celestial_bodies = planetary_positions_data.get("positions", {})

        # 2. Ascendant Calculation
        import swisseph as swe
        swe.set_ephe_path('')
        julian_day = swe.julday(request.year, request.month, request.day, request.hour + request.minute / 60.0)
        
        try:
            house_cusps_tropical, ascmc_tropical = swe.houses(
                julian_day, request.latitude, request.longitude, b'P'
            )
            ascendant_longitude = ascmc_tropical[0]
            ascendant_sign_index = int(ascendant_longitude / 30)
            zodiac_signs_list = [
                "aries", "taurus", "gemini", "cancer", "leo", "virgo",
                "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
            ]
            ascendant_sign = zodiac_signs_list[ascendant_sign_index].title()
        except Exception:
            ascendant_sign = "Unknown"

        sun_sign = celestial_bodies.get("Sun", {}).get("sign", "Unknown").title()
        moon_sign = celestial_bodies.get("Moon", {}).get("sign", "Unknown").title()

        # 3. Dummy elemental logic to instruct the AI (Ideally derived from chart dominance)
        # Here we assign generic ratios that sum to ~100 based on standard needs,
        # but in a fuller implementation, this would tally chart weights.
        target_balance = {
            "fire": 25.0,
            "earth": 25.0,
            "water": 25.0,
            "air": 25.0
        }
        
        # If fire sign, maybe they need grounding (Earth/Water).
        # We can pass these explicit rules to the UI generator.
        instructions = [
            f"The user's Sun is in {sun_sign}, Moon in {moon_sign}, and Ascendant in {ascendant_sign}.",
            "Incorporate ingredients that balance these specific placements."
        ]

        return AstroBlueprintResponse(
            sun_sign=sun_sign,
            moon_sign=moon_sign,
            ascendant=ascendant_sign,
            target_elemental_balance=target_balance,
            cosmic_instructions=instructions
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate astro blueprint: {str(e)}")

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

# ==========================================
# PREMIUM TIER CHECK DEPENDENCY
# ==========================================

def require_premium(user: dict = Depends(get_current_user)):
    """
    Dependency that ensures the authenticated user has premium access.
    Admins always pass. Returns the user dict if authorized.
    """
    role = user.get("role", "user")
    tier = user.get("tier", "free")
    if role == "admin" or tier == "premium":
        return user
    raise HTTPException(
        status_code=403,
        detail={
            "upgrade_required": True,
            "message": "This feature requires a Premium subscription.",
            "feature": "group_recommendations",
        },
    )

# ==========================================
# GROUP RECOMMENDATION ENDPOINTS (PREMIUM)
# ==========================================

class GroupMemberChart(BaseModel):
    """Birth chart data for a group member"""
    user_id: Optional[str] = None
    name: Optional[str] = None
    year: int
    month: int
    day: int
    hour: int
    minute: int
    latitude: float
    longitude: float
    timezone_str: str = "America/New_York"

class GroupRecommendationRequest(BaseModel):
    """Request for group dining recommendations"""
    members: List[GroupMemberChart]
    strategy: str = "consensus"  # average, minimum, consensus
    cuisine_filter: Optional[str] = None
    max_results: int = 10

class GroupCompatibilityRequest(BaseModel):
    """Request for group elemental compatibility analysis"""
    members: List[GroupMemberChart]

@app.post("/api/group/recommendations")
async def get_group_recommendations(
    request: GroupRecommendationRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(require_premium),
):
    """
    Calculate personalized group dining recommendations.
    Aggregates natal charts across multiple members and scores
    cuisines/recipes based on collective elemental harmony.
    Requires Premium subscription.
    """
    try:
        if len(request.members) < 2:
            raise HTTPException(status_code=400, detail="Group must have at least 2 members")
        if len(request.members) > 10:
            raise HTTPException(status_code=400, detail="Group size limited to 10 members")

        engine = CollectiveSynastryEngine(db)

        # Convert to ChartData for the engine
        chart_data_list = [
            ChartData(
                year=m.year, month=m.month, day=m.day,
                hour=m.hour, minute=m.minute,
                latitude=m.latitude, longitude=m.longitude,
                timezone_str=m.timezone_str,
                user_id=m.user_id,
            )
            for m in request.members
        ]

        # Get individual snapshots for per-member scores
        individual_snapshots = []
        for chart_data in chart_data_list:
            snapshot = await engine._get_individual_elemental_snapshot(chart_data)
            individual_snapshots.append(snapshot)

        # Get collective deficit analysis
        collective_result = await engine.calculate_collective_elemental_deficits(chart_data_list)
        collective_smes = collective_result.get("collective_smes_averages", {})

        # Generate harmonizing recipe profile
        harmonizing_profile = await engine.generate_harmonizing_recipe_profile(collective_result)

        # Score cuisines from database if available
        cuisine_recommendations = []
        if CUISINES_AVAILABLE and cuisines:
            for cuisine_name, cuisine_data in cuisines.items():
                if request.cuisine_filter and cuisine_name.lower() != request.cuisine_filter.lower():
                    continue

                elemental = cuisine_data.get("elementalProperties", {})
                cuisine_fire = elemental.get("Fire", 0.25)
                cuisine_water = elemental.get("Water", 0.25)
                cuisine_earth = elemental.get("Earth", 0.25)
                cuisine_air = elemental.get("Air", 0.25)

                # Calculate harmony score between collective SMES and cuisine elementals
                collective_spirit = collective_smes.get("spirit_score", 0.5)
                collective_matter = collective_smes.get("matter_score", 0.5)
                collective_essence = collective_smes.get("essence_score", 0.5)
                collective_substance = collective_smes.get("substance_score", 0.5)

                # Harmony = alignment between cuisine elementals and group needs
                harmony = (
                    cuisine_fire * collective_spirit * 0.3 +
                    cuisine_water * collective_essence * 0.3 +
                    cuisine_earth * collective_matter * 0.2 +
                    cuisine_air * collective_substance * 0.2
                )

                # Per-member scores
                per_member = []
                for i, snapshot in enumerate(individual_snapshots):
                    member_smes = snapshot["smes_scores"]
                    member_harmony = (
                        cuisine_fire * member_smes.get("spirit_score", 0.5) * 0.3 +
                        cuisine_water * member_smes.get("essence_score", 0.5) * 0.3 +
                        cuisine_earth * member_smes.get("matter_score", 0.5) * 0.2 +
                        cuisine_air * member_smes.get("substance_score", 0.5) * 0.2
                    )
                    member_info = request.members[i]
                    per_member.append({
                        "name": member_info.name or member_info.user_id or f"Member {i+1}",
                        "score": round(member_harmony, 4),
                        "natal_sun_element": snapshot.get("natal_sun_element", "Unknown"),
                    })

                # Strategy-based scoring
                member_scores = [m["score"] for m in per_member]
                if request.strategy == "minimum":
                    final_score = min(member_scores) if member_scores else 0
                elif request.strategy == "average":
                    final_score = sum(member_scores) / len(member_scores) if member_scores else 0
                else:  # consensus
                    avg = sum(member_scores) / len(member_scores) if member_scores else 0
                    variance = sum((s - avg) ** 2 for s in member_scores) / len(member_scores) if member_scores else 0
                    # Higher consensus = lower variance
                    consensus_bonus = max(0, 1 - variance * 10)
                    final_score = avg * 0.6 + consensus_bonus * 0.4

                cuisine_recommendations.append({
                    "cuisine": cuisine_name,
                    "score": round(final_score, 4),
                    "harmony": round(harmony, 4),
                    "per_member_scores": per_member,
                    "description": cuisine_data.get("description", ""),
                })

            cuisine_recommendations.sort(key=lambda x: x["score"], reverse=True)
            cuisine_recommendations = cuisine_recommendations[:request.max_results]

        return {
            "strategy": request.strategy,
            "group_size": len(request.members),
            "collective_profile": collective_smes,
            "deficit_analysis": collective_result.get("collective_deficit_analysis", {}),
            "harmonizing_profile": harmonizing_profile,
            "recommendations": cuisine_recommendations,
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Group recommendation error: {str(e)}")


@app.post("/api/group/compatibility")
async def get_group_compatibility(
    request: GroupCompatibilityRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(require_premium),
):
    """
    Calculate elemental compatibility matrix between group members.
    Returns pairwise harmony scores and complementary element analysis.
    Requires Premium subscription.
    """
    try:
        if len(request.members) < 2:
            raise HTTPException(status_code=400, detail="Need at least 2 members for compatibility")
        if len(request.members) > 10:
            raise HTTPException(status_code=400, detail="Group size limited to 10 members")

        engine = CollectiveSynastryEngine(db)

        chart_data_list = [
            ChartData(
                year=m.year, month=m.month, day=m.day,
                hour=m.hour, minute=m.minute,
                latitude=m.latitude, longitude=m.longitude,
                timezone_str=m.timezone_str,
                user_id=m.user_id,
            )
            for m in request.members
        ]

        # Get individual snapshots
        snapshots = []
        for chart_data in chart_data_list:
            snapshot = await engine._get_individual_elemental_snapshot(chart_data)
            snapshots.append(snapshot)

        # Build compatibility matrix
        members_info = []
        for i, (member, snapshot) in enumerate(zip(request.members, snapshots)):
            smes = snapshot["smes_scores"]
            members_info.append({
                "index": i,
                "name": member.name or member.user_id or f"Member {i+1}",
                "natal_sun_element": snapshot.get("natal_sun_element", "Unknown"),
                "smes": {
                    "spirit": round(smes.get("spirit_score", 0), 4),
                    "essence": round(smes.get("essence_score", 0), 4),
                    "matter": round(smes.get("matter_score", 0), 4),
                    "substance": round(smes.get("substance_score", 0), 4),
                },
            })

        # Pairwise compatibility
        compatibility_matrix = []
        for i in range(len(snapshots)):
            for j in range(i + 1, len(snapshots)):
                smes_i = snapshots[i]["smes_scores"]
                smes_j = snapshots[j]["smes_scores"]

                # Cosine similarity between SMES vectors
                vec_i = [smes_i.get("spirit_score", 0), smes_i.get("essence_score", 0),
                         smes_i.get("matter_score", 0), smes_i.get("substance_score", 0)]
                vec_j = [smes_j.get("spirit_score", 0), smes_j.get("essence_score", 0),
                         smes_j.get("matter_score", 0), smes_j.get("substance_score", 0)]

                dot = sum(a * b for a, b in zip(vec_i, vec_j))
                mag_i = sum(a ** 2 for a in vec_i) ** 0.5
                mag_j = sum(a ** 2 for a in vec_j) ** 0.5
                similarity = dot / (mag_i * mag_j) if (mag_i > 0 and mag_j > 0) else 0

                # Complementary analysis
                complementary_elements = []
                element_names = ["Spirit", "Essence", "Matter", "Substance"]
                for k, name in enumerate(element_names):
                    diff = abs(vec_i[k] - vec_j[k])
                    if diff > 0.2:
                        stronger = members_info[i]["name"] if vec_i[k] > vec_j[k] else members_info[j]["name"]
                        complementary_elements.append({
                            "element": name,
                            "difference": round(diff, 4),
                            "stronger_in": stronger,
                        })

                compatibility_matrix.append({
                    "member_a": members_info[i]["name"],
                    "member_b": members_info[j]["name"],
                    "harmony_score": round(similarity, 4),
                    "complementary_elements": complementary_elements,
                })

        # Overall group harmony
        if compatibility_matrix:
            avg_harmony = sum(c["harmony_score"] for c in compatibility_matrix) / len(compatibility_matrix)
        else:
            avg_harmony = 0

        return {
            "group_size": len(request.members),
            "members": members_info,
            "compatibility_matrix": compatibility_matrix,
            "overall_harmony": round(avg_harmony, 4),
            "harmony_rating": (
                "Excellent" if avg_harmony > 0.85 else
                "Good" if avg_harmony > 0.7 else
                "Moderate" if avg_harmony > 0.5 else
                "Challenging"
            ),
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Compatibility analysis error: {str(e)}")


# ==========================================
# Agent Identity Sync (planetary_agents ↔ WTEN)
# ==========================================

class AgentSyncRequest(BaseModel):
    email: str
    displayName: Optional[str] = None
    agentMetadata: Optional[Dict[str, Any]] = None

AGENTIC_EMAIL_DOMAIN = "@agentic.alchm.kitchen"

@app.post("/api/internal/agent-sync")
async def agent_sync(request: AgentSyncRequest, req: Request, db: Session = Depends(get_db)):
    """
    POST /api/internal/agent-sync

    Creates or links a WTEN user record for a planetary_agents agentic persona.
    Returns the WTEN userId so planetary_agents can persist it as alchmKitchenUserId.

    Auth: X-Sync-Secret header matched against ALCHM_KITCHEN_SYNC_SECRET env var.
    Only accepts @agentic.alchm.kitchen email addresses.
    """
    t0 = time.time()

    sync_secret = os.getenv("ALCHM_KITCHEN_SYNC_SECRET", "")
    auth_header = req.headers.get("X-Sync-Secret", "")
    if not sync_secret or auth_header != sync_secret:
        raise HTTPException(status_code=401, detail="Unauthorized")

    email = request.email.lower().strip()
    if not email.endswith(AGENTIC_EMAIL_DOMAIN):
        raise HTTPException(
            status_code=422,
            detail=f"Only {AGENTIC_EMAIL_DOMAIN} addresses are accepted"
        )

    raw_display = (request.displayName or "").strip()
    if raw_display:
        display_name = raw_display
    else:
        local = email.split("@")[0]
        display_name = " ".join(p.capitalize() for p in local.split("-") if p) or "Agent"

    try:
        # Single upsert — (created_at = updated_at) detects a fresh insert vs update
        row = db.execute(
            text("""
                INSERT INTO users
                  (email, password_hash, role, is_active, email_verified, is_agent,
                   name, profile, preferences, login_count, created_at, updated_at)
                VALUES
                  (:email, 'AGENT_NO_LOGIN', 'USER'::user_role, true, true, true,
                   :name, :profile::jsonb, '{}'::jsonb, 0, now(), now())
                ON CONFLICT (email) DO UPDATE
                  SET is_agent   = true,
                      name       = COALESCE(EXCLUDED.name, users.name),
                      updated_at = now()
                RETURNING id, (created_at = updated_at) AS is_new_row
            """),
            {
                "email": email,
                "name": display_name,
                "profile": json.dumps({"email": email, "isAgent": True, "name": display_name}),
            }
        ).fetchone()
        wten_user_id = str(row[0])
        created = bool(row[1])

        db.execute(
            text("""
                INSERT INTO user_profiles (user_id, name)
                VALUES (:user_id, :name)
                ON CONFLICT (user_id) DO UPDATE
                  SET name       = COALESCE(EXCLUDED.name, user_profiles.name),
                      updated_at = now()
            """),
            {"user_id": wten_user_id, "name": display_name}
        )
        db.commit()

        elapsed_ms = int((time.time() - t0) * 1000)
        print(f"agent_sync email={email} wtenUserId={wten_user_id} created={created} elapsed_ms={elapsed_ms}")

        return {"ok": True, "wtenUserId": wten_user_id, "created": created}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"[agent-sync] Internal Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
