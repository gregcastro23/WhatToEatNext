"""Regenerate the frozen ESMS conformance fixture for the v2.3 engine.

This is intentionally a one-way v2.2.0 -> v2.3.0 transition. Expected values
come only from the Python canonical engine; expected_micro comes only from the
Python quantizer. TypeScript independently asserts both fields exactly.
"""

import json
from pathlib import Path

from backend.utils.esms_quantization import quantize_esms
from backend.utils.natal_alchemy import calculate_natal_alchemical_quantities


ROOT = Path(__file__).resolve().parents[2]
FIXTURE_PATH = ROOT / "docs" / "physics" / "esms_conformance.json"
SOURCE_VERSION = "2.2.0"
TARGET_VERSION = "2.3.0"
COINS = ("spirit", "essence", "matter", "substance")


def main() -> None:
    fixture = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
    source_version = fixture.get("version")
    if source_version != SOURCE_VERSION:
        raise RuntimeError(
            f"refusing regeneration: expected frozen {SOURCE_VERSION}, got {source_version!r}"
        )

    fixture["version"] = TARGET_VERSION
    fixture["description"] += (
        " v2.3.0: one aspect-bearing, dignity-sensitive ESMS engine in both runtimes; "
        "planet contributions use the non-annihilating inertial mass scale and "
        "Lambda=Mhat*(rbar/r)^2, while aspects are derived from each chart's "
        "longitudes. `expected` and `expected_micro` were regenerated once from "
        "the Python canonical engine."
    )

    for chart in fixture["charts"]:
        result = calculate_natal_alchemical_quantities(
            chart["planetary_positions"],
            is_diurnal=chart.get("is_diurnal", True),
        )
        expected = {coin: result[coin] for coin in COINS}
        chart["expected"] = expected
        chart["expected_micro"] = {
            coin: quantize_esms(expected[coin]) for coin in COINS
        }

    FIXTURE_PATH.write_text(
        json.dumps(fixture, indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
