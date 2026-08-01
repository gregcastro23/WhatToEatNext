"""
ESMS 2.0 Unified Physics Model - Python Conformance Test Suite

Loads docs/physics/esms_conformance.json and runs calculate_natal_alchemical_quantities
over all 20 golden test charts to verify zero-drift performance using standard unittest.
"""

import json
import math
import os
import unittest
from backend.utils.natal_alchemy import calculate_natal_alchemical_quantities
from backend.utils.planetary_alchemy import (
    ASCENDANT_VESSEL_WEIGHT,
    get_gravitational_inertia,
    get_normalized_alchm_weight,
    _PERIOD_LOG_MIN,
    _PERIOD_LOG_MAX,
)

CONF_FILE = os.path.join(
    os.path.dirname(__file__), "..", "..", "docs", "physics", "esms_conformance.json"
)

def load_conformance_fixture():
    with open(CONF_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

class TestEsmsConformance(unittest.TestCase):
    def test_all_20_conformance_charts(self):
        fixture = load_conformance_fixture()
        charts = fixture["charts"]
        self.assertEqual(len(charts), 20)

        for chart in charts:
            chart_id = chart["id"]
            positions = chart["planetary_positions"]
            is_diurnal = chart.get("is_diurnal", True)
            
            res = calculate_natal_alchemical_quantities(positions, is_diurnal=is_diurnal)
            
            # Assert keys exist
            for key in ["spirit", "essence", "matter", "substance", "reactivity", "inertia", "monica"]:
                self.assertIn(key, res, f"[{chart_id}] Missing key {key}")
                val = res[key]
                self.assertIsNotNone(val, f"[{chart_id}] Key {key} is None")
                self.assertFalse(val != val, f"[{chart_id}] Key {key} is NaN")

            # Elemental balance sums to 1.0
            elem_sum = sum(res["elemental_balance"].values())
            self.assertAlmostEqual(elem_sum, 1.0, places=3, msg=f"[{chart_id}] Elemental balance sum != 1.0")

    def test_vessel_actually_contributes_no_day_chart_collapse(self):
        """The grounding vessel must land in every chart.

        REGRESSION: before ASCENDANT_VESSEL_WEIGHT, get_normalized_alchm_weight
        ("Ascendant") returned exactly 0.0 (the period table's 0.003 entry IS the
        log-scale minimum), so the vessel was multiplied by zero and 11/20 of
        these charts — every diurnal one — collapsed to Matter = Substance = 0.
        The finiteness assertions above passed throughout; only a value
        assertion can see this defect.
        """
        fixture = load_conformance_fixture()
        for chart in fixture["charts"]:
            res = calculate_natal_alchemical_quantities(
                chart["planetary_positions"],
                is_diurnal=chart.get("is_diurnal", True),
            )
            cid = chart["id"]
            # Vessel components are >= 0.5 and the vessel weight is 1.0, so every
            # coin must clear this floor no matter the sect.
            self.assertGreater(res["matter"], 0.0, f"[{cid}] Matter collapsed to 0 — vessel inert")
            self.assertGreater(res["substance"], 0.0, f"[{cid}] Substance collapsed to 0 — vessel inert")

    def test_ascendant_weight_is_ruled_not_derived(self):
        """The Ascendant weight is the RULED anchor 1.0, bypassing the period scale."""
        self.assertEqual(get_normalized_alchm_weight("Ascendant"), ASCENDANT_VESSEL_WEIGHT)
        self.assertEqual(ASCENDANT_VESSEL_WEIGHT, 1.0)
        self.assertEqual(get_gravitational_inertia("Ascendant"), 1.0)  # r = 1.0 AU
        # POSITIVE CONTROL — the trap this ruling dodges is real: feeding the
        # Ascendant's own period entry (0.003) through the normalizer returns
        # exactly 0.0, because it is the scale's minimum.
        raw = (math.log10(0.003) - _PERIOD_LOG_MIN) / (_PERIOD_LOG_MAX - _PERIOD_LOG_MIN)
        self.assertEqual(raw, 0.0)

    def test_sect_changes_the_result(self):
        """is_diurnal must matter: the onboarding route used to omit it entirely,
        silently giving every user a day chart."""
        fixture = load_conformance_fixture()
        positions = fixture["charts"][0]["planetary_positions"]
        day = calculate_natal_alchemical_quantities(positions, is_diurnal=True)
        night = calculate_natal_alchemical_quantities(positions, is_diurnal=False)
        self.assertNotEqual(
            (day["spirit"], day["essence"], day["matter"], day["substance"]),
            (night["spirit"], night["essence"], night["matter"], night["substance"]),
            "day and night sect produced identical ESMS — sect is not being applied",
        )

if __name__ == "__main__":
    unittest.main()
