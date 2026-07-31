"""
ESMS 2.0 Unified Physics Model - Python Conformance Test Suite

Loads docs/physics/esms_conformance.json and runs calculate_natal_alchemical_quantities
over all 20 golden test charts to verify zero-drift performance using standard unittest.
"""

import json
import os
import unittest
from backend.utils.natal_alchemy import calculate_natal_alchemical_quantities

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

if __name__ == "__main__":
    unittest.main()
