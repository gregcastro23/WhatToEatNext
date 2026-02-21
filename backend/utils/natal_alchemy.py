from typing import Dict, Any

def calculate_natal_alchemical_quantities(planetary_positions: Dict[str, Any]) -> Dict[str, float]:
    """
    Calculates the Alchemical Quantities (Spirit, Essence, Matter, Substance)
    for a user based on their Natal Chart planetary positions.
    """
    
    # Elemental Weights
    elements = {"Fire": 0.0, "Earth": 0.0, "Air": 0.0, "Water": 0.0}
    
    # Sign to Element Map
    SIGN_ELEMENTS = {
        "aries": "Fire", "leo": "Fire", "sagittarius": "Fire",
        "taurus": "Earth", "virgo": "Earth", "capricorn": "Earth",
        "gemini": "Air", "libra": "Air", "aquarius": "Air",
        "cancer": "Water", "scorpio": "Water", "pisces": "Water"
    }
    
    # Planetary Weights (Importance in Chart)
    # Sun/Moon/Ascendant are most important
    PLANET_WEIGHTS = {
        "Sun": 3.0,
        "Moon": 3.0,
        "Ascendant": 3.0, # If present in positions
        "Mercury": 1.5,
        "Venus": 1.5,
        "Mars": 1.5,
        "Jupiter": 1.0,
        "Saturn": 1.0,
        "Uranus": 0.5,
        "Neptune": 0.5,
        "Pluto": 0.5,
        "North Node": 0.5
    }
    
    total_weight = 0.0
    
    for body, pos in planetary_positions.items():
        sign = pos.get("sign", "").lower()
        if sign in SIGN_ELEMENTS:
            element = SIGN_ELEMENTS[sign]
            weight = PLANET_WEIGHTS.get(body, 1.0)
            elements[element] += weight
            total_weight += weight
            
    # Normalize Elements
    if total_weight > 0:
        for e in elements:
            elements[e] /= total_weight
            
    # Calculate Alchemical Quantities
    # Spirit: Fire (Energy) + Air (Movement)
    spirit = (elements["Fire"] * 0.6) + (elements["Air"] * 0.4)
    
    # Essence: Water (Soul/Emotion) + Air (Communication)
    essence = (elements["Water"] * 0.6) + (elements["Air"] * 0.4)
    
    # Matter: Earth (Body) + Water (Biology)
    matter = (elements["Earth"] * 0.6) + (elements["Water"] * 0.4)
    
    # Substance: Earth (Structure) + Fire (Metabolism)
    substance = (elements["Earth"] * 0.6) + (elements["Fire"] * 0.4)
    
    # Normalize to 0-1 scale visually (approximated max possible is around 0.6+0.4=1.0)
    
    return {
        "spirit": round(spirit, 3),
        "essence": round(essence, 3),
        "matter": round(matter, 3),
        "substance": round(substance, 3),
        "elemental_balance": {k: round(v, 3) for k, v in elements.items()}
    }
