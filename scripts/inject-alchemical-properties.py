#!/usr/bin/env python3
"""
inject-alchemical-properties.py

Computes and injects alchemicalProperties (Spirit, Essence, Matter, Substance)
and thermodynamicProperties (heat, entropy, reactivity, gregsEnergy, kalchm, monica)
into all AlchemicalRecipe objects across all 14 cuisine data files.

Correct derivation (per project spec):
  alchemicalProperties = SUM of ESMS values of each ingredient in the recipe
                         (looked up from src/data/ingredients/**/*.ts)
  ASharp (A#) = Spirit + Essence + Matter + Substance

  thermodynamicProperties.monica = SUM of Monica constants of the cooking
                                    methods used in the recipe (from pillar definitions)

  Other thermo fields (heat, entropy, reactivity, gregsEnergy, kalchm) are
  computed from ESMS + elementalProperties via CLAUDE.md formulas.

Thermodynamic formulas from CLAUDE.md:
  Heat       = (Spirit² + Fire²) / (Substance + Essence + Matter + Water + Air + Earth)²
  Entropy    = (Spirit² + Substance² + Fire² + Air²) / (Essence + Matter + Earth + Water)²
  Reactivity = (Spirit² + Substance² + Essence² + Fire² + Air² + Water²) / (Matter + Earth)²
  GregsEnergy= Heat - (Entropy × Reactivity)
  Kalchm     = (Spirit^Spirit × Essence^Essence) / (Matter^Matter × Substance^Substance)
  Monica     = SUM of cooking-method Monica constants (NOT the CLAUDE.md formula)
"""

import re
import math
import sys
import os
import glob

# ── Pillar Monica constants (derived from each pillar's elemental thermo) ──────
# Computed as: GregsEnergy = heat - entropy * reactivity
# where heat/entropy/reactivity come from blending primary(70%) + secondary(30%)
# elemental thermodynamic properties for each pillar.
#
# ELEMENTAL_THERMO = {Fire: (h=1.0, e=0.7, r=0.8), Air: (h=0.3, e=0.9, r=0.7),
#                     Water: (h=0.1, e=0.4, r=0.6), Earth: (h=0.2, e=0.1, r=0.2)}

def _pillar_monica(primary, secondary=None):
    thermo = {
        "Fire":  (1.0, 0.7, 0.8),
        "Air":   (0.3, 0.9, 0.7),
        "Water": (0.1, 0.4, 0.6),
        "Earth": (0.2, 0.1, 0.2),
    }
    ph, pe, pr = thermo[primary]
    if secondary:
        sh, se, sr = thermo[secondary]
        h = ph * 0.7 + sh * 0.3
        e = pe * 0.7 + se * 0.3
        r = pr * 0.7 + sr * 0.3
    else:
        h, e, r = ph, pe, pr
    return round(h - e * r, 4)

# Pillar id → Monica constant
PILLAR_MONICA = {
    1:  _pillar_monica("Water", "Earth"),      # Solution
    2:  _pillar_monica("Air",   "Water"),      # Filtration
    3:  _pillar_monica("Air",   "Fire"),       # Evaporation
    4:  _pillar_monica("Water", "Air"),        # Distillation
    5:  _pillar_monica("Fire",  "Water"),      # Separation
    6:  _pillar_monica("Fire"),                # Rectification
    7:  _pillar_monica("Fire",  "Earth"),      # Calcination
    8:  _pillar_monica("Earth", "Air"),        # Comixion
    9:  _pillar_monica("Fire",  "Air"),        # Purification
    10: _pillar_monica("Earth", "Water"),      # Inhibition
    11: _pillar_monica("Water", "Fire"),       # Fermentation
    12: _pillar_monica("Earth", "Air"),        # Fixation  (same elements as Comixion)
    13: _pillar_monica("Fire",  "Water"),      # Multiplication (same as Separation)
    14: _pillar_monica("Fire",  "Earth"),      # Protection (same as Calcination)
}

# ── Cooking method → pillar id mapping ────────────────────────────────────────
COOKING_METHOD_PILLAR = {
    # Wet methods
    "boiling": 1, "poaching": 1, "simmering": 1, "ceviche": 1,
    "steaming": 3, "drying": 3, "foam": 3,
    "marinating": 4,
    "braising": 11, "stewing": 11, "fermenting": 11, "pickling": 11,
    "sous_vide": 12, "curing": 12, "gelification": 12, "sous vide": 12,
    # Dry methods
    "baking": 7, "roasting": 7, "broiling": 7, "grilling": 7,
    "frying": 7, "deep-frying": 7, "deep frying": 7,
    "sauteing": 5, "sautéing": 5, "stir-frying": 5, "stir frying": 5,
    "smoking": 13,
    # Modern / no-heat
    "spherification": 6, "emulsification": 8, "cryo_cooking": 10,
    "raw": 9, "purifying": 9,
    # Additional common methods (map to nearest pillar)
    "kneading": 8,          # Comixion – mixing/blending
    "mixing": 8,
    "blending": 8,
    "whipping": 3,          # Evaporation – incorporating air
    "folding": 8,
    "chilling": 10,         # Inhibition – slowing transformation
    "freezing": 10,
    "pressing": 12,         # Fixation – stabilising
    "straining": 2,         # Filtration
    "infusing": 4,          # Distillation – flavor extraction
    "toasting": 7,
    "charring": 7,
    "caramelizing": 5,      # Separation (Maillard)
    "caramelising": 5,
    "reducing": 3,          # Evaporation
    "blanching": 1,         # Solution
    "boil": 1,
    "grill": 7,
    "bake": 7,
    "roast": 7,
    "fry": 7,
    "saute": 5,
    "sauté": 5,
    "steam": 3,
    "braise": 11,
    "stew": 11,
    "smoke": 13,
    "cure": 12,
    "ferment": 11,
    "pickle": 11,
    "marinate": 4,
    "deep frying": 7,
    "pan-frying": 7,
    "pan frying": 7,
    "wok cooking": 5,
    "wok frying": 5,
    "wok-frying": 5,
    "pressure cooking": 1,
    "slow cooking": 11,
    "slow-cooking": 11,
    "tempering": 12,
    "candying": 5,
    "clarifying": 2,
    "rendering": 7,
    "charbroiling": 7,
}

DEFAULT_PILLAR_ID = 7  # Calcination — fallback for unknown methods


def get_method_monica(method):
    key = method.lower().strip()
    pid = COOKING_METHOD_PILLAR.get(key, DEFAULT_PILLAR_ID)
    return PILLAR_MONICA[pid]


# ── Load ingredient ESMS database from TypeScript files ──────────────────────

def load_ingredient_db(ingredients_dir):
    """Parse all ingredient TS files and build name→ESMS lookup."""
    db = {}  # lowercased_key → {Spirit, Essence, Matter, Substance}

    ts_files = glob.glob(
        os.path.join(ingredients_dir, "**", "*.ts"), recursive=True
    )

    # Pattern: find top-level object entries with alchemicalProperties
    entry_re = re.compile(
        r'(?m)^  (\w[\w]*)\s*:\s*\{',  # key: {
    )
    alchm_re = re.compile(
        r'alchemicalProperties\s*:\s*\{([^}]+)\}'
    )
    name_re = re.compile(r'name\s*:\s*["\']([^"\']+)["\']')

    for fpath in ts_files:
        with open(fpath, "r", encoding="utf-8") as f:
            text = f.read()

        key_positions = list(entry_re.finditer(text))
        alchm_positions = list(alchm_re.finditer(text))

        for ap in alchm_positions:
            esms_text = ap.group(1)
            s = re.search(r'Spirit\s*:\s*([\d.]+)', esms_text)
            e = re.search(r'Essence\s*:\s*([\d.]+)', esms_text)
            m = re.search(r'Matter\s*:\s*([\d.]+)', esms_text)
            sub = re.search(r'Substance\s*:\s*([\d.]+)', esms_text)
            if not (s and e and m and sub):
                continue

            esms = {
                "Spirit":    float(s.group(1)),
                "Essence":   float(e.group(1)),
                "Matter":    float(m.group(1)),
                "Substance": float(sub.group(1)),
            }

            # Find the nearest preceding key
            pos = ap.start()
            closest_key = None
            for kp in key_positions:
                if kp.start() <= pos:
                    closest_key = kp
            if not closest_key:
                continue

            raw_key = closest_key.group(1).lower().replace("_", " ")

            # Also try to get the `name` field from within the same block
            block_start = closest_key.start()
            # Find the corresponding closing brace (heuristic: next top-level key or EOF)
            if closest_key in key_positions:
                idx = key_positions.index(closest_key)
                block_end = key_positions[idx + 1].start() if idx + 1 < len(key_positions) else len(text)
            else:
                block_end = ap.end() + 200

            block_text = text[block_start:block_end]
            name_m = name_re.search(block_text)
            canonical_name = name_m.group(1).lower() if name_m else raw_key

            for lookup_key in {raw_key, canonical_name}:
                if lookup_key not in db:
                    db[lookup_key] = esms

    return db


def normalize(s):
    """Lowercase, strip punctuation, collapse spaces."""
    s = s.lower()
    s = re.sub(r'[(),./\\]', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def build_lookup_index(db):
    """Build a word→[keys] index for fast partial matching."""
    index = {}
    for key in db:
        for word in key.split():
            if len(word) > 2:
                index.setdefault(word, []).append(key)
    return index


def find_esms(ingredient_name, db, index):
    """
    Look up ESMS for an ingredient name from the database.
    Returns a dict {Spirit, Essence, Matter, Substance} or None if not found.
    """
    norm = normalize(ingredient_name)

    # 1. Direct match
    if norm in db:
        return db[norm]

    # 2. DB key is substring of ingredient name
    for key in db:
        if key in norm:
            return db[key]

    # 3. Ingredient name is substring of DB key
    for key in db:
        if norm in key:
            return db[key]

    # 4. Word-overlap scoring
    words = [w for w in norm.split() if len(w) > 2]
    candidates = {}
    for word in words:
        for key in index.get(word, []):
            candidates[key] = candidates.get(key, 0) + 1

    if candidates:
        best_key = max(candidates, key=lambda k: candidates[k])
        if candidates[best_key] >= 1:
            return db[best_key]

    return None


# ── Default ESMS for unknown ingredients ─────────────────────────────────────
DEFAULT_ESMS = {"Spirit": 0.35, "Essence": 0.35, "Matter": 0.35, "Substance": 0.35}


# ── Math helpers ──────────────────────────────────────────────────────────────

def safe_pow(base, exp):
    """x^x with the convention 0^0 = 1."""
    if base == 0:
        return 1.0
    return base ** exp


def compute_thermodynamics(s, e, m, sub, fire, water, earth, air, monica_val):
    # Heat
    denom1 = sub + e + m + water + air + earth
    heat = (s**2 + fire**2) / (denom1**2) if denom1 != 0 else 0.0

    # Entropy
    denom2 = e + m + earth + water
    entropy = (s**2 + sub**2 + fire**2 + air**2) / (denom2**2) if denom2 != 0 else 0.0

    # Reactivity
    denom3 = m + earth
    reactivity = (
        (s**2 + sub**2 + e**2 + fire**2 + air**2 + water**2) / (denom3**2)
        if denom3 != 0 else 0.0
    )

    gregs_energy = heat - (entropy * reactivity)

    # Kalchm
    numerator   = safe_pow(s, s) * safe_pow(e, e)
    denominator = safe_pow(m, m) * safe_pow(sub, sub)
    kalchm = numerator / denominator if denominator != 0 else 1.0

    def r4(x):
        return round(x, 4)

    return {
        "heat":        r4(heat),
        "entropy":     r4(entropy),
        "reactivity":  r4(reactivity),
        "gregsEnergy": r4(gregs_energy),
        "kalchm":      r4(kalchm),
        "monica":      r4(monica_val),
    }


# ── Regex helpers for cuisine files ──────────────────────────────────────────

# Match the whole substitutions line (used as anchor)
SUBS_RE = re.compile(r'(\n)([ \t]*)(?:"substitutions"|substitutions)\s*:')

# Match existing alchemicalProperties block (to remove/overwrite).
# The trailing \n? is optional because the very last line before the SUBS_RE
# match has its \n consumed as match.group(1), so it appears without \n in segment.
ALCHM_LINE_RE = re.compile(
    r'[ \t]*(?:"alchemicalProperties"|alchemicalProperties)\s*:[^\n]*\n?'
)
THERMO_LINE_RE = re.compile(
    r'[ \t]*(?:"thermodynamicProperties"|thermodynamicProperties)\s*:[^\n]*\n?'
)

ELEMENTAL_BLOCK_RE = re.compile(
    r'(?:"elementalProperties"|elementalProperties)\s*:\s*\{(.*?)\}',
    re.DOTALL
)
INGREDIENTS_BLOCK_RE = re.compile(
    r'(?:"ingredients"|ingredients)\s*:\s*\[(.*?)\](?=\s*,)',
    re.DOTALL
)
COOKING_METHODS_RE = re.compile(
    r'(?:"cookingMethods"|cookingMethods)\s*:\s*\[(.*?)\]',
    re.DOTALL
)

def extract_float(text, key):
    m = re.search(r'["\']?' + key + r'["\']?\s*:\s*([0-9]*\.?[0-9]+)', text)
    return float(m.group(1)) if m else 0.0


def extract_string_list(bracket_content):
    return re.findall(r'"([^"]+)"', bracket_content)


def build_alchm_block(indent, s, e, m, sub):
    return (
        f'{indent}alchemicalProperties: {{"Spirit":{s},"Essence":{e},'
        f'"Matter":{m},"Substance":{sub}}},\n'
    )


def build_thermo_block(indent, td):
    return (
        f'{indent}thermodynamicProperties: {{'
        f'"heat":{td["heat"]},'
        f'"entropy":{td["entropy"]},'
        f'"reactivity":{td["reactivity"]},'
        f'"gregsEnergy":{td["gregsEnergy"]},'
        f'"kalchm":{td["kalchm"]},'
        f'"monica":{td["monica"]}'
        f'}},\n'
    )


def process_file(filepath, db, index):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    result_parts = []
    prev_end = 0
    matches = list(SUBS_RE.finditer(content))
    injected = 0
    skipped = 0
    no_data = 0

    for match in matches:
        segment = content[prev_end:match.start()]

        # Extract ingredients from this recipe segment
        ing_match = None
        for m in INGREDIENTS_BLOCK_RE.finditer(segment):
            ing_match = m

        # Extract cooking methods
        cm_match = None
        for m in COOKING_METHODS_RE.finditer(segment):
            cm_match = m

        # Extract elemental properties
        elem_match = None
        for m in ELEMENTAL_BLOCK_RE.finditer(segment):
            elem_match = m

        if not elem_match:
            result_parts.append(segment)
            result_parts.append(match.group(0))
            prev_end = match.end()
            skipped += 1
            continue

        # Parse elemental values
        elem_text = elem_match.group(1)
        fire  = extract_float(elem_text, "Fire")
        water = extract_float(elem_text, "Water")
        earth = extract_float(elem_text, "Earth")
        air   = extract_float(elem_text, "Air")

        # Compute ESMS from ingredient sums
        total_s, total_e, total_m, total_sub = 0.0, 0.0, 0.0, 0.0
        matched_count = 0
        total_count = 0

        if ing_match:
            ing_text = ing_match.group(1)
            # Find all ingredient name fields
            ing_names = re.findall(
                r'"name"\s*:\s*"([^"]+)"', ing_text
            )
            total_count = len(ing_names)
            for iname in ing_names:
                esms = find_esms(iname, db, index)
                if esms:
                    total_s   += esms["Spirit"]
                    total_e   += esms["Essence"]
                    total_m   += esms["Matter"]
                    total_sub += esms["Substance"]
                    matched_count += 1
                else:
                    # Use default ESMS for unmatched ingredients
                    total_s   += DEFAULT_ESMS["Spirit"]
                    total_e   += DEFAULT_ESMS["Essence"]
                    total_m   += DEFAULT_ESMS["Matter"]
                    total_sub += DEFAULT_ESMS["Substance"]

        if total_count == 0:
            # No ingredient data — use fallback values
            total_s, total_e, total_m, total_sub = 1.5, 1.5, 1.5, 1.5

        # Compute Monica from cooking methods sum
        monica_sum = 0.0
        if cm_match:
            methods = extract_string_list(cm_match.group(1))
            for method in methods:
                monica_sum += get_method_monica(method)
            if not methods:
                monica_sum = get_method_monica("baking")  # fallback
        else:
            monica_sum = get_method_monica("baking")  # fallback

        # Round ESMS to 4 decimal places
        total_s   = round(total_s, 4)
        total_e   = round(total_e, 4)
        total_m   = round(total_m, 4)
        total_sub = round(total_sub, 4)
        monica_sum = round(monica_sum, 4)

        # Compute thermodynamic properties
        td = compute_thermodynamics(
            total_s, total_e, total_m, total_sub,
            fire, water, earth, air,
            monica_sum
        )

        # Remove existing alchemicalProperties and thermodynamicProperties lines from segment
        clean_segment = ALCHM_LINE_RE.sub('', segment)
        clean_segment = THERMO_LINE_RE.sub('', clean_segment)

        # Build insertion blocks
        indent = match.group(2)
        alchm_block  = build_alchm_block(indent, total_s, total_e, total_m, total_sub)
        thermo_block = build_thermo_block(indent, td)

        result_parts.append(clean_segment)
        result_parts.append(match.group(1))  # newline before substitutions
        result_parts.append(alchm_block)
        result_parts.append(thermo_block)
        # Re-append the substitutions line (without leading newline already added)
        result_parts.append(
            content[match.start() + len(match.group(1)):match.end()]
        )
        prev_end = match.end()
        injected += 1

    result_parts.append(content[prev_end:])
    new_content = "".join(result_parts)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)

    return injected, skipped


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    src_root = os.path.join(script_dir, "..", "src")

    ingredients_dir = os.path.join(src_root, "data", "ingredients")
    cuisine_dir     = os.path.join(src_root, "data", "cuisines")

    print("Loading ingredient ESMS database...")
    db = load_ingredient_db(ingredients_dir)
    index = build_lookup_index(db)
    print(f"  Loaded {len(db)} ingredient entries.")

    cuisine_files = [
        "african.ts", "american.ts", "chinese.ts", "french.ts", "greek.ts",
        "indian.ts", "italian.ts", "japanese.ts", "korean.ts", "mexican.ts",
        "middle-eastern.ts", "russian.ts", "thai.ts", "vietnamese.ts",
    ]

    total_injected = 0
    total_skipped  = 0

    for fname in cuisine_files:
        fpath = os.path.join(cuisine_dir, fname)
        if not os.path.exists(fpath):
            print(f"  MISSING: {fname}")
            continue
        injected, skipped = process_file(fpath, db, index)
        print(f"  {fname}: processed={injected}, skipped={skipped}")
        total_injected += injected
        total_skipped  += skipped

    print(f"\nTotal: processed={total_injected}, skipped={total_skipped}")


if __name__ == "__main__":
    main()
