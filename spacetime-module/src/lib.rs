//! Alchm.kitchen culinary data engine — a SpacetimeDB module.
//!
//! Moves the Ingredients -> Recipes -> Cuisines hierarchy and its alchemical
//! aggregation logic directly into the database, replacing the Python/Postgres
//! read-model + denormalized JSONB caches. Recipe signatures and nutrition are
//! computed transactionally at write time, so reads are a plain table
//! subscription with no N+1 fan-out.
//!
//! * [`tables`] — the relational schema (all `public`).
//! * [`reducers`] — the transactional mutations.
//! * [`words`] — pure, host-testable aggregation/validation math.
//!
//! ## Build & test targets
//!
//! `tables` and `reducers` are compiled **only for `wasm32`** (the real module
//! target). They call SpacetimeDB host-import functions (`datastore_insert_bsatn`,
//! `console_log`, ...) that only exist inside the database's wasm runtime, so
//! they cannot be *linked* on the host. `words` carries no such dependency and
//! is always compiled, which is what lets `cargo test` run on the host.
//!
//! * `spacetime build`                          — build the wasm module (all 3 modules).
//! * `cargo check --target wasm32-unknown-unknown` — typecheck all 3 modules.
//! * `cargo test`                               — run the pure-logic unit tests on the host.

pub mod words;

#[cfg(target_arch = "wasm32")]
pub mod tables;

#[cfg(target_arch = "wasm32")]
pub mod reducers;
