from pydantic import BaseModel, Field, validator
from typing import Optional, Dict
from datetime import datetime

class CelestialCoordinates(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude of the location (-90 to 90 degrees)")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude of the location (-180 to 180 degrees)")
    timezone: Optional[str] = Field("UTC", description="Timezone of the location")

class BirthData(BaseModel):
    year: int = Field(..., ge=1, le=3000)
    month: int = Field(..., ge=1, le=12)
    day: int = Field(..., ge=1, le=31)
    hour: int = Field(..., ge=0, le=23)
    minute: int = Field(..., ge=0, le=59)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

class TransitDetails(BaseModel):
    birth_chart: Dict[str, float]
    current_transits: Dict[str, float]
    dominant_transit: Optional[str]
    sun_sign: str
    sun_element: str
    current_elemental_balance: Dict[str, float]

class PotencyScore(BaseModel):
    total_potency_score: float = Field(..., ge=0, le=2.0) # Potency can sometimes exceed 1.0 with bonuses
    kinetic_rating: float = Field(..., ge=0, le=2.0)
    thermo_rating: float = Field(..., ge=0, le=1.0)

class AlchemicalQuantities(BaseModel):
    # No upper bound on the four scores. 642872c2 (ESMS 2.0, 2026-07-31) removed `min(score, 1.0)` from
    # calculate_alchemical_quantities ("without artificial [0, 1] clamps", Unified Physics Model v2) and left
    # `le=1.0` here, so this model rejected exactly the values the engine now computes:
    # matter_score = .6 * calories/1000 + .4 * earth passes 1.0 above about 1500 kcal (1300 for an
    # earth-heavy recipe), and nutrition/backfill admits up to 2000 kcal per serving.
    spirit_score: float = Field(..., ge=0)
    essence_score: float = Field(..., ge=0)
    matter_score: float = Field(..., ge=0)
    substance_score: float = Field(..., ge=0)
    kinetic_val: float = Field(..., ge=0, le=2.0)
    thermo_val: float = Field(..., ge=0, le=1.0)
