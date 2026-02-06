"""
SQLAlchemy Models - alchm.kitchen Backend
Phase 1 Infrastructure Migration - September 26, 2025

Database models for all tables defined in the PostgreSQL schema.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Index, UniqueConstraint, CheckConstraint, func
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY, ENUM
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.ext.declarative import declarative_base

from .connection import Base

# ==========================================
# ENUM TYPES
# ==========================================

user_role_enum = ENUM('admin', 'user', 'guest', 'service', name='user_role')
planet_type_enum = ENUM('Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', name='planet_type')
zodiac_sign_enum = ENUM('Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces', name='zodiac_sign')
lunar_phase_enum = ENUM('New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent', name='lunar_phase')
season_enum = ENUM('Spring', 'Summer', 'Autumn', 'Winter', name='season')
cuisine_type_enum = ENUM('Italian', 'French', 'Chinese', 'Japanese', 'Indian', 'Mexican', 'Thai', 'Vietnamese', 'Korean', 'Greek', 'Middle Eastern', 'American', 'African', 'Russian', name='cuisine_type')
dietary_restriction_enum = ENUM('Vegetarian', 'Vegan', 'Gluten Free', 'Dairy Free', 'Keto', 'Paleo', 'Low Carb', 'Kosher', 'Halal', name='dietary_restriction')

# ==========================================
# USER MANAGEMENT TABLES
# ==========================================

class User(Base):
    """User authentication and profile management."""
    __tablename__ = 'users'

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    roles: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=False, default=['user'])
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    profile: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)
    preferences: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    login_count: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    api_keys: Mapped[List["ApiKey"]] = relationship("ApiKey", back_populates="user")
    calculations: Mapped[List["UserCalculation"]] = relationship("UserCalculation", back_populates="user")
    recommendations: Mapped[List["Recommendation"]] = relationship("Recommendation", back_populates="user")

class ApiKey(Base):
    """API keys for external integrations."""
    __tablename__ = 'api_keys'

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    key_hash: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    scopes: Mapped[List[str]] = mapped_column(ARRAY(String), default=[])
    rate_limit_tier: Mapped[str] = mapped_column(String(20), default='authenticated')
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    last_used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="api_keys")

# ==========================================
# ALCHEMICAL DATA TABLES
# ==========================================

class ElementalProperties(Base):
    """Four-element alchemical properties for all entities."""
    __tablename__ = 'elemental_properties'

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'ingredient', 'recipe', 'user_state'
    entity_id: Mapped[str] = mapped_column(UUID(as_uuid=True), nullable=False)
    fire: Mapped[float] = mapped_column(Float(precision=3), nullable=False)
    water: Mapped[float] = mapped_column(Float(precision=3), nullable=False)
    earth: Mapped[float] = mapped_column(Float(precision=3), nullable=False)
    air: Mapped[float] = mapped_column(Float(precision=3), nullable=False)
    calculation_method: Mapped[Optional[str]] = mapped_column(String(50), default='manual')
    confidence_score: Mapped[float] = mapped_column(Float(precision=2), default=1.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint('fire >= 0 AND fire <= 1', name='fire_range'),
        CheckConstraint('water >= 0 AND water <= 1', name='water_range'),
        CheckConstraint('earth >= 0 AND earth <= 1', name='earth_range'),
        CheckConstraint('air >= 0 AND air <= 1', name='air_range'),
        CheckConstraint('(fire + water + earth + air) BETWEEN 0.95 AND 1.05', name='elemental_balance_sum'),
        Index('idx_elemental_props_entity', 'entity_type', 'entity_id'),
        Index('idx_elemental_props_fire', 'fire'),
        Index('idx_elemental_props_water', 'water'),
        Index('idx_elemental_props_earth', 'earth'),
        Index('idx_elemental_props_air', 'air'),
    )

class PlanetaryInfluence(Base):
    """Planetary influences on entities."""
    __tablename__ = 'planetary_influences'

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[str] = mapped_column(UUID(as_uuid=True), nullable=False)
    planet: Mapped[str] = mapped_column(planet_type_enum, nullable=False)
    influence_strength: Mapped[float] = mapped_column(Float(precision=2), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint('influence_strength >= 0 AND influence_strength <= 1', name='influence_strength_range'),
        Index('idx_planetary_entity', 'entity_type', 'entity_id'),
        Index('idx_planetary_planet', 'planet'),
        Index('idx_planetary_strength', 'influence_strength'),
        Index('idx_planetary_primary', 'is_primary'),
    )

class ZodiacAffinity(Base):
    """Zodiac sign affinities for entities."""
    __tablename__ = 'zodiac_affinities'

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[str] = mapped_column(UUID(as_uuid=True), nullable=False)
    zodiac_sign: Mapped[str] = mapped_column(zodiac_sign_enum, nullable=False)
    affinity_strength: Mapped[float] = mapped_column(Float(precision=2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint('affinity_strength >= 0 AND affinity_strength <= 1', name='affinity_strength_range'),
        Index('idx_zodiac_entity', 'entity_type', 'entity_id'),
        Index('idx_zodiac_sign', 'zodiac_sign'),
    )

class SeasonalAssociation(Base):
    """Seasonal associations for entities."""
    __tablename__ = 'seasonal_associations'

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[str] = mapped_column(UUID(as_uuid=True), nullable=False)
    season: Mapped[str] = mapped_column(season_enum, nullable=False)
    strength: Mapped[float] = mapped_column(Float(precision=2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint('strength >= 0 AND strength <= 1', name='seasonal_strength_range'),
        Index('idx_seasonal_entity', 'entity_type', 'entity_id'),
        Index('idx_seasonal_season', 'season'),
    )

# ==========================================
# INGREDIENT TABLES
# ==========================================

class Ingredient(Base):
    """Master ingredient database with alchemical properties."""
    __tablename__ = 'ingredients'

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    common_name: Mapped[Optional[str]] = mapped_column(String(255))
    scientific_name: Mapped[Optional[str]] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    subcategory: Mapped[Optional[str]] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(Text)

    # Nutritional data (per 100g)
    calories: Mapped[Optional[float]] = mapped_column(Float(precision=2))
    protein: Mapped[Optional[float]] = mapped_column(Float(precision=2))
    carbohydrates: Mapped[Optional[float]] = mapped_column(Float(precision=2))
    fat: Mapped[Optional[float]] = mapped_column(Float(precision=2))
    fiber: Mapped[Optional[float]] = mapped_column(Float(precision=2))
    sugar: Mapped[Optional[float]] = mapped_column(Float(precision=2))

    # Flavor profile
    flavor_profile: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)
    preparation_methods: Mapped[List[str]] = mapped_column(ARRAY(String), default=[])

    # Metadata
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    data_source: Mapped[Optional[str]] = mapped_column(String(100))
    confidence_score: Mapped[float] = mapped_column(Float(precision=2), default=1.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    cuisines: Mapped[List["IngredientCuisine"]] = relationship("IngredientCuisine", back_populates="ingredient")
    recipe_ingredients: Mapped[List["RecipeIngredient"]] = relationship("RecipeIngredient", back_populates="ingredient")
    compatibility_a: Mapped[List["IngredientCompatibility"]] = relationship("IngredientCompatibility", foreign_keys="IngredientCompatibility.ingredient_a_id")
    compatibility_b: Mapped[List["IngredientCompatibility"]] = relationship("IngredientCompatibility", foreign_keys="IngredientCompatibility.ingredient_b_id")

    __table_args__ = (
        Index('idx_ingredients_name', 'name'),
        Index('idx_ingredients_category', 'category'),
        Index('idx_ingredients_subcategory', 'subcategory'),
        Index('idx_ingredients_active', 'is_active'),
        Index('idx_ingredients_flavor', 'flavor_profile', postgresql_using='gin'),
    )

class IngredientCuisine(Base):
    """Ingredient cuisine associations."""
    __tablename__ = 'ingredient_cuisines'

    ingredient_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey('ingredients.id', ondelete='CASCADE'), primary_key=True)
    cuisine: Mapped[str] = mapped_column(cuisine_type_enum, primary_key=True)
    usage_frequency: Mapped[float] = mapped_column(Float(precision=2), default=0.5)

    # Relationships
    ingredient: Mapped["Ingredient"] = relationship("Ingredient", back_populates="cuisines")

    __table_args__ = (
        CheckConstraint('usage_frequency >= 0 AND usage_frequency <= 1', name='usage_frequency_range'),
        Index('idx_ingredient_cuisines_ingredient', 'ingredient_id'),
        Index('idx_ingredient_cuisines_cuisine', 'cuisine'),
    )

class IngredientCompatibility(Base):
    """Ingredient compatibility matrix."""
    __tablename__ = 'ingredient_compatibility'

    ingredient_a_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey('ingredients.id', ondelete='CASCADE'), primary_key=True)
    ingredient_b_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey('ingredients.id', ondelete='CASCADE'), primary_key=True)
    compatibility_score: Mapped[float] = mapped_column(Float(precision=2), nullable=False)
    interaction_type: Mapped[str] = mapped_column(String(50), default='neutral')
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    ingredient_a: Mapped["Ingredient"] = relationship("Ingredient", foreign_keys=[ingredient_a_id], back_populates="compatibility_a")
    ingredient_b: Mapped["Ingredient"] = relationship("Ingredient", foreign_keys=[ingredient_b_id], back_populates="compatibility_b")

    __table_args__ = (
        CheckConstraint('compatibility_score >= 0 AND compatibility_score <= 1', name='compatibility_score_range'),
        CheckConstraint('ingredient_a_id != ingredient_b_id', name='different_ingredients'),
        Index('idx_compatibility_a', 'ingredient_a_id'),
        Index('idx_compatibility_b', 'ingredient_b_id'),
        Index('idx_compatibility_score', 'compatibility_score'),
    )

# ==========================================
# RECIPE TABLES
# ==========================================

class Recipe(Base):
    """Recipe database with elemental and cultural information."""
    __tablename__ = 'recipes'

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    cuisine: Mapped[str] = mapped_column(cuisine_type_enum, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    instructions: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    prep_time_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    cook_time_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    servings: Mapped[int] = mapped_column(Integer, nullable=False)
    difficulty_level: Mapped[int] = mapped_column(Integer, nullable=False)
    dietary_tags: Mapped[List[str]] = mapped_column(ARRAY(dietary_restriction_enum), default=[])
    allergens: Mapped[List[str]] = mapped_column(ARRAY(String), default=[])
    nutritional_profile: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)
    popularity_score: Mapped[float] = mapped_column(Float(precision=2), default=0.5)
    alchemical_harmony_score: Mapped[float] = mapped_column(Float(precision=2), default=0.5)
    cultural_authenticity_score: Mapped[float] = mapped_column(Float(precision=2), default=0.5)
    user_rating: Mapped[float] = mapped_column(Float(precision=1), default=0.0)
    rating_count: Mapped[int] = mapped_column(Integer, default=0)
    author_id: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'))
    source: Mapped[Optional[str]] = mapped_column(String(255))
    is_public: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    author: Mapped[Optional["User"]] = relationship("User")
    ingredients: Mapped[List["RecipeIngredient"]] = relationship("RecipeIngredient", back_populates="recipe")
    contexts: Mapped[List["RecipeContext"]] = relationship("RecipeContext", back_populates="recipe")

    __table_args__ = (
        CheckConstraint('prep_time_minutes >= 0', name='prep_time_positive'),
        CheckConstraint('cook_time_minutes >= 0', name='cook_time_positive'),
        CheckConstraint('servings > 0', name='servings_positive'),
        CheckConstraint('difficulty_level BETWEEN 1 AND 5', name='difficulty_range'),
        CheckConstraint('popularity_score >= 0 AND popularity_score <= 1', name='popularity_range'),
        CheckConstraint('alchemical_harmony_score >= 0 AND alchemical_harmony_score <= 1', name='harmony_range'),
        CheckConstraint('cultural_authenticity_score >= 0 AND cultural_authenticity_score <= 1', name='authenticity_range'),
        CheckConstraint('user_rating >= 0 AND user_rating <= 5', name='rating_range'),
        Index('idx_recipes_name', 'name'),
        Index('idx_recipes_cuisine', 'cuisine'),
        Index('idx_recipes_category', 'category'),
        Index('idx_recipes_difficulty', 'difficulty_level'),
        Index('idx_recipes_prep_time', 'prep_time_minutes'),
        Index('idx_recipes_cook_time', 'cook_time_minutes'),
        Index('idx_recipes_dietary', 'dietary_tags', postgresql_using='gin'),
        Index('idx_recipes_popularity', 'popularity_score'),
        Index('idx_recipes_rating', 'user_rating'),
        Index('idx_recipes_public', 'is_public'),
        Index('idx_recipes_created_at', 'created_at'),
    )

class RecipeIngredient(Base):
    """Recipe ingredients with quantities."""
    __tablename__ = 'recipe_ingredients'

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    recipe_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey('recipes.id', ondelete='CASCADE'), nullable=False)
    ingredient_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey('ingredients.id', ondelete='RESTRICT'), nullable=False)
    quantity: Mapped[float] = mapped_column(Float(precision=3), nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    preparation_notes: Mapped[Optional[str]] = mapped_column(Text)
    is_optional: Mapped[bool] = mapped_column(Boolean, default=False)
    group_name: Mapped[Optional[str]] = mapped_column(String(100))
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    recipe: Mapped["Recipe"] = relationship("Recipe", back_populates="ingredients")
    ingredient: Mapped["Ingredient"] = relationship("Ingredient", back_populates="recipe_ingredients")

    __table_args__ = (
        CheckConstraint('quantity > 0', name='quantity_positive'),
        Index('idx_recipe_ingredients_recipe', 'recipe_id'),
        Index('idx_recipe_ingredients_ingredient', 'ingredient_id'),
        Index('idx_recipe_ingredients_order', 'recipe_id', 'order_index'),
    )

class RecipeContext(Base):
    """Recipe recommended contexts."""
    __tablename__ = 'recipe_contexts'

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    recipe_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey('recipes.id', ondelete='CASCADE'), nullable=False)
    recommended_moon_phases: Mapped[List[str]] = mapped_column(ARRAY(lunar_phase_enum))
    recommended_seasons: Mapped[List[str]] = mapped_column(ARRAY(season_enum))
    time_of_day: Mapped[List[str]] = mapped_column(ARRAY(String))
    occasion: Mapped[List[str]] = mapped_column(ARRAY(String))
    energy_intention: Mapped[Optional[str]] = mapped_column(String(100))

    # Relationships
    recipe: Mapped["Recipe"] = relationship("Recipe", back_populates="contexts")

    __table_args__ = (
        Index('idx_recipe_contexts_recipe', 'recipe_id'),
        Index('idx_recipe_contexts_moon_phases', 'recommended_moon_phases', postgresql_using='gin'),
        Index('idx_recipe_contexts_seasons', 'recommended_seasons', postgresql_using='gin'),
    )

# ==========================================
# CALCULATION AND ANALYTICS TABLES
# ==========================================

class CalculationCache(Base):
    """Performance cache for expensive alchemical calculations."""
    __tablename__ = 'calculation_cache'

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    cache_key: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    calculation_type: Mapped[str] = mapped_column(String(100), nullable=False)
    input_data: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    result_data: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    hit_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_accessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index('idx_cache_key', 'cache_key'),
        Index('idx_cache_type', 'calculation_type'),
        Index('idx_cache_expires', 'expires_at'),
        Index('idx_cache_hits', 'hit_count'),
    )

class UserCalculation(Base):
    """User calculation history."""
    __tablename__ = 'user_calculations'

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    calculation_type: Mapped[str] = mapped_column(String(100), nullable=False)
    input_data: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    result_data: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    execution_time_ms: Mapped[Optional[int]] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="calculations")

    __table_args__ = (
        Index('idx_user_calc_user', 'user_id'),
        Index('idx_user_calc_type', 'calculation_type'),
        Index('idx_user_calc_created', 'created_at'),
    )

class Recommendation(Base):
    """Recommendation history and feedback."""
    __tablename__ = 'recommendations'

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    request_context: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    recommended_recipes: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=False)
    recipe_scores: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    algorithm_version: Mapped[str] = mapped_column(String(50), nullable=False)
    user_feedback: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="recommendations")

    __table_args__ = (
        Index('idx_recommendations_user', 'user_id'),
        Index('idx_recommendations_created', 'created_at'),
        Index('idx_recommendations_recipes', 'recommended_recipes', postgresql_using='gin'),
    )

class SystemMetric(Base):
    """System metrics and analytics."""
    __tablename__ = 'system_metrics'

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False)
    metric_value: Mapped[float] = mapped_column(Float(precision=4), nullable=False)
    metric_unit: Mapped[Optional[str]] = mapped_column(String(50))
    tags: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index('idx_metrics_name', 'metric_name'),
        Index('idx_metrics_timestamp', 'timestamp'),
        Index('idx_metrics_tags', 'tags', postgresql_using='gin'),
    )

class TransitHistory(Base):
    """Historical log of generated transit-based cooking rituals."""
    __tablename__ = 'transit_history'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    recipe_id: Mapped[str] = mapped_column(String(255), nullable=False)
    dominant_transit: Mapped[Optional[str]] = mapped_column(String(255))
    ritual_instruction: Mapped[str] = mapped_column(Text, nullable=False)
    potency_score: Mapped[Optional[float]] = mapped_column(Float)
    kinetic_rating: Mapped[Optional[float]] = mapped_column(Float)
    thermo_rating: Mapped[Optional[float]] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index('idx_transit_history_recipe_id', 'recipe_id'),
        Index('idx_transit_history_dominant_transit', 'dominant_transit'),
        Index('idx_transit_history_created_at', 'created_at'),
    )
