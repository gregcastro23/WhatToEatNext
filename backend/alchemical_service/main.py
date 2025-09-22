"""
Alchemical Core Service - Port 8000
Handles elemental calculations, thermodynamics, and planetary influences
"""
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import math
import random
from datetime import datetime

app = FastAPI(
    title="alchm.kitchen Alchemical Core API",
    description="Core alchemical calculations and celestial integration",
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

class ThermodynamicsResult(BaseModel):
    heat: float
    entropy: float
    reactivity: float
    gregsEnergy: float
    equilibrium: float

@app.post("/calculate/elemental", response_model=ElementalProperties)
async def calculate_elemental_balance(ingredients: List[str], weights: Optional[List[float]] = None):
    """Calculate elemental balance from ingredients using advanced algorithms"""
    if not ingredients:
        return ElementalProperties(Fire=0.25, Water=0.25, Earth=0.25, Air=0.25)

    # Advanced elemental calculation (simplified for demo)
    base_fire = sum(0.3 + random.random() * 0.4 for _ in ingredients) / len(ingredients)
    base_water = sum(0.2 + random.random() * 0.4 for _ in ingredients) / len(ingredients)
    base_earth = sum(0.25 + random.random() * 0.3 for _ in ingredients) / len(ingredients)
    base_air = 1.0 - (base_fire + base_water + base_earth)

    # Normalize
    total = base_fire + base_water + base_earth + base_air
    return ElementalProperties(
        Fire=base_fire/total,
        Water=base_water/total,
        Earth=base_earth/total,
        Air=base_air/total
    )

@app.post("/calculate/thermodynamics", response_model=ThermodynamicsResult)
async def calculate_thermodynamics(elements: ElementalProperties):
    """Calculate thermodynamic properties from elemental balance"""
    heat = (elements.Fire * 0.8 + elements.Air * 0.3 - elements.Water * 0.2)
    entropy = (elements.Air * 0.7 + elements.Water * 0.5 - elements.Earth * 0.4 - elements.Fire * 0.3)
    reactivity = (elements.Fire * 0.9 + elements.Air * 0.6 - elements.Water * 0.3 - elements.Earth * 0.5)

    # Greg's Energy calculation
    harmony = 1 - abs(0.25 - elements.Fire) - abs(0.25 - elements.Water) - abs(0.25 - elements.Earth) - abs(0.25 - elements.Air)
    gregs_energy = harmony * 100 * (1 + heat * 0.1 - entropy * 0.1 + reactivity * 0.05)

    equilibrium = 1 - (abs(heat) + abs(entropy) + abs(reactivity)) / 3

    return ThermodynamicsResult(
        heat=max(-1, min(1, heat)),
        entropy=max(-1, min(1, entropy)),
        reactivity=max(-1, min(1, reactivity)),
        gregsEnergy=max(0, min(200, gregs_energy)),
        equilibrium=max(0, min(1, equilibrium))
    )

@app.get("/planetary/current-hour")
async def get_current_planetary_hour():
    """Get current planetary hour and influences"""
    current_time = datetime.now()
    hour = current_time.hour

    # Simplified planetary hour calculation
    planetary_hours = {
        "Sun": [6, 7, 13, 14, 20, 21],
        "Moon": [0, 1, 7, 8, 14, 15, 21, 22],
        "Mercury": [2, 9, 16, 23],
        "Venus": [3, 10, 17],
        "Mars": [4, 11, 18],
        "Jupiter": [5, 12, 19],
        "Saturn": [1, 8, 15, 22]
    }

    influences = {}
    for planet, hours in planetary_hours.items():
        influences[planet] = 0.8 if hour in hours else 0.3 + random.random() * 0.4

    dominant_planet = max(influences.items(), key=lambda x: x[1])

    return {
        "current_time": current_time.isoformat(),
        "dominant_planet": dominant_planet[0],
        "influence_strength": dominant_planet[1],
        "all_influences": influences
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "alchemical-core", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
