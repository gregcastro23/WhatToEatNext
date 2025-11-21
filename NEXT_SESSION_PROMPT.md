# Session Prompt: Expand and Enrich Ingredient Data for Comprehensive Culinary Reference

## Context & Previous Work

The WhatToEatNext ingredient recommender has been fixed to properly populate all 10 categories by standardizing category names (singular → plural). However, the ingredient data still needs significant expansion and enrichment to become a comprehensive culinary reference.

**Current State:**
- ✅ All 10 categories now populate (no empty categories)
- ⚠️ Many categories have insufficient entries for a comprehensive reference
- ⚠️ Culinary content (displayed on cards) is sparse or missing
- ⚠️ Most ingredients use default alchemical properties (0.25 across all values)

**Category Status:**
- vegetables: 161 ✅ (adequate)
- seasonings: 134 ✅ (adequate)
- spices: 86 ✅ (adequate)
- grains: 84 ✅ (adequate)
- herbs: 78 ✅ (adequate)
- proteins: 73 ✅ (adequate)
- fruits: 59 ⚠️ (needs expansion)
- dairy: 52 ⚠️ (needs expansion)
- **oils: 39** ⚠️ (critically lacking - should have 50+)
- vinegars: 27 ⚠️ (needs expansion to 40+)

## Mission

Transform the ingredient recommender into a **comprehensive culinary reference** by:

1. **Expanding ingredient count** in under-populated categories
2. **Enriching culinary content** that displays on ingredient cards
3. **Creating unique alchemical profiles** instead of generic defaults
4. **Ensuring professional culinary accuracy** for all entries

## Critical Understanding: Data Architecture

### What Gets Displayed vs What Drives Recommendations

**DISPLAYED on ingredient cards (UI-facing culinary content):**
- `name` - Ingredient name
- `category` & `subcategory` - Classification
- `qualities` - Flavor/culinary descriptors (e.g., "earthy", "aromatic", "umami")
- `origin` - Geographic origins
- `seasonality` - Best seasons for ingredient
- `sensoryProfile` - **CRITICAL FOR DISPLAY**
  - `taste` - sweet, sour, salty, bitter, umami (0-1 scale)
  - `aroma` - floral, fruity, earthy, spicy, etc. (0-1 scale)
  - `texture` - crispy, creamy, crunchy, tender, etc. (0-1 scale)
- `astrologicalProfile` - Ruling planets, favorable zodiac (visible in expanded view)
- `pairingRecommendations` - **CRITICAL FOR DISPLAY**
  - `complementary` - Ingredients that pair well
  - `contrasting` - Ingredients that provide contrast
  - `toAvoid` - Incompatible ingredients
- `recommendedCookingMethods` - Cooking techniques (e.g., "roasting", "grilling")
- `varieties` - Different varieties/types (if applicable)

**USED for recommendation logic (NOT displayed):**
- `elementalProperties` - Fire, Water, Earth, Air (normalized to 1.0)
- `alchemicalProperties` - Spirit, Essence, Matter, Substance
- `thermodynamicProperties` - heat, entropy, reactivity, gregsEnergy, kalchm, monica

### The Problem: Defaults Are Boring

**Current state of many ingredients:**
```typescript
alchemicalProperties: {
  Spirit: 0.25,
  Essence: 0.25,
  Matter: 0.25,
  Substance: 0.25
}
```

**This is generic and doesn't reflect the unique nature of each ingredient!**

Each ingredient should have a **unique alchemical signature** based on its culinary characteristics:
- **High Spirit**: Light, aromatic, volatile (e.g., fresh herbs, citrus zest, volatile spices)
- **High Essence**: Flavorful liquids, oils, extracts (e.g., vanilla extract, truffle oil, fish sauce)
- **High Matter**: Dense, solid, structural (e.g., root vegetables, grains, nuts)
- **High Substance**: Grounding, earthy, foundational (e.g., salt, dried mushrooms, aged cheese)

## Task Breakdown

### Priority 1: Expand Critically Lacking Categories

#### Oils Category (Target: 50+ entries, Currently: 39)

**Add missing culinary oils with full profiles:**

Essential Cooking Oils (add if missing):
- Avocado oil (high smoke point, neutral)
- Grapeseed oil (light, high smoke point)
- Safflower oil (neutral, versatile)
- Sunflower oil (light, all-purpose)
- Canola oil (neutral, versatile)
- Vegetable oil (blend, neutral)
- Corn oil (economical, neutral)
- Peanut oil (high smoke point, nutty)
- Rice bran oil (high smoke point, mild)

Specialty/Finishing Oils (add if missing):
- Truffle oil (luxury, earthy, aromatic)
- Walnut oil (nutty, delicate)
- Hazelnut oil (sweet, nutty)
- Pistachio oil (rich, nutty)
- Pumpkin seed oil (toasty, nutty)
- Argan oil (nutty, Moroccan)
- Black seed oil (pungent, medicinal)
- Hemp seed oil (nutty, earthy)
- Macadamia nut oil (buttery, mild)
- Almond oil (sweet, light)

Regional/Traditional Oils:
- Mustard oil (pungent, Indian)
- Palm oil (rich, African/Southeast Asian)
- Coconut oil (tropical, versatile)
- Ghee (clarified butter, nutty - could be dairy or oils)

**Required fields for each oil:**
```typescript
{
  name: "Truffle Oil",
  category: "oils",
  subcategory: "specialty_finishing",
  qualities: ["luxurious", "earthy", "aromatic", "pungent"],
  origin: ["Italy", "France"],

  // CRITICAL: Rich sensory profile for display
  sensoryProfile: {
    taste: { umami: 0.9, earthy: 0.8 },
    aroma: { earthy: 1.0, mushroom: 0.9, pungent: 0.7 },
    texture: { liquid: 1.0, viscous: 0.4 }
  },

  // Culinary information
  recommendedCookingMethods: ["finishing", "drizzling", "not for cooking"],
  smokePoint: "varies (base oil dependent)",

  // Pairing recommendations (CRITICAL for usefulness)
  pairingRecommendations: {
    complementary: ["pasta", "risotto", "eggs", "potatoes", "mushrooms"],
    contrasting: ["seafood", "delicate fish"],
    toAvoid: ["high heat cooking", "sweet desserts"]
  },

  // UNIQUE alchemical profile (not defaults!)
  elementalProperties: {
    Fire: 0.15,    // Low - not for high heat
    Water: 0.45,   // High - liquid oil
    Earth: 0.25,   // Medium - grounding, earthy
    Air: 0.15      // Low - heavy aroma but not volatile
  },

  alchemicalProperties: {
    Spirit: 0.15,     // Low - not volatile
    Essence: 0.55,    // HIGH - concentrated flavor essence
    Matter: 0.10,     // Low - liquid
    Substance: 0.20   // Medium - grounding, earthy depth
  }
}
```

#### Vinegars Category (Target: 40+ entries, Currently: 27)

**Add missing vinegars:**
- Champagne vinegar (delicate, French)
- Sherry vinegar (rich, Spanish)
- Malt vinegar (bold, British)
- Rice wine vinegar (mild, Asian)
- Black vinegar (rich, Chinese)
- Coconut vinegar (tropical, Filipino)
- Cane vinegar (sharp, Filipino)
- Date vinegar (sweet, Middle Eastern)
- Fig vinegar (fruity, Mediterranean)
- Pomegranate vinegar (tart, Persian)
- Pineapple vinegar (tropical, sweet)
- Tarragon vinegar (herbal, French)
- Raspberry vinegar (fruity, elegant)
- Honey vinegar (sweet, mild)

#### Fruits Category (Target: 80+ entries, Currently: 59)

**Add missing common fruits:**
- Persimmon (sweet, astringent)
- Pomegranate (tart, jewel-like)
- Dragon fruit (mild, tropical)
- Starfruit (tart, crisp)
- Rambutan (sweet, tropical)
- Lychee (floral, sweet)
- Longan (sweet, delicate)
- Kumquat (tart, citrus)
- Buddha's hand (aromatic citrus)
- Yuzu (aromatic, Japanese citrus)
- Blood orange (sweet-tart, berry notes)
- Cara cara orange (sweet, low acid)
- Clementine (sweet, easy-peel)
- Tangelo (tangy, juicy)

#### Dairy Category (Target: 70+ entries, Currently: 52)

**Add missing dairy products:**
- Mascarpone (rich Italian cream cheese)
- Burrata (creamy mozzarella)
- Halloumi (grilling cheese, Cypriot)
- Paneer (fresh Indian cheese)
- Queso fresco (fresh Mexican cheese)
- Queso blanco (mild, crumbly)
- Cotija (aged, salty Mexican)
- Manchego (Spanish sheep's milk)
- Pecorino Romano (sharp, Italian)
- Asiago (nutty, Italian)
- Fontina (buttery, Italian)
- Taleggio (washed-rind, Italian)
- Raclette (melting cheese, Swiss)
- Emmental (sweet, nutty Swiss)
- Jarlsberg (mild, Norwegian)
- Havarti (creamy, Danish)
- Edam (mild, Dutch)
- Gouda (caramel notes, Dutch)
- Crème fraîche (tangy, French)
- Clotted cream (rich, British)
- Labneh (tangy yogurt cheese, Middle Eastern)
- Skyr (Icelandic yogurt)
- Kefir (tangy, probiotic)
- Buttermilk (tangy, baking)

### Priority 2: Enrich Culinary Content for ALL Ingredients

For EVERY ingredient, ensure these fields are comprehensive:

#### Must-Have Culinary Fields:

1. **sensoryProfile** (this is what users SEE and care about!)
   ```typescript
   sensoryProfile: {
     taste: {
       sweet: 0.0-1.0,
       sour: 0.0-1.0,
       salty: 0.0-1.0,
       bitter: 0.0-1.0,
       umami: 0.0-1.0,
       spicy: 0.0-1.0,  // if applicable
       astringent: 0.0-1.0  // if applicable
     },
     aroma: {
       floral: 0.0-1.0,
       fruity: 0.0-1.0,
       earthy: 0.0-1.0,
       spicy: 0.0-1.0,
       herbal: 0.0-1.0,
       // ... other aroma notes
     },
     texture: {
       crispy: 0.0-1.0,
       creamy: 0.0-1.0,
       crunchy: 0.0-1.0,
       tender: 0.0-1.0,
       // ... other texture notes
     }
   }
   ```

2. **pairingRecommendations** (extremely valuable for users!)
   ```typescript
   pairingRecommendations: {
     complementary: ["specific", "ingredients", "that", "pair", "well"],
     contrasting: ["ingredients", "that", "provide", "contrast"],
     toAvoid: ["ingredients", "that", "clash"]
   }
   ```

3. **qualities** - Rich, descriptive array
   ```typescript
   qualities: ["aromatic", "pungent", "warming", "cooling", "drying", "moistening"]
   ```

4. **recommendedCookingMethods**
   ```typescript
   recommendedCookingMethods: ["roasting", "grilling", "sautéing", "braising"]
   ```

5. **origin** - Specific geographic origins
   ```typescript
   origin: ["Italy", "Mediterranean", "Tuscany"]
   ```

6. **seasonality** - When ingredient is best
   ```typescript
   seasonality: ["summer", "fall"]
   ```

### Priority 3: Create Unique Alchemical Profiles

**Stop using default 0.25 values!** Each ingredient should reflect its true nature.

#### Alchemical Profile Guidelines:

**High Spirit (volatile, light, aromatic):**
- Fresh herbs (basil, cilantro, mint)
- Citrus zest
- Volatile spices (cardamom, coriander seed)
- Fresh flowers
- Light vinegars
- Values: Spirit 0.4-0.6

**High Essence (liquid, flavorful, concentrated):**
- Oils (especially infused/specialty)
- Extracts (vanilla, almond)
- Vinegars (especially aged)
- Fish sauce, soy sauce
- Liquid seasonings
- Values: Essence 0.4-0.6

**High Matter (dense, structural, solid):**
- Root vegetables (potatoes, carrots, beets)
- Grains (rice, wheat, oats)
- Dense fruits (apples, pears)
- Nuts and seeds
- Hard cheeses
- Values: Matter 0.4-0.6

**High Substance (grounding, earthy, foundational):**
- Salt, minerals
- Dried mushrooms
- Aged cheeses
- Cured meats
- Root spices (turmeric, ginger)
- Fermented foods
- Values: Substance 0.4-0.6

**Example transformations:**

❌ **BAD (generic default):**
```typescript
{
  name: "truffle oil",
  alchemicalProperties: {
    Spirit: 0.25,
    Essence: 0.25,
    Matter: 0.25,
    Substance: 0.25
  }
}
```

✅ **GOOD (unique, meaningful):**
```typescript
{
  name: "truffle oil",
  alchemicalProperties: {
    Spirit: 0.10,     // Low - heavy, not volatile
    Essence: 0.60,    // HIGH - pure concentrated flavor
    Matter: 0.05,     // Very low - liquid
    Substance: 0.25   // Medium - earthy, grounding depth
  }
}
```

## Implementation Strategy

### Phase 1: Audit Current Data (1-2 hours)
1. Create a script to identify ingredients with default alchemical properties (0.25 values)
2. List ingredients missing sensoryProfile
3. List ingredients missing pairingRecommendations
4. Identify categories below target counts

### Phase 2: Expand Categories (2-3 hours)
1. Add missing oils (11+ new entries)
2. Add missing vinegars (13+ new entries)
3. Add missing fruits (20+ new entries)
4. Add missing dairy (18+ new entries)

### Phase 3: Enrich Culinary Content (3-4 hours)
1. Add sensoryProfile to all ingredients missing it
2. Add pairingRecommendations to all ingredients
3. Enhance qualities arrays to be more descriptive
4. Add recommendedCookingMethods where missing

### Phase 4: Unique Alchemical Profiles (2-3 hours)
1. Review each ingredient's nature (volatile/liquid/dense/grounding)
2. Assign appropriate alchemical values based on guidelines
3. Ensure values sum to 1.0
4. Verify elemental properties are also unique (not all 0.25)

## Data File Structure

Ingredients are organized in:
```
src/data/ingredients/
├── oils/
│   └── oils.ts (EXPAND THIS)
├── vinegars/
│   ├── vinegars.ts
│   └── consolidated_vinegars.ts (EXPAND THESE)
├── fruits/
│   ├── berries.ts
│   ├── citrus.ts
│   ├── tropical.ts
│   └── ... (EXPAND THESE)
├── dairy/
│   └── (find dairy files and EXPAND)
└── ...
```

The unified system at `src/data/unified/ingredients.ts` imports from these files and enhances with alchemical calculations.

## Quality Standards

Every new/updated ingredient must have:
- ✅ Unique, non-default alchemical properties
- ✅ Comprehensive sensoryProfile (taste, aroma, texture)
- ✅ Detailed pairingRecommendations (complementary, contrasting, toAvoid)
- ✅ Rich qualities array (5+ descriptors)
- ✅ Specific origin information
- ✅ Appropriate recommendedCookingMethods
- ✅ Seasonality (if applicable)
- ✅ Varieties or regional variations (if applicable)

## Testing & Verification

After implementation:
1. Run: `grep -r 'Spirit: 0.25, Essence: 0.25, Matter: 0.25, Substance: 0.25' src/data/ingredients`
   - Should return 0 results (no defaults remain)

2. Check category counts meet targets:
   - oils: 50+
   - vinegars: 40+
   - fruits: 80+
   - dairy: 70+

3. Verify sensoryProfile exists for all ingredients in EnhancedIngredientRecommender

4. Test ingredient cards display rich culinary information

## Success Criteria

- [ ] All categories have sufficient entries (meet target counts)
- [ ] Zero ingredients use default alchemical values (0.25, 0.25, 0.25, 0.25)
- [ ] All ingredients have sensoryProfile for display
- [ ] All ingredients have pairingRecommendations
- [ ] Ingredient cards show professional, useful culinary information
- [ ] TypeScript builds without errors
- [ ] Data committed and pushed to branch

## Example: Perfect Ingredient Entry

```typescript
truffle_oil: {
  name: "Truffle Oil",
  category: "oils",
  subcategory: "specialty_finishing",

  // Culinary content (DISPLAYED)
  qualities: ["luxurious", "earthy", "aromatic", "pungent", "expensive", "delicate"],
  origin: ["Italy", "France"],
  seasonality: ["year-round"],

  sensoryProfile: {
    taste: {
      umami: 0.9,
      earthy: 0.8,
      rich: 0.7,
      savory: 0.6
    },
    aroma: {
      earthy: 1.0,
      mushroom: 0.9,
      pungent: 0.7,
      funky: 0.5
    },
    texture: {
      liquid: 1.0,
      viscous: 0.4,
      coating: 0.6
    }
  },

  pairingRecommendations: {
    complementary: [
      "pasta", "risotto", "eggs", "potatoes", "mushrooms",
      "aged cheese", "cream sauces", "white truffle shavings"
    ],
    contrasting: [
      "delicate fish", "light seafood", "citrus"
    ],
    toAvoid: [
      "high heat cooking", "sweet desserts", "overpowering spices",
      "chocolate", "tropical fruits"
    ]
  },

  recommendedCookingMethods: [
    "finishing", "drizzling", "cold preparation",
    "room temperature", "not for cooking"
  ],

  smokePoint: "depends on base oil (typically 325-375°F)",

  astrologicalProfile: {
    rulingPlanets: ["Saturn", "Pluto"],
    favorableZodiac: ["taurus", "capricorn", "scorpio"],
    seasonalAffinity: ["fall", "winter"]
  },

  // Recommendation logic (NOT displayed)
  elementalProperties: {
    Fire: 0.10,    // Low - not for high heat
    Water: 0.50,   // High - liquid oil base
    Earth: 0.30,   // Medium-high - earthy, grounding
    Air: 0.10      // Low - heavy aroma, not volatile
  },

  alchemicalProperties: {
    Spirit: 0.10,     // Low - not volatile, heavy
    Essence: 0.60,    // HIGH - concentrated flavor essence
    Matter: 0.05,     // Very low - pure liquid
    Substance: 0.25   // Medium - grounding, foundational, earthy
  },

  varieties: {
    "White Truffle": {
      description: "Most prized and expensive",
      flavor: "intense, garlicky, earthy",
      origin: "Alba, Italy"
    },
    "Black Truffle": {
      description: "More subtle than white",
      flavor: "earthy, chocolate notes",
      origin: "Périgord, France"
    },
    "Synthetic": {
      description: "Chemical compound 2,4-dithiapentane",
      flavor: "one-dimensional truffle note",
      origin: "Laboratory"
    }
  }
}
```

## Final Notes

**Remember:**
- **Culinary content = what users see and care about**
- **Alchemical properties = recommendation algorithm only**
- **Every ingredient deserves a unique profile**
- **Quality over quantity** (but we need both!)

The goal is a **professional, comprehensive culinary reference** that happens to use alchemical principles for intelligent recommendations behind the scenes.

---

## Quick Start Commands for New Session

```bash
# Check for default alchemical properties
grep -r '"Spirit": 0.25.*"Essence": 0.25.*"Matter": 0.25.*"Substance": 0.25' src/data/ingredients --include="*.ts" | wc -l

# Count ingredients per category
grep -rh 'category:' src/data/ingredients --include="*.ts" | sed 's/.*category: *"\([^"]*\)".*/\1/' | sort | uniq -c | sort -rn

# Find ingredients missing sensoryProfile
grep -rL 'sensoryProfile' src/data/ingredients/**/*.ts

# Find ingredients missing pairingRecommendations
grep -rL 'pairingRecommendations' src/data/ingredients/**/*.ts
```

Good luck creating the ultimate culinary reference! 🍳✨
