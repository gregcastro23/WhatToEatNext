"""
Kitchen Intelligence Service - Port 8100
Handles recipe recommendations and culinary matching
Phase 1 Infrastructure Migration - September 26, 2025
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import random
from sqlalchemy.orm import Session
from sqlalchemy import text

# Database imports
from database import get_db, Recipe, Ingredient, Recommendation, SystemMetric, ElementalProperties, ZodiacAffinity, SeasonalAssociation

# External data imports for cuisine and sauce recommendations
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'data'))

# Import cuisine data (we'll need to handle this carefully)
try:
    from cuisines import cuisines
    CUISINES_AVAILABLE = True
except ImportError:
    CUISINES_AVAILABLE = False
    cuisines = {}

try:
    from sauces import allSauces
    SAUCES_AVAILABLE = True
except ImportError:
    SAUCES_AVAILABLE = False
    allSauces = {}

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
    title="alchm.kitchen Kitchen Intelligence API",
    description="Culinary recommendations and recipe matching",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://alchm.kitchen"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class ElementalProperties(BaseModel):
    Fire: float
    Water: float
    Earth: float
    Air: float

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
                match_reasons.append(".2f")

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
        recipes_with_affinity = db.execute("""
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
        """, {"zodiac_sign": zodiac_sign, "limit": limit}).fetchall()

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
        seasonal_recipes = db.execute("""
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
        """, {"season": season, "limit": limit}).fetchall()

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
                sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'utils'))
                from astrologyUtils import getCurrentAstrologicalState

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
                ingredients_result = db.execute(sql_text("""
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

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check with database connectivity and statistics"""
    try:
        # Test database connectivity
        result = db.execute(text("SELECT 1 as test")).fetchone()

        # Get recipe and ingredient counts
        recipe_count = db.query(Recipe).filter(Recipe.is_public == True).count()
        ingredient_count = db.query(Ingredient).filter(Ingredient.is_active == True).count()

        # Get recent recommendations count
        recent_recommendations = db.query(Recommendation).filter(
            Recommendation.created_at >= datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        ).count()

        return {
            "status": "healthy",
            "service": "kitchen-intelligence",
            "database": "connected",
            "public_recipes": recipe_count,
            "active_ingredients": ingredient_count,
            "recommendations_today": recent_recommendations,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "kitchen-intelligence",
            "database": f"error: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8100)
