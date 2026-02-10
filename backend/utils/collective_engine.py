import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session # For potential DB interaction
from pydantic import BaseModel # New import for Pydantic model
from ..utils.alchemical_quantities import calculate_alchemical_quantities # To get SMES
from ..utils.transit_engine import get_transit_details, calculate_total_potency_score, get_planetary_hour, get_zodiac_sign_and_element # Added get_zodiac_sign_and_element
from ..config.celestial_config import FOREST_HILLS_COORDINATES # For common location
from backend.database import Recipe, ElementalProperties # For fetching recipes and their properties
from fastapi import HTTPException # For consistency with other backend errors
from backend.alchm_kitchen.main import calculate_planetary_positions_swisseph # New import for planetary positions

class ChartData(BaseModel):
    year: int
    month: int
    day: int
    hour: int
    minute: int
    latitude: float
    longitude: float
    timezone_str: str # Use timezone string for consistency
    # Optional unique identifier for the user/chart
    user_id: Optional[str] = None
    chart_id: Optional[str] = None


class CollectiveSynastryEngine:
    def __init__(self, db_session: Session):
        self.db_session = db_session
        self.latitude = FOREST_HILLS_COORDINATES["latitude"]
        self.longitude = FOREST_HILLS_COORDINATES["longitude"]
        self.timezone_str = FOREST_HILLS_COORDINATES["timezone"]

    async def _get_individual_elemental_snapshot(self, participant_chart_data: ChartData) -> Dict[str, Any]:
        """
        Calculates the current elemental and alchemical snapshot for a single participant
        based on their birth chart and current transits.
        """
        # Get current transit details (these are global for the current moment)
        transit_info = get_transit_details()
        if "error" in transit_info:
            raise HTTPException(status_code=500, detail=f"Failed to get transit details for individual snapshot: {transit_info['error']}")
        
        # Get current planetary hour for the participant's *current* location
        # (Assuming participant_chart_data.latitude/longitude is their current location, or using Forest Hills)
        current_latitude = participant_chart_data.latitude if participant_chart_data.latitude else self.latitude
        current_longitude = participant_chart_data.longitude if participant_chart_data.longitude else self.longitude
        planetary_hour_ruler = get_planetary_hour(current_latitude, current_longitude)

        # Determine the participant's natal Sun Sign Element
        # We need their natal Sun longitude. Reusing calculate_planetary_positions_swisseph
        natal_planetary_positions = calculate_planetary_positions_swisseph(
            participant_chart_data.year, participant_chart_data.month, participant_chart_data.day,
            participant_chart_data.hour, participant_chart_data.minute
        )
        natal_sun_longitude = natal_planetary_positions["positions"]["Sun"]["exactLongitude"]
        _, natal_sun_element = get_zodiac_sign_and_element(natal_sun_longitude)

        # For the purpose of getting individual SMES, we need a "dummy recipe" to pass
        class DummyElementalProperties:
            fire = 0.25
            water = 0.25
            earth = 0.25
            air = 0.25

        class DummyRecipe:
            id = "dummy_id"
            name = "Neutral Elemental Profile"
            elementalProperties = DummyElementalProperties()

        dummy_recipe = DummyRecipe()
        
        # Calculate initial potency and kinetic/thermo for a neutral profile,
        # considering the individual's natal Sun Element and current transits
        potency_and_physics = calculate_total_potency_score(
            dummy_recipe,
            transit_info.get("dominant_transit"), # Current dominant transit
            natal_sun_element, # Participant's natal Sun Element
            planetary_hour_ruler # Current planetary hour ruler for participant's location
        )

        # Calculate SMES for the individual based on this neutral profile and current transits
        smes_quantities = calculate_alchemical_quantities(
            dummy_recipe,
            potency_and_physics["kinetic_rating"],
            planetary_hour_ruler,
            potency_and_physics["thermo_rating"]
        )

        return {
            "chart_data": participant_chart_data.model_dump(), # Original birth data
            "current_transit_info": transit_info,
            "planetary_hour_ruler": planetary_hour_ruler,
            "natal_sun_element": natal_sun_element,
            "potency_and_physics": potency_and_physics,
            "smes_scores": smes_quantities
        }

    async def calculate_collective_elemental_deficits(self, participant_charts: List[ChartData]) -> Dict[str, Any]:
        """
        Aggregates individual elemental states to find a collective imbalance.
        """
        if not participant_charts:
            return {"error": "No participant charts provided."}

        collective_smes = {
            "spirit_score": 0.0,
            "matter_score": 0.0,
            "essence_score": 0.0,
            "substance_score": 0.0,
            "kinetic_val": 0.0,
            "thermo_val": 0.0,
        }
        num_participants = len(participant_charts)

        for chart_data in participant_charts:
            snapshot = await self._get_individual_elemental_snapshot(chart_data)
            smes = snapshot["smes_scores"]

            collective_smes["spirit_score"] += smes.get("spirit_score", 0)
            collective_smes["matter_score"] += smes.get("matter_score", 0)
            collective_smes["essence_score"] += smes.get("essence_score", 0)
            collective_smes["substance_score"] += smes.get("substance_score", 0)
            collective_smes["kinetic_val"] += smes.get("kinetic_val", 0)
            collective_smes["thermo_val"] += smes.get("thermo_val", 0)

        for key in collective_smes:
            collective_smes[key] /= num_participants

        collective_deficit_analysis = {}

        if collective_smes["matter_score"] > 0.6 and collective_smes["spirit_score"] < 0.4:
            collective_deficit_analysis["imbalance_type"] = "Collective Matter Stagnation"
            collective_deficit_analysis["harmonizing_profile"] = "Spirit-boosting (Kinetic)"
        elif collective_smes["spirit_score"] > 0.6 and collective_smes["matter_score"] < 0.4:
            collective_deficit_analysis["imbalance_type"] = "Collective Spirit Volatility"
            collective_deficit_analysis["harmonizing_profile"] = "Matter-grounding (Stabilizing)"
        else:
            collective_deficit_analysis["imbalance_type"] = "Collective Balance"
            collective_deficit_analysis["harmonizing_profile"] = "Balanced & Harmonious"

        return {
            "collective_smes_averages": collective_smes,
            "collective_deficit_analysis": collective_deficit_analysis,
        }

    async def generate_harmonizing_recipe_profile(self, collective_deficit: Dict[str, Any]) -> str:
        """
        Suggests a high-level recipe profile based on the collective elemental deficit.
        """
        harmonizing_profile = collective_deficit["collective_deficit_analysis"]["harmonizing_profile"]
        if harmonizing_profile == "Spirit-boosting (Kinetic)":
            return "Recipe Profile: Light, energetic, and vibrant dishes, potentially with thermogenic ingredients, to boost collective Spirit and Kinetic energy."
        elif harmonizing_profile == "Matter-grounding (Stabilizing)":
            return "Recipe Profile: Hearty, nourishing, and stabilizing dishes, focusing on root vegetables, grains, and slow-cooked preparations, to balance collective Matter."
        else:
            return "Recipe Profile: A balanced and harmonious meal, focusing on diverse ingredients and gentle preparation methods, to maintain collective equilibrium."

    async def find_harmonizing_recipes(self, harmonizing_profile: str) -> List[Dict[str, Any]]:
        """
        (Placeholder) Finds actual recipes from the database that match the harmonizing profile.
        This would involve querying the Recipe table based on elemental properties, categories, etc.
        """
        # This is a complex database query that needs to be implemented.
        # For now, return a placeholder.
        return [{"placeholder_recipe": "Based on " + harmonizing_profile + ", look for recipes that match."}]

# Example Usage (for testing purposes)
if __name__ == "__main__":
    # Create a dummy session for testing
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from backend.database.connection import Base
    from backend.database.config import config as db_config

    # Use a in-memory SQLite for testing or a real DB if configured
    TEST_DATABASE_URL = "sqlite:///:memory:"
    test_engine = create_engine(TEST_DATABASE_URL)
    Base.metadata.create_all(test_engine)
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

    with TestSessionLocal() as db_session:
        engine = CollectiveSynastryEngine(db_session)

        # Example birth charts (using ChartData model)
        participant1_chart = ChartData(
            year=1990, month=5, day=20, hour=10, minute=30,
            latitude=40.7128, longitude=-74.0060, timezone_str="America/New_York"
        )
        participant2_chart = ChartData(
            year=1985, month=11, day=1, hour=18, minute=45,
            latitude=34.0522, longitude=-118.2437, timezone_str="America/Los_Angeles"
        )
        
        # NOTE: For get_transit_details and get_planetary_hour to work in a real scenario,
        # pyswisseph must be installed and ephemeris files must be set up correctly.
        # This example will likely fail if run directly without these.

        async def run_example():
            print("--- Collective Synastry Analysis ---")
            collective_deficits = await engine.calculate_collective_elemental_deficits([participant1_chart, participant2_chart])
            print("
Collective Deficits:")
            print(collective_deficits)

            harmonizing_profile_text = await engine.generate_harmonizing_recipe_profile(collective_deficits)
            print("
Harmonizing Recipe Profile:")
            print(harmonizing_profile_text)

            harmonizing_recipes = await engine.find_harmonizing_recipes(harmonizing_profile_text)
            print("
Harmonizing Recipes (Placeholder):")
            print(harmonizing_recipes)

        # Run the async example
        import asyncio
        asyncio.run(run_example())