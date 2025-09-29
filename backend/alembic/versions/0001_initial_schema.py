"""
Initial schema migration for alchm.kitchen
Phase 1 Infrastructure Migration - September 26, 2025

Creates the complete database schema with all tables, indexes, constraints,
and initial data for the alchemical recipe recommendation system.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create the complete alchm.kitchen database schema."""

    # ==========================================
    # ENABLE EXTENSIONS
    # ==========================================

    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    op.execute('CREATE EXTENSION IF NOT EXISTS "btree_gin"')
    op.execute('CREATE EXTENSION IF NOT EXISTS "pg_trgm"')

    # ==========================================
    # CUSTOM ENUM TYPES
    # ==========================================

    # Create enums
    user_role_enum = postgresql.ENUM('admin', 'user', 'guest', 'service', name='user_role')
    user_role_enum.create(op.get_bind())

    planet_type_enum = postgresql.ENUM('Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', name='planet_type')
    planet_type_enum.create(op.get_bind())

    zodiac_sign_enum = postgresql.ENUM('Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces', name='zodiac_sign')
    zodiac_sign_enum.create(op.get_bind())

    lunar_phase_enum = postgresql.ENUM('New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent', name='lunar_phase')
    lunar_phase_enum.create(op.get_bind())

    season_enum = postgresql.ENUM('Spring', 'Summer', 'Autumn', 'Winter', name='season')
    season_enum.create(op.get_bind())

    cuisine_type_enum = postgresql.ENUM('Italian', 'French', 'Chinese', 'Japanese', 'Indian', 'Mexican', 'Thai', 'Vietnamese', 'Korean', 'Greek', 'Middle Eastern', 'American', 'African', 'Russian', name='cuisine_type')
    cuisine_type_enum.create(op.get_bind())

    dietary_restriction_enum = postgresql.ENUM('Vegetarian', 'Vegan', 'Gluten Free', 'Dairy Free', 'Keto', 'Paleo', 'Low Carb', 'Kosher', 'Halal', name='dietary_restriction')
    dietary_restriction_enum.create(op.get_bind())

    # ==========================================
    # USER MANAGEMENT TABLES
    # ==========================================

    # Users table
    op.create_table('users',
        sa.Column('id', postgresql.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('roles', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('email_verified', sa.Boolean(), nullable=False),
        sa.Column('profile', postgresql.JSONB(), nullable=True),
        sa.Column('preferences', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('last_login_at', postgresql.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('login_count', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

    # API keys table
    op.create_table('api_keys',
        sa.Column('id', postgresql.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('key_hash', sa.String(255), nullable=False),
        sa.Column('scopes', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('rate_limit_tier', sa.String(20), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('expires_at', postgresql.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('last_used_at', postgresql.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('usage_count', sa.Integer(), nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('key_hash')
    )

    # ==========================================
    # ALCHEMICAL DATA TABLES
    # ==========================================

    # Elemental properties table
    op.create_table('elemental_properties',
        sa.Column('id', postgresql.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('entity_type', sa.String(50), nullable=False),
        sa.Column('entity_id', postgresql.UUID(), nullable=False),
        sa.Column('fire', sa.Float(precision=3), nullable=False),
        sa.Column('water', sa.Float(precision=3), nullable=False),
        sa.Column('earth', sa.Float(precision=3), nullable=False),
        sa.Column('air', sa.Float(precision=3), nullable=False),
        sa.Column('calculation_method', sa.String(50), nullable=True),
        sa.Column('confidence_score', sa.Float(precision=2), nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('fire >= 0 AND fire <= 1', name='fire_range'),
        sa.CheckConstraint('water >= 0 AND water <= 1', name='water_range'),
        sa.CheckConstraint('earth >= 0 AND earth <= 1', name='earth_range'),
        sa.CheckConstraint('air >= 0 AND air <= 1', name='air_range'),
        sa.CheckConstraint('(fire + water + earth + air) BETWEEN 0.95 AND 1.05', name='elemental_balance_sum')
    )

    # Planetary influences table
    op.create_table('planetary_influences',
        sa.Column('id', postgresql.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('entity_type', sa.String(50), nullable=False),
        sa.Column('entity_id', postgresql.UUID(), nullable=False),
        sa.Column('planet', planet_type_enum, nullable=False),
        sa.Column('influence_strength', sa.Float(precision=2), nullable=False),
        sa.Column('is_primary', sa.Boolean(), nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('influence_strength >= 0 AND influence_strength <= 1', name='influence_strength_range')
    )

    # Zodiac affinities table
    op.create_table('zodiac_affinities',
        sa.Column('id', postgresql.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('entity_type', sa.String(50), nullable=False),
        sa.Column('entity_id', postgresql.UUID(), nullable=False),
        sa.Column('zodiac_sign', zodiac_sign_enum, nullable=False),
        sa.Column('affinity_strength', sa.Float(precision=2), nullable=False),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('affinity_strength >= 0 AND affinity_strength <= 1', name='affinity_strength_range')
    )

    # Seasonal associations table
    op.create_table('seasonal_associations',
        sa.Column('id', postgresql.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('entity_type', sa.String(50), nullable=False),
        sa.Column('entity_id', postgresql.UUID(), nullable=False),
        sa.Column('season', season_enum, nullable=False),
        sa.Column('strength', sa.Float(precision=2), nullable=False),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('strength >= 0 AND strength <= 1', name='seasonal_strength_range')
    )

    # ==========================================
    # INGREDIENT TABLES
    # ==========================================

    # Ingredients table
    op.create_table('ingredients',
        sa.Column('id', postgresql.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('common_name', sa.String(255), nullable=True),
        sa.Column('scientific_name', sa.String(255), nullable=True),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('subcategory', sa.String(100), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('calories', sa.Float(precision=2), nullable=True),
        sa.Column('protein', sa.Float(precision=2), nullable=True),
        sa.Column('carbohydrates', sa.Float(precision=2), nullable=True),
        sa.Column('fat', sa.Float(precision=2), nullable=True),
        sa.Column('fiber', sa.Float(precision=2), nullable=True),
        sa.Column('sugar', sa.Float(precision=2), nullable=True),
        sa.Column('flavor_profile', postgresql.JSONB(), nullable=True),
        sa.Column('preparation_methods', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('data_source', sa.String(100), nullable=True),
        sa.Column('confidence_score', sa.Float(precision=2), nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Ingredient cuisines table
    op.create_table('ingredient_cuisines',
        sa.Column('ingredient_id', postgresql.UUID(), nullable=False),
        sa.Column('cuisine', cuisine_type_enum, nullable=False),
        sa.Column('usage_frequency', sa.Float(precision=2), nullable=True),
        sa.ForeignKeyConstraint(['ingredient_id'], ['ingredients.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('ingredient_id', 'cuisine'),
        sa.CheckConstraint('usage_frequency >= 0 AND usage_frequency <= 1', name='usage_frequency_range')
    )

    # Ingredient compatibility table
    op.create_table('ingredient_compatibility',
        sa.Column('ingredient_a_id', postgresql.UUID(), nullable=False),
        sa.Column('ingredient_b_id', postgresql.UUID(), nullable=False),
        sa.Column('compatibility_score', sa.Float(precision=2), nullable=False),
        sa.Column('interaction_type', sa.String(50), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['ingredient_a_id'], ['ingredients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['ingredient_b_id'], ['ingredients.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('ingredient_a_id', 'ingredient_b_id'),
        sa.CheckConstraint('compatibility_score >= 0 AND compatibility_score <= 1', name='compatibility_score_range'),
        sa.CheckConstraint('ingredient_a_id != ingredient_b_id', name='different_ingredients')
    )

    # ==========================================
    # RECIPE TABLES
    # ==========================================

    # Recipes table
    op.create_table('recipes',
        sa.Column('id', postgresql.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('cuisine', cuisine_type_enum, nullable=False),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('instructions', postgresql.JSONB(), nullable=False),
        sa.Column('prep_time_minutes', sa.Integer(), nullable=False),
        sa.Column('cook_time_minutes', sa.Integer(), nullable=False),
        sa.Column('servings', sa.Integer(), nullable=False),
        sa.Column('difficulty_level', sa.Integer(), nullable=False),
        sa.Column('dietary_tags', postgresql.ARRAY(dietary_restriction_enum), nullable=True),
        sa.Column('allergens', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('nutritional_profile', postgresql.JSONB(), nullable=True),
        sa.Column('popularity_score', sa.Float(precision=2), nullable=True),
        sa.Column('alchemical_harmony_score', sa.Float(precision=2), nullable=True),
        sa.Column('cultural_authenticity_score', sa.Float(precision=2), nullable=True),
        sa.Column('user_rating', sa.Float(precision=1), nullable=True),
        sa.Column('rating_count', sa.Integer(), nullable=True),
        sa.Column('author_id', postgresql.UUID(), nullable=True),
        sa.Column('source', sa.String(255), nullable=True),
        sa.Column('is_public', sa.Boolean(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('prep_time_minutes >= 0', name='prep_time_positive'),
        sa.CheckConstraint('cook_time_minutes >= 0', name='cook_time_positive'),
        sa.CheckConstraint('servings > 0', name='servings_positive'),
        sa.CheckConstraint('difficulty_level BETWEEN 1 AND 5', name='difficulty_range'),
        sa.CheckConstraint('popularity_score >= 0 AND popularity_score <= 1', name='popularity_range'),
        sa.CheckConstraint('alchemical_harmony_score >= 0 AND alchemical_harmony_score <= 1', name='harmony_range'),
        sa.CheckConstraint('cultural_authenticity_score >= 0 AND cultural_authenticity_score <= 1', name='authenticity_range'),
        sa.CheckConstraint('user_rating >= 0 AND user_rating <= 5', name='rating_range')
    )

    # Recipe ingredients table
    op.create_table('recipe_ingredients',
        sa.Column('id', postgresql.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('recipe_id', postgresql.UUID(), nullable=False),
        sa.Column('ingredient_id', postgresql.UUID(), nullable=False),
        sa.Column('quantity', sa.Float(precision=3), nullable=False),
        sa.Column('unit', sa.String(50), nullable=False),
        sa.Column('preparation_notes', sa.Text(), nullable=True),
        sa.Column('is_optional', sa.Boolean(), nullable=True),
        sa.Column('group_name', sa.String(100), nullable=True),
        sa.Column('order_index', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['ingredient_id'], ['ingredients.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('quantity > 0', name='quantity_positive')
    )

    # Recipe contexts table
    op.create_table('recipe_contexts',
        sa.Column('id', postgresql.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('recipe_id', postgresql.UUID(), nullable=False),
        sa.Column('recommended_moon_phases', postgresql.ARRAY(lunar_phase_enum), nullable=True),
        sa.Column('recommended_seasons', postgresql.ARRAY(season_enum), nullable=True),
        sa.Column('time_of_day', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('occasion', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('energy_intention', sa.String(100), nullable=True),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # ==========================================
    # CALCULATION AND ANALYTICS TABLES
    # ==========================================

    # Calculation cache table
    op.create_table('calculation_cache',
        sa.Column('id', postgresql.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('cache_key', sa.String(255), nullable=False),
        sa.Column('calculation_type', sa.String(100), nullable=False),
        sa.Column('input_data', postgresql.JSONB(), nullable=False),
        sa.Column('result_data', postgresql.JSONB(), nullable=False),
        sa.Column('expires_at', postgresql.TIMESTAMP(timezone=True), nullable=False),
        sa.Column('hit_count', sa.Integer(), nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('last_accessed_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('cache_key')
    )

    # User calculations table
    op.create_table('user_calculations',
        sa.Column('id', postgresql.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(), nullable=False),
        sa.Column('calculation_type', sa.String(100), nullable=False),
        sa.Column('input_data', postgresql.JSONB(), nullable=False),
        sa.Column('result_data', postgresql.JSONB(), nullable=False),
        sa.Column('execution_time_ms', sa.Integer(), nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Recommendations table
    op.create_table('recommendations',
        sa.Column('id', postgresql.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(), nullable=False),
        sa.Column('request_context', postgresql.JSONB(), nullable=False),
        sa.Column('recommended_recipes', postgresql.ARRAY(postgresql.UUID()), nullable=False),
        sa.Column('recipe_scores', postgresql.JSONB(), nullable=False),
        sa.Column('algorithm_version', sa.String(50), nullable=False),
        sa.Column('user_feedback', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # System metrics table
    op.create_table('system_metrics',
        sa.Column('id', postgresql.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('metric_name', sa.String(100), nullable=False),
        sa.Column('metric_value', sa.Float(precision=4), nullable=False),
        sa.Column('metric_unit', sa.String(50), nullable=True),
        sa.Column('tags', postgresql.JSONB(), nullable=True),
        sa.Column('timestamp', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # ==========================================
    # INDEXES
    # ==========================================

    # User table indexes
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_roles', 'users', ['roles'], postgresql_using='gin')
    op.create_index('idx_users_active', 'users', ['is_active'], postgresql_where=sa.text('is_active = true'))
    op.create_index('idx_users_created_at', 'users', ['created_at'])

    # API keys indexes
    op.create_index('idx_api_keys_user_id', 'api_keys', ['user_id'])
    op.create_index('idx_api_keys_hash', 'api_keys', ['key_hash'])
    op.create_index('idx_api_keys_active', 'api_keys', ['is_active'], postgresql_where=sa.text('is_active = true'))

    # Elemental properties indexes
    op.create_index('idx_elemental_props_entity', 'elemental_properties', ['entity_type', 'entity_id'])
    op.create_index('idx_elemental_props_fire', 'elemental_properties', ['fire'])
    op.create_index('idx_elemental_props_water', 'elemental_properties', ['water'])
    op.create_index('idx_elemental_props_earth', 'elemental_properties', ['earth'])
    op.create_index('idx_elemental_props_air', 'elemental_properties', ['air'])

    # Planetary influences indexes
    op.create_index('idx_planetary_entity', 'planetary_influences', ['entity_type', 'entity_id'])
    op.create_index('idx_planetary_planet', 'planetary_influences', ['planet'])
    op.create_index('idx_planetary_strength', 'planetary_influences', ['influence_strength'])
    op.create_index('idx_planetary_primary', 'planetary_influences', ['is_primary'], postgresql_where=sa.text('is_primary = true'))

    # Zodiac affinities indexes
    op.create_index('idx_zodiac_entity', 'zodiac_affinities', ['entity_type', 'entity_id'])
    op.create_index('idx_zodiac_sign', 'zodiac_affinities', ['zodiac_sign'])

    # Seasonal associations indexes
    op.create_index('idx_seasonal_entity', 'seasonal_associations', ['entity_type', 'entity_id'])
    op.create_index('idx_seasonal_season', 'seasonal_associations', ['season'])

    # Ingredients indexes
    op.create_index('idx_ingredients_name', 'ingredients', ['name'], postgresql_using='gin', postgresql_ops={'name': 'gin_trgm_ops'})
    op.create_index('idx_ingredients_category', 'ingredients', ['category'])
    op.create_index('idx_ingredients_subcategory', 'ingredients', ['subcategory'])
    op.create_index('idx_ingredients_active', 'ingredients', ['is_active'], postgresql_where=sa.text('is_active = true'))
    op.create_index('idx_ingredients_flavor', 'ingredients', ['flavor_profile'], postgresql_using='gin')

    # Ingredient cuisine indexes
    op.create_index('idx_ingredient_cuisines_ingredient', 'ingredient_cuisines', ['ingredient_id'])
    op.create_index('idx_ingredient_cuisines_cuisine', 'ingredient_cuisines', ['cuisine'])

    # Ingredient compatibility indexes
    op.create_index('idx_compatibility_a', 'ingredient_compatibility', ['ingredient_a_id'])
    op.create_index('idx_compatibility_b', 'ingredient_compatibility', ['ingredient_b_id'])
    op.create_index('idx_compatibility_score', 'ingredient_compatibility', ['compatibility_score'])

    # Recipe indexes
    op.create_index('idx_recipes_name', 'recipes', ['name'], postgresql_using='gin', postgresql_ops={'name': 'gin_trgm_ops'})
    op.create_index('idx_recipes_cuisine', 'recipes', ['cuisine'])
    op.create_index('idx_recipes_category', 'recipes', ['category'])
    op.create_index('idx_recipes_difficulty', 'recipes', ['difficulty_level'])
    op.create_index('idx_recipes_prep_time', 'recipes', ['prep_time_minutes'])
    op.create_index('idx_recipes_cook_time', 'recipes', ['cook_time_minutes'])
    op.create_index('idx_recipes_dietary', 'recipes', ['dietary_tags'], postgresql_using='gin')
    op.create_index('idx_recipes_popularity', 'recipes', ['popularity_score'])
    op.create_index('idx_recipes_rating', 'recipes', ['user_rating'])
    op.create_index('idx_recipes_public', 'recipes', ['is_public'], postgresql_where=sa.text('is_public = true'))
    op.create_index('idx_recipes_created_at', 'recipes', ['created_at'])

    # Recipe ingredients indexes
    op.create_index('idx_recipe_ingredients_recipe', 'recipe_ingredients', ['recipe_id'])
    op.create_index('idx_recipe_ingredients_ingredient', 'recipe_ingredients', ['ingredient_id'])
    op.create_index('idx_recipe_ingredients_order', 'recipe_ingredients', ['recipe_id', 'order_index'])

    # Recipe contexts indexes
    op.create_index('idx_recipe_contexts_recipe', 'recipe_contexts', ['recipe_id'])
    op.create_index('idx_recipe_contexts_moon_phases', 'recipe_contexts', ['recommended_moon_phases'], postgresql_using='gin')
    op.create_index('idx_recipe_contexts_seasons', 'recipe_contexts', ['recommended_seasons'], postgresql_using='gin')

    # Calculation cache indexes
    op.create_index('idx_cache_key', 'calculation_cache', ['cache_key'])
    op.create_index('idx_cache_type', 'calculation_cache', ['calculation_type'])
    op.create_index('idx_cache_expires', 'calculation_cache', ['expires_at'])
    op.create_index('idx_cache_hits', 'calculation_cache', ['hit_count'])

    # User calculations indexes
    op.create_index('idx_user_calc_user', 'user_calculations', ['user_id'])
    op.create_index('idx_user_calc_type', 'user_calculations', ['calculation_type'])
    op.create_index('idx_user_calc_created', 'user_calculations', ['created_at'])

    # Recommendations indexes
    op.create_index('idx_recommendations_user', 'recommendations', ['user_id'])
    op.create_index('idx_recommendations_created', 'recommendations', ['created_at'])
    op.create_index('idx_recommendations_recipes', 'recommendations', ['recommended_recipes'], postgresql_using='gin')

    # System metrics indexes
    op.create_index('idx_metrics_name', 'system_metrics', ['metric_name'])
    op.create_index('idx_metrics_timestamp', 'system_metrics', ['timestamp'])
    op.create_index('idx_metrics_tags', 'system_metrics', ['tags'], postgresql_using='gin')

    # ==========================================
    # TRIGGERS AND FUNCTIONS
    # ==========================================

    # Function to update updated_at timestamp
    op.execute("""
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
    """)

    # Triggers for updated_at
    op.execute("CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();")
    op.execute("CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();")
    op.execute("CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();")
    op.execute("CREATE TRIGGER update_elemental_props_updated_at BEFORE UPDATE ON elemental_properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();")

    # Function to clean expired cache entries
    op.execute("""
    CREATE OR REPLACE FUNCTION clean_expired_cache()
    RETURNS INTEGER AS $$
    DECLARE
        deleted_count INTEGER;
    BEGIN
        DELETE FROM calculation_cache WHERE expires_at < CURRENT_TIMESTAMP;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RETURN deleted_count;
    END;
    $$ LANGUAGE plpgsql;
    """)

    # Function to calculate recipe popularity score
    op.execute("""
    CREATE OR REPLACE FUNCTION update_recipe_popularity()
    RETURNS TRIGGER AS $$
    BEGIN
        UPDATE recipes
        SET popularity_score = LEAST(1.0, (
            (COALESCE(rating_count, 0) * 0.3) +
            (COALESCE(user_rating, 0) * 0.1) +
            (popularity_score * 0.6)
        ))
        WHERE id = NEW.id;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """)

    # Trigger for recipe popularity updates
    op.execute("""
    CREATE TRIGGER update_recipe_popularity_trigger
        AFTER UPDATE OF user_rating, rating_count ON recipes
        FOR EACH ROW
        EXECUTE FUNCTION update_recipe_popularity();
    """)

    # ==========================================
    # INITIAL DATA
    # ==========================================

    # Create admin user
    op.execute("""
    INSERT INTO users (email, password_hash, roles, is_active, email_verified)
    VALUES (
        'admin@alchm.kitchen',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- 'admin123'
        '{admin}',
        true,
        true
    ) ON CONFLICT (email) DO NOTHING;
    """)

    # Create service user for backend communications
    op.execute("""
    INSERT INTO users (email, password_hash, roles, is_active, email_verified)
    VALUES (
        'service@alchm.kitchen',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- 'service123'
        '{service}',
        true,
        true
    ) ON CONFLICT (email) DO NOTHING;
    """)

    # ==========================================
    # VIEWS
    # ==========================================

    # Create view for quick user lookup
    op.execute("""
    CREATE VIEW active_users AS
    SELECT id, email, roles, created_at, last_login_at, login_count
    FROM users
    WHERE is_active = true;
    """)

    # Create view for recipe search
    op.execute("""
    CREATE VIEW recipe_search AS
    SELECT
        r.id,
        r.name,
        r.description,
        r.cuisine,
        r.category,
        r.prep_time_minutes,
        r.cook_time_minutes,
        r.difficulty_level,
        r.dietary_tags,
        r.popularity_score,
        r.user_rating,
        ep.fire,
        ep.water,
        ep.earth,
        ep.air
    FROM recipes r
    LEFT JOIN elemental_properties ep ON (ep.entity_type = 'recipe' AND ep.entity_id = r.id)
    WHERE r.is_public = true;
    """)

    # ==========================================
    # PERMISSIONS
    # ==========================================

    # Note: These would be set up by the database administrator
    # They are included here for completeness but may need adjustment
    op.execute("GRANT CONNECT ON DATABASE alchm_kitchen TO alchm_app;")
    op.execute("GRANT USAGE ON SCHEMA public TO alchm_app;")
    op.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO alchm_app;")
    op.execute("GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO alchm_app;")

    # Set default permissions for future tables
    op.execute("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO alchm_app;")
    op.execute("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO alchm_app;")

    # ==========================================
    # COMMENTS
    # ==========================================

    op.execute("COMMENT ON DATABASE alchm_kitchen IS 'alchm.kitchen production database - optimized for alchemical calculations and recipe recommendations';")
    op.execute("COMMENT ON TABLE users IS 'User authentication and profile management';")
    op.execute("COMMENT ON TABLE ingredients IS 'Master ingredient database with alchemical properties';")
    op.execute("COMMENT ON TABLE recipes IS 'Recipe database with elemental and cultural information';")
    op.execute("COMMENT ON TABLE elemental_properties IS 'Four-element alchemical properties for all entities';")
    op.execute("COMMENT ON TABLE calculation_cache IS 'Performance cache for expensive alchemical calculations';")


def downgrade() -> None:
    """Drop all tables and revert the schema."""

    # Drop views
    op.execute("DROP VIEW IF EXISTS recipe_search;")
    op.execute("DROP VIEW IF EXISTS active_users;")

    # Drop triggers and functions
    op.execute("DROP TRIGGER IF EXISTS update_recipe_popularity_trigger ON recipes;")
    op.execute("DROP FUNCTION IF EXISTS update_recipe_popularity();")
    op.execute("DROP FUNCTION IF EXISTS clean_expired_cache();")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column();")

    # Drop tables (in reverse order to handle foreign keys)
    op.drop_table('system_metrics')
    op.drop_table('recommendations')
    op.drop_table('user_calculations')
    op.drop_table('calculation_cache')
    op.drop_table('recipe_contexts')
    op.drop_table('recipe_ingredients')
    op.drop_table('recipes')
    op.drop_table('ingredient_compatibility')
    op.drop_table('ingredient_cuisines')
    op.drop_table('ingredients')
    op.drop_table('seasonal_associations')
    op.drop_table('zodiac_affinities')
    op.drop_table('planetary_influences')
    op.drop_table('elemental_properties')
    op.drop_table('api_keys')
    op.drop_table('users')

    # Drop enums
    op.execute("DROP TYPE IF EXISTS dietary_restriction;")
    op.execute("DROP TYPE IF EXISTS cuisine_type;")
    op.execute("DROP TYPE IF EXISTS season;")
    op.execute("DROP TYPE IF EXISTS lunar_phase;")
    op.execute("DROP TYPE IF EXISTS zodiac_sign;")
    op.execute("DROP TYPE IF EXISTS planet_type;")
    op.execute("DROP TYPE IF EXISTS user_role;")

    # Drop extensions (optional - may be used by other databases)
    # op.execute('DROP EXTENSION IF EXISTS "pg_trgm";')
    # op.execute('DROP EXTENSION IF EXISTS "btree_gin";')
    # op.execute('DROP EXTENSION IF EXISTS "uuid-ossp";')
