"""
Kitchen Intelligence Service - Port 8100
Handles recipe recommendations and culinary matching
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import random

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
async def get_recipe_recommendations(request: RecommendationRequest):
    """Get personalized recipe recommendations"""

    # Sample recipes with alchemical properties
    sample_recipes = [
        {
            "id": "spicy_stir_fry",
            "name": "Fiery Dragon Stir Fry",
            "cuisine": "Chinese",
            "prep_time": 15,
            "difficulty": 3,
            "elemental_score": 0.85,
            "planetary_alignment": 0.7,
            "match_reasons": ["High fire energy matches current planetary hour", "Balances water deficiency"]
        },
        {
            "id": "cooling_cucumber_salad",
            "name": "Moonlight Cucumber Salad",
            "cuisine": "Mediterranean",
            "prep_time": 10,
            "difficulty": 1,
            "elemental_score": 0.78,
            "planetary_alignment": 0.6,
            "match_reasons": ["Cooling water energy", "Quick preparation"]
        },
        {
            "id": "grounding_root_soup",
            "name": "Earth Mother's Root Soup",
            "cuisine": "European",
            "prep_time": 45,
            "difficulty": 2,
            "elemental_score": 0.72,
            "planetary_alignment": 0.8,
            "match_reasons": ["Strong earth grounding", "Seasonal alignment"]
        }
    ]

    # Filter and score recipes
    filtered_recipes = []
    for recipe in sample_recipes:
        if request.max_prep_time and recipe["prep_time"] > request.max_prep_time:
            continue
        if request.cuisine_preferences and recipe["cuisine"] not in request.cuisine_preferences:
            recipe["elemental_score"] *= 0.8  # Reduce score for non-preferred cuisine

        # Calculate total score
        total_score = (recipe["elemental_score"] * 0.6 + recipe["planetary_alignment"] * 0.4)

        filtered_recipes.append({
            "recipe": recipe,
            "score": total_score,
            "match_reasons": recipe["match_reasons"]
        })

    # Sort by score and limit results
    filtered_recipes.sort(key=lambda x: x["score"], reverse=True)
    recommendations = filtered_recipes[:request.limit]

    return {
        "recommendations": recommendations,
        "total_count": len(recommendations),
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
            "calculation_method": "alchemical_harmony_scoring"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "kitchen-intelligence", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8100)
