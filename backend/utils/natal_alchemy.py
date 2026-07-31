"""
Natal Alchemy & ESMS Physics Calculation Engine - Python Backend

Calculates authoritative ESMS quantities (Spirit, Essence, Matter, Substance)
for a natal or transit chart using Planet Identity x Sect, continuous positional physics,
and gravitational inertia. Purges phantom points (North Node).
"""

import math
from typing import Dict, Any, Optional
from backend.utils.planetary_alchemy import (
    ESMS_PLANETS,
    PLANETARY_SECTARIAN_ESMS,
    ZODIAC_ELEMENTS,
    get_normalized_alchm_weight,
    get_gravitational_inertia,
    get_tidal_pull,
    calculate_positional_ascendant_vessel,
)

def calculate_natal_alchemical_quantities(
    planetary_positions: Dict[str, Any],
    is_diurnal: bool = True
) -> Dict[str, Any]:
    """
    Calculates authoritatively unified Alchemical Quantities (Spirit, Essence, Matter, Substance)
    based on planetary positions, sect (diurnal vs nocturnal), and geocentric distance physics.
    """
    sect_key = "diurnal" if is_diurnal else "nocturnal"
    
    # Initialize totals
    esms_totals = {"Spirit": 0.0, "Essence": 0.0, "Matter": 0.0, "Substance": 0.0}
    elements_raw = {"Fire": 0.0, "Earth": 0.0, "Air": 0.0, "Water": 0.0}
    
    total_planet_weight = 0.0
    total_inertia = 0.0
    total_tidal_pull = 0.0
    
    # Process strictly valid planetary bodies (Purging North Node and phantom points)
    for body, pos in planetary_positions.items():
        if not isinstance(pos, dict):
            continue
            
        body_clean = body.strip().title()
        if body_clean not in ESMS_PLANETS:
            continue  # Exclude North Node, MC, Chiron, etc.
            
        sign = str(pos.get("sign", "")).strip().lower()
        degree = float(pos.get("degree", 0.0))
        distance_au = pos.get("distance", None)
        if distance_au is not None:
            try:
                distance_au = float(distance_au)
            except (ValueError, TypeError):
                distance_au = None

        # Elemental placement
        element = ZODIAC_ELEMENTS.get(sign, "Earth")
        alchm_weight = get_normalized_alchm_weight(body_clean)
        inertia = get_gravitational_inertia(body_clean, distance_au)
        tidal_pull = get_tidal_pull(body_clean, distance_au)
        
        elements_raw[element] += alchm_weight
        total_planet_weight += alchm_weight
        total_inertia += inertia
        total_tidal_pull += tidal_pull
        
        # Sectarian ESMS contribution
        sect_esms = PLANETARY_SECTARIAN_ESMS.get(body_clean, {}).get(
            sect_key, {"Spirit": 0.0, "Essence": 0.0, "Matter": 0.0, "Substance": 0.0}
        )
        
        for key in esms_totals:
            esms_totals[key] += sect_esms.get(key, 0.0) * inertia

    # Grounding Ascendant Vessel (Positional)
    asc_pos = planetary_positions.get("Ascendant") or planetary_positions.get("ascendant")
    if isinstance(asc_pos, dict):
        asc_sign = str(asc_pos.get("sign", "aries"))
        asc_degree = float(asc_pos.get("degree", 0.0))
    else:
        asc_sign = "aries"
        asc_degree = 0.0
        
    asc_vessel = calculate_positional_ascendant_vessel(asc_sign, asc_degree)
    asc_weight = get_normalized_alchm_weight("Ascendant")
    asc_inertia = get_gravitational_inertia("Ascendant")
    
    total_inertia += asc_inertia
    for key in esms_totals:
        esms_totals[key] += asc_vessel.get(key, 0.5) * asc_inertia

    # Normalize elements
    total_elem = sum(elements_raw.values())
    if total_elem > 0:
        elemental_balance = {k: round(v / total_elem, 4) for k, v in elements_raw.items()}
    else:
        elemental_balance = {"Fire": 0.25, "Earth": 0.25, "Air": 0.25, "Water": 0.25}

    # Absolute ESMS scores
    spirit = round(esms_totals["Spirit"], 4)
    essence = round(esms_totals["Essence"], 4)
    matter = round(esms_totals["Matter"], 4)
    substance = round(esms_totals["Substance"], 4)

    # Reactivity: Strictly (Matter + Earth)^2
    earth_val = elemental_balance.get("Earth", 0.25)
    reactivity_denom = (matter + earth_val) ** 2
    reactivity = round(reactivity_denom, 4)

    # Continuous Monica Equilibrium calculation
    # Monica phi equilibrium = 1.618; non-zero signed continuous readout
    ln_arg = (spirit + essence + 0.05) / (matter + substance + 0.05)
    monica = round(1.618 * math.log(max(ln_arg, 1e-6)), 4)

    return {
        "spirit": spirit,
        "essence": essence,
        "matter": matter,
        "substance": substance,
        "elemental_balance": elemental_balance,
        "reactivity": reactivity,
        "inertia": round(total_inertia, 4),
        "tidal_pull": round(total_tidal_pull, 4),
        "monica": monica,
        "is_diurnal": is_diurnal,
    }
