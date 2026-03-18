#!/usr/bin/env python3
"""
inject-alchemical-properties.py

Computes and injects alchemicalProperties (Spirit, Essence, Matter, Substance)
and thermodynamicProperties (heat, entropy, reactivity, gregsEnergy, kalchm, monica)
into all AlchemicalRecipe objects across all 14 cuisine data files.

ESMS is derived from each recipe's astrologicalAffinities.planets using the
canonical planetary alchemy mapping from CLAUDE.md.

Thermodynamic formulas from CLAUDE.md:
  Heat       = (Spirit² + Fire²) / (Substance + Essence + Matter + Water + Air + Earth)²
  Entropy    = (Spirit² + Substance² + Fire² + Air²) / (Essence + Matter + Earth + Water)²
  Reactivity = (Spirit² + Substance² + Essence² + Fire² + Air² + Water²) / (Matter + Earth)²
  GregsEnergy= Heat - (Entropy × Reactivity)
  Kalchm     = (Spirit^Spirit × Essence^Essence) / (Matter^Matter × Substance^Substance)
  Monica     = -GregsEnergy / (Reactivity × ln(Kalchm))  if Kalchm > 0 and ≠ 1, else 1.0
"""

import re
import math
import sys
import os

# ── Planetary ESMS mapping (from CLAUDE.md) ───────────────────────────────────
PLANETARY_ESMS = {
    "Sun":     {"Spirit": 1, "Essence": 0, "Matter": 0, "Substance": 0},
    "Moon":    {"Spirit": 0, "Essence": 1, "Matter": 1, "Substance": 0},
    "Mercury": {"Spirit": 1, "Essence": 0, "Matter": 0, "Substance": 1},
    "Venus":   {"Spirit": 0, "Essence": 1, "Matter": 1, "Substance": 0},
    "Mars":    {"Spirit": 0, "Essence": 1, "Matter": 1, "Substance": 0},
    "Jupiter": {"Spirit": 1, "Essence": 1, "Matter": 0, "Substance": 0},
    "Saturn":  {"Spirit": 1, "Essence": 0, "Matter": 1, "Substance": 0},
    "Uranus":  {"Spirit": 0, "Essence": 1, "Matter": 1, "Substance": 0},
    "Neptune": {"Spirit": 0, "Essence": 1, "Matter": 0, "Substance": 1},
    "Pluto":   {"Spirit": 0, "Essence": 1, "Matter": 1, "Substance": 0},
}


def compute_esms(planets):
    s, e, m, sub = 0, 0, 0, 0
    for p in planets:
        if p in PLANETARY_ESMS:
            s   += PLANETARY_ESMS[p]["Spirit"]
            e   += PLANETARY_ESMS[p]["Essence"]
            m   += PLANETARY_ESMS[p]["Matter"]
            sub += PLANETARY_ESMS[p]["Substance"]
    return s, e, m, sub


def safe_pow(base, exp):
    """x^x with the convention 0^0 = 1."""
    if base == 0:
        return 1.0
    return base ** exp


def compute_thermodynamics(s, e, m, sub, fire, water, earth, air):
    # Heat
    denom1 = sub + e + m + water + air + earth
    heat = (s**2 + fire**2) / (denom1**2) if denom1 != 0 else 0.0

    # Entropy
    denom2 = e + m + earth + water
    entropy = (s**2 + sub**2 + fire**2 + air**2) / (denom2**2) if denom2 != 0 else 0.0

    # Reactivity
    denom3 = m + earth
    reactivity = (s**2 + sub**2 + e**2 + fire**2 + air**2 + water**2) / (denom3**2) if denom3 != 0 else 0.0

    gregs_energy = heat - (entropy * reactivity)

    # Kalchm = (Spirit^Spirit × Essence^Essence) / (Matter^Matter × Substance^Substance)
    numerator   = safe_pow(s, s) * safe_pow(e, e)
    denominator = safe_pow(m, m) * safe_pow(sub, sub)
    kalchm = numerator / denominator if denominator != 0 else 1.0

    # Monica
    if kalchm > 0 and kalchm != 1.0 and reactivity != 0:
        log_k = math.log(kalchm)
        monica = -gregs_energy / (reactivity * log_k) if log_k != 0 else 1.0
    else:
        monica = 1.0

    def r4(x):
        return round(x, 4)

    return {
        "heat":        r4(heat),
        "entropy":     r4(entropy),
        "reactivity":  r4(reactivity),
        "gregsEnergy": r4(gregs_energy),
        "kalchm":      r4(kalchm),
        "monica":      r4(monica),
    }


# ── Regex helpers ─────────────────────────────────────────────────────────────

# Match planet strings inside an astrologicalAffinities block.
# Handles both multi-line JSON and inline JS object forms.
PLANET_IN_ARRAY_RE = re.compile(r'"([A-Z][a-z]+)"')

# Extract the value of a numeric field like "Fire": 0.35  or  Fire:0.35
def extract_float(text, key):
    m = re.search(
        r'["\']?' + key + r'["\']?\s*:\s*([0-9]*\.?[0-9]+)',
        text
    )
    return float(m.group(1)) if m else 0.0


# Extract a list of planet strings from an astrologicalAffinities block
ASTRO_BLOCK_RE = re.compile(
    r'(?:"astrologicalAffinities"|astrologicalAffinities)\s*:\s*\{(.*?)\}',
    re.DOTALL
)

ELEMENTAL_BLOCK_RE = re.compile(
    r'(?:"elementalProperties"|elementalProperties)\s*:\s*\{(.*?)\}',
    re.DOTALL
)

PLANETS_LIST_RE = re.compile(
    r'(?:"planets"|planets)\s*:\s*\[(.*?)\]',
    re.DOTALL
)

# Detect whether alchemicalProperties is already present (to avoid doubling)
ALREADY_HAS_ALCHM_RE = re.compile(
    r'(?:"alchemicalProperties"|alchemicalProperties)\s*:'
)

ALREADY_HAS_THERMO_RE = re.compile(
    r'(?:"thermodynamicProperties"|thermodynamicProperties)\s*:'
)


def build_alchm_block(indent, s, e, m, sub):
    i = indent
    return (
        f'{i}alchemicalProperties: {{"Spirit":{s},"Essence":{e},"Matter":{m},"Substance":{sub}}},\n'
    )


def build_thermo_block(indent, td):
    i = indent
    return (
        f'{i}thermodynamicProperties: {{'
        f'"heat":{td["heat"]},'
        f'"entropy":{td["entropy"]},'
        f'"reactivity":{td["reactivity"]},'
        f'"gregsEnergy":{td["gregsEnergy"]},'
        f'"kalchm":{td["kalchm"]},'
        f'"monica":{td["monica"]}'
        f'}},\n'
    )


def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # We'll rebuild the file by splitting on "substitutions" occurrences
    # and inserting alchemicalProperties + thermodynamicProperties before each.
    #
    # Strategy: find all indices of the pattern  \n<indent>substitutions
    # and for each, look backward to find the nearest elementalProperties and
    # astrologicalAffinities blocks to extract the needed data.

    SUBS_RE = re.compile(r'(\n)([ \t]*)(?:"substitutions"|substitutions)\s*:')

    result_parts = []
    prev_end = 0
    matches = list(SUBS_RE.finditer(content))
    injected = 0
    skipped = 0

    for match in matches:
        segment = content[prev_end:match.start()]

        # Check if this recipe already has alchemicalProperties
        # (look in the segment from the previous substitutions boundary)
        if ALREADY_HAS_ALCHM_RE.search(segment):
            result_parts.append(segment)
            result_parts.append(match.group(0))
            prev_end = match.end()
            skipped += 1
            continue

        # Extract astrologicalAffinities block from this segment
        astro_match = None
        for m in ASTRO_BLOCK_RE.finditer(segment):
            astro_match = m  # take the last one (closest to substitutions)

        # Extract elementalProperties block from this segment
        elem_match = None
        for m in ELEMENTAL_BLOCK_RE.finditer(segment):
            elem_match = m  # take the last one

        if not astro_match or not elem_match:
            # Can't find the required data - skip this recipe
            result_parts.append(segment)
            result_parts.append(match.group(0))
            prev_end = match.end()
            skipped += 1
            continue

        # Parse planets
        planets_text = astro_match.group(1)
        planets_list_m = PLANETS_LIST_RE.search(planets_text)
        if not planets_list_m:
            result_parts.append(segment)
            result_parts.append(match.group(0))
            prev_end = match.end()
            skipped += 1
            continue

        planet_strings = planets_list_m.group(1)
        planets = re.findall(r'"([A-Za-z]+)"', planet_strings)
        # Filter to known planets only
        planets = [p for p in planets if p in PLANETARY_ESMS]

        # Parse elemental values
        elem_text = elem_match.group(1)
        fire  = extract_float(elem_text, "Fire")
        water = extract_float(elem_text, "Water")
        earth = extract_float(elem_text, "Earth")
        air   = extract_float(elem_text, "Air")

        # Compute ESMS
        s, e, m, sub = compute_esms(planets)

        # Compute thermodynamics
        td = compute_thermodynamics(s, e, m, sub, fire, water, earth, air)

        # Build insertion blocks (use same indent as the substitutions line)
        indent = match.group(2)
        alchm_block  = build_alchm_block(indent, s, e, m, sub)
        thermo_block = build_thermo_block(indent, td)

        result_parts.append(segment)
        result_parts.append(match.group(1))  # the newline before substitutions
        result_parts.append(alchm_block)
        result_parts.append(thermo_block)
        # Now append the substitutions line (without the leading newline, already added)
        result_parts.append(match.group(2) + content[match.start() + len(match.group(1)):match.end()])
        prev_end = match.end()
        injected += 1

    # Append the remainder
    result_parts.append(content[prev_end:])

    new_content = "".join(result_parts)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)

    return injected, skipped


def main():
    cuisine_dir = os.path.join(
        os.path.dirname(__file__), "..", "src", "data", "cuisines"
    )
    cuisine_files = [
        "african.ts", "american.ts", "chinese.ts", "french.ts", "greek.ts",
        "indian.ts", "italian.ts", "japanese.ts", "korean.ts", "mexican.ts",
        "middle-eastern.ts", "russian.ts", "thai.ts", "vietnamese.ts"
    ]

    total_injected = 0
    total_skipped  = 0

    for fname in cuisine_files:
        fpath = os.path.join(cuisine_dir, fname)
        if not os.path.exists(fpath):
            print(f"  MISSING: {fname}")
            continue
        injected, skipped = process_file(fpath)
        print(f"  {fname}: injected={injected}, already_present/skipped={skipped}")
        total_injected += injected
        total_skipped  += skipped

    print(f"\nTotal: injected={total_injected}, skipped={total_skipped}")


if __name__ == "__main__":
    main()
