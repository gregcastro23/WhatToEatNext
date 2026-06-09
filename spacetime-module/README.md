# alchm_culinary — SpacetimeDB culinary data engine

A transactional, real-time relational culinary engine for **Alchm.kitchen**,
implemented as a [SpacetimeDB](https://spacetimedb.com) Rust module (SDK
`2.4.1`). It moves the **Ingredients → Recipes → Cuisines** hierarchy and its
alchemical aggregation logic *into the database*, so recipe signatures and
nutrition are computed transactionally at write time and reads are a plain table
subscription with no N+1 fan-out or denormalized JSONB cache.

## Layout

| File | Role |
| --- | --- |
| `src/tables.rs` | Relational schema (all tables `public`) + the `ElementalSignature` / `RecipeIngredientInput` custom types |
| `src/reducers.rs` | Transactional mutations (`add_ingredient`, `add_cuisine`, `create_recipe`, `associate_recipe_to_cuisine`) |
| `src/words.rs` | **Pure**, host-testable aggregation + validation math (+ unit tests) |
| `src/lib.rs` | Module entry; wires the three modules together |

## Schema

- **`ingredient`** — `ingredient_id` (PK, auto-inc), `name`, `elemental_signature` (ESMS), `primary_element`, `calories`, `protein_g`, `fat_g`, `carbs_g`
- **`recipe`** — `recipe_id` (PK, auto-inc), `name`, `instructions`, computed `elemental_signature`, `primary_element`, `total_calories`, `total_protein`, `total_fat`, `total_carbs`
- **`recipe_ingredient`** (join) — `row_id` (PK, auto-inc), `recipe_id` (btree), `ingredient_id` (btree), `amount`, `unit`
- **`cuisine`** — `cuisine_id` (PK, auto-inc), `name`, aggregated `elemental_profile`, `primary_element`
- **`cuisine_recipe`** (join) — `row_id` (PK, auto-inc), `cuisine_id` (btree), `recipe_id` (btree)

### Two distinct 4-dimensional spaces

- `elemental_signature` / `elemental_profile` are **ESMS** vectors
  `[Spirit, Essence, Matter, Substance]`.
- `primary_element` is the **classical** classification
  `0 = Fire (Wands), 1 = Earth (Pentacles), 2 = Air (Swords), 3 = Water (Cups)`.

These are *not* the same axis. A recipe/cuisine `primary_element` is derived by a
**majority vote** over its constituents' `primary_element` — never by taking the
argmax of an ESMS signature (which would mislabel, e.g., a high-Spirit dish as
"Fire"). Ties break deterministically toward the lowest element index.

## Aggregation semantics

- **Recipe `elemental_signature`** — amount-weighted **sum** of ingredient signatures.
- **Recipe nutrients** — amount-weighted sums; calories accumulate in `f64` and
  saturate into `u32` (no wrap, negatives/NaN floored to 0).
- **Recipe `primary_element`** — amount-weighted vote over ingredient elements.
- **Cuisine `elemental_profile`** — component-wise **mean** of member recipe signatures.
- **Cuisine `primary_element`** — one-vote-per-recipe majority over member recipes.
- The cuisine aggregate is recomputed on every `associate_recipe_to_cuisine`.

All aggregation runs in `f64` and the stored floats are funnelled through a
saturating `finite_f32` step, so an extreme (but finite) ingredient value
saturates to `±f32::MAX` instead of poisoning a recipe/cuisine with `inf`.

## Fail-closed transactions

Every reducer runs in one SpacetimeDB transaction: returning `Err` rolls back
all writes atomically. `create_recipe` resolves **every** referenced ingredient
*before* writing any row, so a missing ingredient yields an error with zero
partial state. `associate_recipe_to_cuisine` rejects missing ids and duplicate
links.

Inputs are validated at the reducer boundary before anything is stored:

- **Names** non-empty and ≤ 256 bytes; recipe **instructions** ≤ 16 KB.
- **`primary_element`** in `0..4`.
- **ESMS signature components** must be **finite** (NaN/Inf rejected). Negative
  values are allowed — an ESMS component is an arbitrary real-valued affinity.
- **Nutrients** (`protein_g`/`fat_g`/`carbs_g`) must be **finite and
  non-negative**; they are physical quantities.
- **`amount`** must be positive and finite.

## Build / test / publish

```bash
# Build the wasm module (authoritative full-module compile)
spacetime build

# Typecheck all three modules
cargo check --target wasm32-unknown-unknown

# Run the pure-logic unit tests on the host
cargo test
```

> **Why `cargo test` only runs `words.rs`:** `tables`/`reducers` are
> `#[cfg(target_arch = "wasm32")]`-gated because the SDK references wasm
> host-import symbols (`datastore_insert_bsatn`, `console_log`, …) that cannot
> *link* on the host. `words.rs` carries no such dependency, so the aggregation
> math is fully host-testable. The full module is validated by `spacetime build`
> and the end-to-end smoke test below.

### End-to-end smoke test (local server)

```bash
# 1. Start a local instance (use a free port if 3000 is taken)
spacetime start --listen-addr 127.0.0.1:3010 &
spacetime server add localtest --url http://127.0.0.1:3010

# 2. Publish
spacetime publish alchm-culinary --server localtest --yes

# 3. Exercise it  (note: pass --server with each call/sql; product-type args are JSON objects)
spacetime call --server localtest alchm-culinary add_ingredient \
  '"Garlic"' '{"spirit":1.0,"essence":2.0,"matter":3.0,"substance":4.0}' 0 100 10.0 1.0 20.0
spacetime call --server localtest alchm-culinary add_ingredient \
  '"Basil"'  '{"spirit":4.0,"essence":3.0,"matter":2.0,"substance":1.0}' 2 50 5.0 2.0 8.0
spacetime call --server localtest alchm-culinary create_recipe \
  '"Garlic Basil Oil"' '"Blend."' \
  '[{"ingredient_id":1,"amount":2.0,"unit":"clove"},{"ingredient_id":2,"amount":1.0,"unit":"tbsp"}]'

spacetime sql --server localtest alchm-culinary "SELECT * FROM recipe"
# => elemental_signature (spirit=6, essence=7, matter=8, substance=9), calories 250, ...

# Rollback proof: a missing ingredient errors and writes nothing
spacetime call --server localtest alchm-culinary create_recipe \
  '"Bad"' '"x"' '[{"ingredient_id":999,"amount":1.0,"unit":"g"}]'   # => error, recipe table unchanged
```

## Deviations from the original spec (forced by SpacetimeDB 2.4.1 SATS)

The schema and behavior follow the spec; these representation changes were
required to compile against `spacetimedb 2.4.1` (and are strictly clearer):

1. **`[f32; 4]` → `ElementalSignature { spirit, essence, matter, substance }`.**
   SATS does not implement `SpacetimeType` for fixed-size arrays. A named
   4-field product type is the supported equivalent and removes positional
   ambiguity. Internal math still operates on `[f32; 4]` via `to_array` /
   `from_array`.
2. **`Vec<(u64, f32, String)>` → `Vec<RecipeIngredientInput>`.** SATS does not
   implement `SpacetimeType` for tuples, so the ingredient line is a named
   struct.
3. **`#[table(name = …)]` → `#[table(accessor = …)]`.** The 2.4.1 macro renamed
   the handle key; table/schema names are unchanged.
4. **Added `add_cuisine`.** The spec lists three reducers, but a cuisine must
   exist before `associate_recipe_to_cuisine` can link to it.
