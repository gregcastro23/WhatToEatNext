from datetime import datetime
import math


def get_current_lunar_phase():
    """Calculates the approximate current lunar phase name and illumination."""
    known_new_moon = datetime(2023, 1, 21, 20, 53)
    now_utc = datetime.utcnow()
    synodic_period = 29.53058867
    days_since_new_moon = (now_utc - known_new_moon).total_seconds() / 86400
    phase_position = (days_since_new_moon / synodic_period) % 1.0
    illumination = 0.5 * (1 - math.cos(2 * math.pi * phase_position))

    phase_name = "Unknown"
    if phase_position < 0.03 or phase_position > 0.97:
        phase_name = "New Moon"
    elif 0.22 < phase_position < 0.28:
        phase_name = "First Quarter"
    elif 0.47 < phase_position < 0.53:
        phase_name = "Full Moon"
    elif 0.72 < phase_position < 0.78:
        phase_name = "Last Quarter"
    elif phase_position < 0.25:
        phase_name = "Waxing Crescent"
    elif phase_position < 0.5:
        phase_name = "Waxing Gibbous"
    elif phase_position < 0.75:
        phase_name = "Waning Gibbous"
    else:
        phase_name = "Waning Crescent"

    return {
        "phase_name": phase_name,
        "illumination_fraction": round(illumination, 3)
    }

def get_lunar_modifier(phase_name, ingredient_category):
    """Determines the affinity strength modifier based on the lunar phase and ingredient category."""
    modifier = 1.0
    if phase_name == "New Moon" and ingredient_category == "Root/Grounding":
        modifier = 1.20
    elif phase_name == "Full Moon" and ingredient_category == "High-Water/Cooling":
        modifier = 1.20
    elif "Waning" in phase_name and ingredient_category == "Detoxifying":
        modifier = 1.10
    return modifier
