//! Relational schema for the Alchm.kitchen culinary data engine.
//!
//! Three-tier hierarchy — Ingredients -> Recipes -> Cuisines — plus two join
//! tables. All tables are `public` so clients can subscribe directly; writes
//! still go exclusively through the reducers in [`crate::reducers`].
//!
//! `elemental_signature` / `elemental_profile` are ESMS vectors
//! `[Spirit, Essence, Matter, Substance]`. `primary_element` is the classical
//! classification `0 = Fire (Wands), 1 = Earth (Pentacles), 2 = Air (Swords),
//! 3 = Water (Cups)`. See [`crate::words`] for the distinction.

use spacetimedb::SpacetimeType;

/// An ESMS elemental signature: `[Spirit, Essence, Matter, Substance]`.
///
/// SpacetimeDB's SATS type system (2.4.1) does not implement `SpacetimeType`
/// for fixed-size arrays such as `[f32; 4]`, so the schema models the signature
/// as a named 4-field product type instead. This is also strictly clearer than
/// a positional array — the ESMS components are named, so there is no slot
/// ambiguity for clients reading the table. Internal aggregation math operates
/// on `[f32; 4]` via [`ElementalSignature::to_array`] /
/// [`ElementalSignature::from_array`].
#[derive(SpacetimeType, Clone, Copy, Debug, PartialEq)]
pub struct ElementalSignature {
    pub spirit: f32,
    pub essence: f32,
    pub matter: f32,
    pub substance: f32,
}

impl ElementalSignature {
    pub const ZERO: Self = Self {
        spirit: 0.0,
        essence: 0.0,
        matter: 0.0,
        substance: 0.0,
    };

    /// `[Spirit, Essence, Matter, Substance]` for the pure aggregation layer.
    pub fn to_array(self) -> [f32; 4] {
        [self.spirit, self.essence, self.matter, self.substance]
    }

    pub fn from_array(values: [f32; 4]) -> Self {
        Self {
            spirit: values[0],
            essence: values[1],
            matter: values[2],
            substance: values[3],
        }
    }
}

/// One ingredient line passed to [`crate::reducers::create_recipe`].
///
/// Modelled as a named struct rather than the tuple `(u64, f32, String)`:
/// SATS (2.4.1) does not implement `SpacetimeType` for tuples, so tuples are
/// not valid reducer-argument element types. Named fields are also clearer for
/// clients constructing the call.
#[derive(SpacetimeType, Clone, Debug, PartialEq)]
pub struct RecipeIngredientInput {
    pub ingredient_id: u64,
    pub amount: f32,
    /// e.g. "grams", "tbsp".
    pub unit: String,
}

/// Base ingredient with its elemental signature and per-serving nutrition.
#[spacetimedb::table(accessor = ingredient, public)]
#[derive(Clone)]
pub struct Ingredient {
    #[primary_key]
    #[auto_inc]
    pub ingredient_id: u64,
    pub name: String,
    /// ESMS affinities `[Spirit, Essence, Matter, Substance]`.
    pub elemental_signature: ElementalSignature,
    /// 0 = Fire, 1 = Earth, 2 = Air, 3 = Water.
    pub primary_element: u8,
    pub calories: u32,
    pub protein_g: f32,
    pub fat_g: f32,
    pub carbs_g: f32,
}

/// A recipe whose signature and nutrition are computed from its ingredients
/// (see [`crate::reducers::create_recipe`]).
#[spacetimedb::table(accessor = recipe, public)]
#[derive(Clone)]
pub struct Recipe {
    #[primary_key]
    #[auto_inc]
    pub recipe_id: u64,
    pub name: String,
    pub instructions: String,
    /// Amount-weighted sum of the ingredients' ESMS signatures.
    pub elemental_signature: ElementalSignature,
    /// Amount-weighted majority vote over the ingredients' `primary_element`.
    pub primary_element: u8,
    pub total_calories: u32,
    pub total_protein: f32,
    pub total_fat: f32,
    pub total_carbs: f32,
}

/// Join table: which ingredient, how much, in which unit, for a recipe.
#[spacetimedb::table(accessor = recipe_ingredient, public)]
#[derive(Clone)]
pub struct RecipeIngredient {
    #[primary_key]
    #[auto_inc]
    pub row_id: u64,
    #[index(btree)]
    pub recipe_id: u64,
    #[index(btree)]
    pub ingredient_id: u64,
    pub amount: f32,
    /// e.g. "grams", "tbsp". Stored as-is; there is no unit-conversion table
    /// yet, so `amount` is treated as a dimensionless weight by the aggregator.
    pub unit: String,
}

/// A cuisine and its aggregated statistical profile over member recipes.
#[spacetimedb::table(accessor = cuisine, public)]
#[derive(Clone)]
pub struct Cuisine {
    #[primary_key]
    #[auto_inc]
    pub cuisine_id: u64,
    pub name: String,
    /// Component-wise mean of member recipes' `elemental_signature`.
    pub elemental_profile: ElementalSignature,
    /// Majority vote over member recipes' `primary_element` (one per recipe).
    pub primary_element: u8,
}

/// Join table: associates a recipe with a cuisine.
#[spacetimedb::table(accessor = cuisine_recipe, public)]
#[derive(Clone)]
pub struct CuisineRecipe {
    #[primary_key]
    #[auto_inc]
    pub row_id: u64,
    #[index(btree)]
    pub cuisine_id: u64,
    #[index(btree)]
    pub recipe_id: u64,
}

// ============================================================================
// Cooking-method physics
// ============================================================================
//
// The catalog half of the physics layer introduced in
// `src/data/cooking/methodPhysics.ts` and `src/data/cooking/cookwareMaterials.ts`.
// Stored rather than computed because these are MEASURED material and method
// properties with cited sources — the arithmetic derived from them lives in
// [`crate::thermo`] and is never persisted alongside its own inputs.
//
// Every row must be reproducible from its `source` field. A number here that
// cannot be traced back to a published measurement does not belong in the
// table; see `scripts/audit-cooking-method-physics.ts` for the check that
// enforces the same rule on the TypeScript side.

/// A cookware material and the four quantities that decide how it cooks.
///
/// `effusivity`, `areal_heat_capacity` and `spreading` are DERIVED from
/// `k`/`rho`/`c`/`thickness` and are stored only so clients can sort and
/// compare without recomputing. They are written by the reducer from the base
/// properties, never accepted from a client — a stored derived value that can
/// be set independently of its inputs is a value that will eventually disagree
/// with them.
#[spacetimedb::table(accessor = cookware_material, public)]
#[derive(Clone)]
pub struct CookwareMaterialTable {
    #[primary_key]
    #[auto_inc]
    pub material_id: u64,
    /// Stable slug, e.g. `cast_iron`, `carbon_steel`, `stainless_304`.
    #[unique]
    pub slug: String,
    pub label: String,
    /// Thermal conductivity, W·m⁻¹·K⁻¹.
    pub k_w_m_k: f32,
    /// Density, kg·m⁻³.
    pub rho_kg_m3: f32,
    /// Specific heat capacity, J·kg⁻¹·K⁻¹.
    pub c_j_kg_k: f32,
    /// Typical pan wall thickness, mm.
    pub typical_thickness_mm: f32,
    /// √(k·ρ·c) — how hard the pan fights to hold its surface temperature.
    pub effusivity: f32,
    /// ρ·c·t — recovery against a cold load, J·m⁻²·K⁻¹.
    pub areal_heat_capacity: f32,
    /// k·t — how well it evens out a hot spot, W·K⁻¹.
    pub spreading: f32,
    /// Whether the surface is chemically inert to acid.
    pub acid_safe: bool,
    /// Citation for `k`, `rho` and `c`. Required.
    pub source: String,
}

/// A cooking method's physical profile — what actually paces it.
///
/// `h_low`/`h_typical`/`h_high` is a BAND, not an error bar: the surface heat
/// transfer coefficient genuinely varies that much with agitation, airflow and
/// contact. It spans four orders of magnitude across the corpus, which is why
/// it is the organising quantity rather than temperature.
///
/// `h_typical` is null-equivalent (`-1.0`) for methods that are not paced by
/// heat transfer at all — fermentation, curing, pickling, marinating and
/// spherification are mass-transfer, microbial or reaction-limited, and
/// attaching a heat transfer coefficient to them would be a fabricated number
/// dressed as a measurement.
#[spacetimedb::table(accessor = method_physics, public)]
#[derive(Clone)]
pub struct MethodPhysicsTable {
    #[primary_key]
    #[auto_inc]
    pub physics_id: u64,
    /// Stable method slug, e.g. `stir_frying`, `sous_vide`, `pressure_cooking`.
    #[unique]
    pub method_slug: String,
    /// What sets the pace: `0` heat-transfer, `1` mass-transfer,
    /// `2` reaction-kinetics, `3` microbial, `4` phase-change.
    pub rate_limiter: u8,
    /// Surface heat transfer coefficient band, W·m⁻²·K⁻¹. `-1.0` = not applicable.
    pub h_low: f32,
    pub h_typical: f32,
    pub h_high: f32,
    /// Temperature of the medium the food is actually in, °C.
    ///
    /// NOT the appliance setting. Braising's oven dial reads 135–175 °C while
    /// the food sits in liquid at 95 °C; that gap is the technique, so the two
    /// are separate columns and `medium_divergence_note` explains any daylight
    /// between them.
    pub medium_c: f32,
    pub medium_divergence_note: String,
    /// Conduction/convection/radiation split, summing to 1.0 (or all zero for
    /// non-thermal methods).
    pub mode_conduction: f32,
    pub mode_convection: f32,
    pub mode_radiation: f32,
    /// Whether the surface can reach browning chemistry at all.
    pub surface_can_brown: bool,
    /// Radiant source temperature, K. `-1.0` where radiation is not a mode.
    pub radiant_source_k: f32,
    /// How the method responds to elevation: `0` penalised, `1` compensated,
    /// `2` accelerated, `3` unaffected.
    ///
    /// A boolean here was wrong and shipped briefly: it collapsed `penalised`
    /// and `compensated` together, which would have handed a slowdown to
    /// pressure cooking — the one appliance bought specifically to defeat
    /// altitude.
    pub altitude_response: u8,
    /// Citation for the `h` band. Required.
    pub source: String,
}
