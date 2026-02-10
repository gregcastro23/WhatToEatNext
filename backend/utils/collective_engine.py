from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import collections

# Attempt to import SQLAlchemy session if needed for DB access,
# although this engine might primarily work with passed-in data objects.
try:
    from sqlalchemy.orm import Session
    from database import TransitHistory
except ImportError:
    # Graceful fallback or mocking for standalone testing
    Session = Any
    TransitHistory = Any

class CollectiveSynastryEngine:
    """
    Core logic for calculating group equilibrium and collective elemental deficits (Phase 7).
    """

    def __init__(self):
        pass

    def calculate_group_equilibrium(self, chart_data_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Aggregates elemental data from multiple user charts to determine the "Collective Midpoint".

        Args:
            chart_data_list: A list of dicts, where each dict represents a user's calculated chart data.
                             Expected format per user:
                             {
                                 "user_id": int/str,
                                 "elemental_distribution": {"Fire": 0.3, "Water": 0.2, ...},
                                 "smes_scores": {"Spirit": 10, "Matter": 8, ...}
                             }

        Returns:
            Dict containing:
            - collective_elemental_deficit: {Element: score} (inverse of the group's abundance)
            - group_smes_balance: Average SMES scores
            - participant_count: int
        """
        if not chart_data_list:
            return {}

        num_participants = len(chart_data_list)

        # 1. Aggregate Elemental Distribution
        total_elements = collections.defaultdict(float)

        # 2. Aggregate SMES Scores (Spirit, Matter, Essence, Substance)
        total_smes = collections.defaultdict(float)

        for chart in chart_data_list:
            # Elements
            elements = chart.get("elemental_distribution", {})
            for elem, score in elements.items():
                total_elements[elem] += score

            # SMES
            smes = chart.get("smes_scores", {})
            for cat, val in smes.items():
                total_smes[cat] += val

        # 3. Calculate Averages
        avg_elements = {k: v / num_participants for k, v in total_elements.items()}
        avg_smes = {k: v / num_participants for k, v in total_smes.items()}

        # 4. Determine Deficits (Inverse of abundance)
        # We want to recommend foods that balance the group.
        # If the group has high Fire, we might want less Fire or balancing Water/Earth depending on the alchemy logic.
        # Simple Logic: Target is 1.0 (or balanced). Deficit = (Target - Current) relative to others.
        # Better Logic for "Deficit":
        # Identify the lowest element in the group average. This is what the group LACKS.

        # Normalize avg_elements to sum to 1.0 (if not already)
        total_avg_mass = sum(avg_elements.values()) or 1.0
        normalized_avg = {k: v / total_avg_mass for k, v in avg_elements.items()}

        # The "Deficit" is the gap between the ideal (0.25 per element) and the actual.
        # Positive value means we need MORE of it.
        # Negative value means we have TOO MUCH.
        elemental_deficits = {k: 0.25 - v for k, v in normalized_avg.items()}

        # Verify SMES balance (just return averages for logging)

        return {
            "participant_count": num_participants,
            "average_elemental_distribution": normalized_avg,
            "elemental_deficits": elemental_deficits,
            "group_smes_scores": avg_smes,
            "is_collective": num_participants > 1
        }
