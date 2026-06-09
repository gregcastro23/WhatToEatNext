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
