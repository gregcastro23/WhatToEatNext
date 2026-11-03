"""
alchm.kitchen Backend Database Module
Phase 1 Infrastructure Migration - September 26, 2025

Central database configuration and connection management for all backend services.
"""

from .config import DatabaseConfig
from .connection import get_db_session, get_db_engine, create_tables, get_db
from .redis_connection import get_redis_client
from .models import (
    ApiKey,
    CalculationCache,
    ElementalProperties,
    FeedEvent,
    Ingredient,
    IngredientCompatibility,
    IngredientCuisine,
    PlanetaryInfluence,
    Recipe,
    RecipeContext,
    RecipeIngredient,
    Recommendation,
    SavedChart,
    SeasonalAssociation,
    SystemMetric,
    TransitHistory,
    User,
    UserCalculation,
    ZodiacAffinity,
)

__all__ = [
    'DatabaseConfig',
    'get_db_session',
    'get_db_engine',
    'create_tables',
    'get_db',
    'get_redis_client',
    'ApiKey',
    'CalculationCache',
    'ElementalProperties',
    'FeedEvent',
    'Ingredient',
    'IngredientCompatibility',
    'IngredientCuisine',
    'PlanetaryInfluence',
    'Recipe',
    'RecipeContext',
    'RecipeIngredient',
    'Recommendation',
    'SavedChart',
    'SeasonalAssociation',
    'SystemMetric',
    'TransitHistory',
    'User',
    'UserCalculation',
    'ZodiacAffinity',
]
