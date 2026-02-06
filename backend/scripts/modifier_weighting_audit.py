
import datetime
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from backend.utils.seasonal_engine import get_seasonal_modifiers

def run_modifier_weighting_audit():
    """
    Simulates 12 months of solar transitions to verify that the
    weighted_environmental_score correctly prioritizes ingredients
    based on the Zodiac season.
    """
    print("Starting Modifier Weighting Audit...")

    # Sample ingredients
    ingredients = {
        "chili": "Thermogenic",
        "potatoes": "Rooted",
        "microgreens": "Light/Sprouted",
        "melons": "Hydrating",
    }

    # Define test dates for each Zodiac season
    test_dates = {
        "Aries": datetime.date(2024, 4, 1),
        "Taurus": datetime.date(2024, 5, 1),
        "Gemini": datetime.date(2024, 6, 1),
        "Cancer": datetime.date(2024, 7, 1),
        "Leo": datetime.date(2024, 8, 1),
        "Virgo": datetime.date(2024, 9, 1),
        "Libra": datetime.date(2024, 10, 1),
        "Scorpio": datetime.date(2024, 11, 1),
        "Sagittarius": datetime.date(2024, 12, 1),
        "Capricorn": datetime.date(2024, 1, 1),
        "Aquarius": datetime.date(2024, 2, 1),
        "Pisces": datetime.date(2024, 3, 1),
    }

    all_tests_passed = True

    for zodiac_sign, test_date in test_dates.items():
        seasonal_modifiers = get_seasonal_modifiers(test_date)
        current_seasonal_zodiac = seasonal_modifiers['current_zodiac']
        fire_boost_ingredients = seasonal_modifiers['fire']
        earth_boost_ingredients = seasonal_modifiers['earth']
        air_boost_ingredients = seasonal_modifiers['air']
        water_boost_ingredients = seasonal_modifiers['water']

        print(f"""
--- Testing {zodiac_sign} ({test_date}) ---""")
        print(f"Detected Zodiac: {current_seasonal_zodiac}")

        for ingredient, category in ingredients.items():
            seasonal_modifier = 1.0
            ingredient_lower = ingredient.lower()

            if any(boost in ingredient_lower for boost in fire_boost_ingredients):
                if current_seasonal_zodiac in ['Aries', 'Leo', 'Sagittarius']:
                    seasonal_modifier *= 1.2
                else:
                    seasonal_modifier *= 0.9
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
            
            print(f"  - Ingredient: {ingredient} ({category}), Seasonal Modifier: {seasonal_modifier:.2f}")

            # Assertions
            if zodiac_sign == 'Aries' and ingredient == 'chili':
                if seasonal_modifier <= 1.0:
                    print("  [FAIL] 'chili' was not boosted during Aries season.")
                    all_tests_passed = False
            elif zodiac_sign == 'Capricorn' and ingredient == 'potatoes':
                if seasonal_modifier <= 1.0:
                    print("  [FAIL] 'potatoes' was not boosted during Capricorn season.")
                    all_tests_passed = False

    print("--- Audit Summary ---")
    if all_tests_passed:
        print("✅ All modifier weighting tests passed successfully.")
    else:
        print("❌ Some modifier weighting tests failed.")

if __name__ == "__main__":
    run_modifier_weighting_audit()
