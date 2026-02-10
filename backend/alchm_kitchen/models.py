from pydantic import BaseModel, Field
from typing import List, Optional

class RecipeRequest(BaseModel):
    recipe_id: Optional[str] = None
    # Support for collective synastry
    secondary_chart_ids: Optional[List[str]] = None

    # Nutritional Metrics (Required for Elemental Grounding)
    sodium: float = Field(..., description="Sodium content in mg. Maps to Water/Earth (Substance).")
    fiber: float = Field(..., description="Fiber content in g. Maps to Earth (Matter).")
    potassium: float = Field(..., description="Potassium content in mg. Maps to Water (Essence).")
    water_content: float = Field(..., description="Water content in g. Maps to Water (Essence).")
    vitamin_c: float = Field(..., description="Vitamin C content in mg. Maps to Fire (Spirit).")
    iron: float = Field(..., description="Iron content in mg. Maps to Fire (Spirit).")
