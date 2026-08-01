"""
Natal Alchemy & ESMS Physics Calculation Engine - Python Backend

Calculates authoritative ESMS quantities (Spirit, Essence, Matter, Substance)
for a natal or transit chart using planet identity, sect, dignity, aspects, and
continuous gravitational inertia. Purges phantom points (North Node).
"""

import math
from typing import Dict, Any
from backend.utils.planetary_alchemy import (
    ESMS_PLANETS,
    ZODIAC_ELEMENTS,
    get_inertial_mass_weight,
    get_gravitational_inertia,
    get_tidal_pull,
    calculate_alchemical_from_planets,
)

def calculate_natal_alchemical_quantities(
    planetary_positions: Dict[str, Any],
    is_diurnal: bool = True
) -> Dict[str, Any]:
    """
    Calculates authoritatively unified Alchemical Quantities (Spirit, Essence, Matter, Substance)
    based on planetary positions, sect (diurnal vs nocturnal), and geocentric distance physics.
    """
    # The ESMS vector comes from the one canonical three-layer engine. This
    # wrapper adds elementals and derived thermodynamic diagnostics only.
    esms_totals = calculate_alchemical_from_planets(
        planetary_positions,
        is_diurnal=is_diurnal,
        inject_ascendant=True,
    )
    elements_raw = {"Fire": 0.0, "Earth": 0.0, "Air": 0.0, "Water": 0.0}
    
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
        distance_au = pos.get("distance", None)
        if distance_au is not None:
            try:
                distance_au = float(distance_au)
            except (ValueError, TypeError):
                distance_au = None

        # Elemental placement, on the SAME inertial-mass scale as the ESMS
        # vector above. This function used to weight elementals by the orbital-
        # period scale while its ESMS came from the inertial-mass scale — two
        # roughly ANTI-correlated scales in one output (period privileges outer
        # planets, mass privileges Sun/Jupiter).
        element = ZODIAC_ELEMENTS.get(sign, "Earth")
        alchm_weight = get_inertial_mass_weight(body_clean)
        inertia = get_gravitational_inertia(body_clean, distance_au)
        tidal_pull = get_tidal_pull(body_clean, distance_au)
        
        elements_raw[element] += alchm_weight
        total_inertia += inertia
        total_tidal_pull += tidal_pull
        
    # The natal wrapper always carries a grounding vessel, supplied by the
    # chart or injected by the canonical engine for a legacy chart.
    asc_inertia = get_gravitational_inertia("Ascendant")
    total_inertia += asc_inertia

    # Normalize elements
    total_elem = sum(elements_raw.values())
    if total_elem > 0:
        elemental_balance = {k: round(v / total_elem, 4) for k, v in elements_raw.items()}
    else:
        elemental_balance = {"Fire": 0.25, "Earth": 0.25, "Air": 0.25, "Water": 0.25}

    # Absolute ESMS scores — FULL PRECISION, deliberately un-rounded.
    # §6 rule 2 of the quantization contract: all upstream math stays float64,
    # and display roundings MUST NOT feed the quantizer. The old round(..., 4)
    # here silently pre-quantized every downstream consumer at 1e-4 — including
    # the mint boundary — and capped cross-runtime parity checks at 5e-4.
    # Display formatting is the caller's concern.
    spirit = esms_totals["Spirit"]
    essence = esms_totals["Essence"]
    matter = esms_totals["Matter"]
    substance = esms_totals["Substance"]

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
