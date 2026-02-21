
import sys
import os
from datetime import datetime

# Add path
sys.path.append('/Users/GregCastro/Desktop/WhatToEatNext/backend')

from alchm_kitchen.models import RecipeRequest
from alchm_kitchen.recipe_generator import calculate_alchemical_scores

# Mock Session
class MockSession:
    def query(self, *args):
        return self
    def filter(self, *args):
        return self
    def first(self):
        return None # Return no recipe from DB to force metric usage

    def add(self, obj):
        print(f"Added to DB: {obj}")

    def commit(self):
        print("Committing to DB")

def test_backend_logic():
    print("Testing RecipeRequest Model...")
    req = RecipeRequest(
        recipe_id="test_id",
        secondary_chart_ids=["chart_1", "chart_2"],
        sodium=100.0,
        fiber=5.0,
        potassium=200.0,
        water_content=50.0,
        vitamin_c=10.0,
        iron=2.0
    )
    print("RecipeRequest created successfully.")

    print("\nTesting Alchemical Calculation Logic...")
    # Expected Logic:
    # Fire (Spirit) = (Vit C * 0.1) + (Iron * 2.0) = (10 * 0.1) + (2 * 2.0) = 1 + 4 = 5.0
    # Water (Essence) = (Water * 0.05) + (Potassium * 0.02) = (50 * 0.05) + (200 * 0.02) = 2.5 + 4 = 6.5
    # Earth (Matter) = Fiber * 2.0 = 5 * 2.0 = 10.0
    # Substance (Earth/Water) = Sodium * 0.05 = 100 * 0.05 = 5.0

    metrics = {
        "sodium": req.sodium,
        "fiber": req.fiber,
        "potassium": req.potassium,
        "water_content": req.water_content,
        "vitamin_c": req.vitamin_c,
        "iron": req.iron
    }

    db = MockSession()
    scores = calculate_alchemical_scores(req.recipe_id, db, metrics)

    # Assertions
    assert scores['spirit_fire'] == 5.0, f"Expected 5.0, got {scores['spirit_fire']}"
    assert scores['essence_water'] == 6.5, f"Expected 6.5, got {scores['essence_water']}"
    assert scores['matter_earth'] == 10.0, f"Expected 10.0, got {scores['matter_earth']}"
    assert scores['substance_earth_water'] == 5.0, f"Expected 5.0, got {scores['substance_earth_water']}"

    print("All assertions passed!")
    print("Scores:", scores)

if __name__ == "__main__":
    test_backend_logic()
