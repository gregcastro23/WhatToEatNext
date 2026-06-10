//! Live, per-user application state — the real-time layer of v4.0.
//!
//! Where [`crate::tables`] holds the shared culinary catalog, these tables
//! hold *mutable user state* that benefits from SpacetimeDB's push
//! subscriptions: weekly meal plans, grocery carts, the community feed, and
//! commensal (dinner-party) sessions. Clients subscribe to their own rows and
//! receive every change instantly on all devices — no polling.
//!
//! Ownership: every row carries an `Identity` column that reducers always set
//! from `ctx.sender`, never from client arguments, so a client can only write
//! rows it owns. Tables are `public` for reads: SpacetimeDB 2.4.1's
//! `client_visibility_filter` is explicitly unimplemented/unenforced upstream
//! (feature-gated `unstable` with a TODO), so owner-private reads remain a
//! tracked follow-up rather than a decorative filter. Clients filter by
//! identity; nothing sensitive lives in these rows.

use spacetimedb::{Identity, Timestamp};

/// One meal slot in a user's weekly plan.
///
/// A user has at most one row per `(owner, week_epoch_day, day_of_week,
/// meal_type)`; [`crate::live_reducers::upsert_meal_plan_slot`] enforces that
/// transactionally (SpacetimeDB has no multi-column unique constraints).
#[spacetimedb::table(accessor = meal_plan_slot, public)]
#[derive(Clone)]
pub struct MealPlanSlot {
    #[primary_key]
    #[auto_inc]
    pub slot_id: u64,
    /// Owner — always `ctx.sender`.
    #[index(btree)]
    pub owner: Identity,
    /// The week's start date (Sunday, UTC midnight) as days since Unix epoch.
    #[index(btree)]
    pub week_epoch_day: u32,
    /// 0 = Sunday .. 6 = Saturday (matches the frontend `DayOfWeek`).
    pub day_of_week: u8,
    /// 0 = breakfast, 1 = lunch, 2 = dinner, 3 = snack.
    pub meal_type: u8,
    /// In-module recipe id (`recipe.recipe_id`), or 0 while the recipe only
    /// exists in the legacy static catalog.
    pub recipe_id: u64,
    /// Legacy/frontend recipe identifier (static-catalog id or name). Bridges
    /// the planner until the culinary ETL gives every recipe an in-module id.
    pub recipe_ref: String,
    pub recipe_name: String,
    pub servings: f32,
    pub locked: bool,
    pub updated_at: Timestamp,
}

/// One item in a user's grocery cart (mirrors the frontend
/// `GroceryCartContext` item shape).
#[spacetimedb::table(accessor = grocery_cart_item, public)]
#[derive(Clone)]
pub struct GroceryCartItem {
    #[primary_key]
    #[auto_inc]
    pub item_id: u64,
    /// Owner — always `ctx.sender`.
    #[index(btree)]
    pub owner: Identity,
    /// Stable client merge key: `slug(name)__slug(unit)`. One row per
    /// `(owner, item_key)`, enforced by the cart reducers.
    pub item_key: String,
    pub name: String,
    pub quantity: f32,
    pub unit: String,
    /// Grocery aisle/category; empty string = uncategorized.
    pub category: String,
    /// Free-text note; empty string = none.
    pub notes: String,
    /// Amazon ASIN; empty string = unresolved.
    pub asin: String,
    /// Frontend ids/names of the recipes that contributed this item.
    pub recipe_refs: Vec<String>,
    pub updated_at: Timestamp,
}

/// Append-only community feed event (live counterpart of the Postgres
/// `feed_events` table). Clients subscribe to a recent window and receive new
/// events as pushes instead of the current 30-second poll.
#[spacetimedb::table(accessor = feed_event, public)]
#[derive(Clone)]
pub struct FeedEvent {
    #[primary_key]
    #[auto_inc]
    pub event_id: u64,
    /// Posting identity — always `ctx.sender`.
    #[index(btree)]
    pub actor: Identity,
    /// Denormalized display name; empty string = anonymous alchemist.
    pub actor_name: String,
    /// Self-declared agent flag (planetary agents post through their own
    /// connections). Informational only — not an authorization claim.
    pub actor_is_agent: bool,
    #[index(btree)]
    pub event_type: String,
    /// Event metadata as JSON text (kept opaque to the module).
    pub payload_json: String,
    pub created_at: Timestamp,
}

/// A live commensal (dinner-party) session.
#[spacetimedb::table(accessor = commensal_session, public)]
#[derive(Clone)]
pub struct CommensalSession {
    #[primary_key]
    #[auto_inc]
    pub session_id: u64,
    /// Creator/host — always `ctx.sender` of `create_commensal_session`.
    #[index(btree)]
    pub host: Identity,
    pub title: String,
    /// 0 = open (joinable), 1 = locked (menu being finalized), 2 = closed.
    pub status: u8,
    pub created_at: Timestamp,
    pub updated_at: Timestamp,
}

/// Join table: who is present in a commensal session. Subscribing to a
/// session's rows gives live presence for the party.
#[spacetimedb::table(accessor = commensal_member, public)]
#[derive(Clone)]
pub struct CommensalMember {
    #[primary_key]
    #[auto_inc]
    pub row_id: u64,
    #[index(btree)]
    pub session_id: u64,
    #[index(btree)]
    pub member: Identity,
    pub display_name: String,
    pub joined_at: Timestamp,
}
