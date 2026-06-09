//! Reducers for the live per-user state in [`crate::live_tables`].
//!
//! Same transactional contract as [`crate::reducers`]: every reducer is one
//! atomic transaction; `Err` rolls back all writes. Ownership is enforced by
//! deriving the row owner from `ctx.sender()` — client arguments can never
//! write another identity's rows.

use spacetimedb::{ReducerContext, Table};

use crate::live_tables::*;
// Brings the culinary accessor traits (e.g. `ctx.db.recipe()`) into scope so
// meal slots can fail closed on dangling in-module recipe references.
use crate::tables::*;

/// Generous free-text bounds (mirrors `crate::reducers`): real values are far
/// smaller; these only reject abuse.
const NAME_MAX_LEN: usize = 256;
const KEY_MAX_LEN: usize = 320;
const NOTE_MAX_LEN: usize = 1_024;
const EVENT_TYPE_MAX_LEN: usize = 64;
const PAYLOAD_MAX_LEN: usize = 8_192;
const RECIPE_REFS_MAX: usize = 64;

/// Commensal session lifecycle states.
pub const SESSION_OPEN: u8 = 0;
pub const SESSION_LOCKED: u8 = 1;
pub const SESSION_CLOSED: u8 = 2;

fn validate_name(label: &str, value: &str) -> Result<(), String> {
    if value.len() > NAME_MAX_LEN {
        return Err(format!("{label} must be <= {NAME_MAX_LEN} bytes"));
    }
    Ok(())
}

fn validate_slot_coords(day_of_week: u8, meal_type: u8) -> Result<(), String> {
    if day_of_week > 6 {
        return Err("day_of_week must be 0..7 (0 = Sunday)".to_string());
    }
    if meal_type > 3 {
        return Err(
            "meal_type must be 0..4 (0 = breakfast, 1 = lunch, 2 = dinner, 3 = snack)".to_string(),
        );
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// Meal plan
// ---------------------------------------------------------------------------

/// Create or replace the caller's meal slot at
/// `(week_epoch_day, day_of_week, meal_type)`.
///
/// `recipe_id` of 0 means "legacy recipe" — the slot is then identified by
/// `recipe_ref`/`recipe_name` only. A non-zero `recipe_id` must exist in the
/// in-module `recipe` table (fail closed against dangling references).
#[allow(clippy::too_many_arguments)]
#[spacetimedb::reducer]
pub fn upsert_meal_plan_slot(
    ctx: &ReducerContext,
    week_epoch_day: u32,
    day_of_week: u8,
    meal_type: u8,
    recipe_id: u64,
    recipe_ref: String,
    recipe_name: String,
    servings: f32,
) -> Result<(), String> {
    validate_slot_coords(day_of_week, meal_type)?;
    validate_name("recipe_ref", &recipe_ref)?;
    validate_name("recipe_name", &recipe_name)?;
    if recipe_name.trim().is_empty() {
        return Err("recipe_name must not be empty".to_string());
    }
    if !servings.is_finite() || servings <= 0.0 || servings > 1_000.0 {
        return Err("servings must be a positive, finite number <= 1000".to_string());
    }
    if recipe_id != 0 && ctx.db.recipe().recipe_id().find(recipe_id).is_none() {
        return Err(format!("recipe {recipe_id} does not exist"));
    }

    let existing = ctx
        .db
        .meal_plan_slot()
        .owner()
        .filter(ctx.sender())
        .find(|slot| {
            slot.week_epoch_day == week_epoch_day
                && slot.day_of_week == day_of_week
                && slot.meal_type == meal_type
        });

    match existing {
        Some(slot) => {
            ctx.db.meal_plan_slot().slot_id().update(MealPlanSlot {
                recipe_id,
                recipe_ref,
                recipe_name,
                servings,
                updated_at: ctx.timestamp,
                ..slot
            });
        }
        None => {
            ctx.db
                .meal_plan_slot()
                .try_insert(MealPlanSlot {
                    slot_id: 0,
                    owner: ctx.sender(),
                    week_epoch_day,
                    day_of_week,
                    meal_type,
                    recipe_id,
                    recipe_ref,
                    recipe_name,
                    servings,
                    locked: false,
                    updated_at: ctx.timestamp,
                })
                .map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

/// Remove the caller's meal slot at the given coordinates. Idempotent —
/// clearing an empty slot is Ok.
#[spacetimedb::reducer]
pub fn clear_meal_plan_slot(
    ctx: &ReducerContext,
    week_epoch_day: u32,
    day_of_week: u8,
    meal_type: u8,
) -> Result<(), String> {
    validate_slot_coords(day_of_week, meal_type)?;
    let existing: Vec<MealPlanSlot> = ctx
        .db
        .meal_plan_slot()
        .owner()
        .filter(ctx.sender())
        .filter(|slot| {
            slot.week_epoch_day == week_epoch_day
                && slot.day_of_week == day_of_week
                && slot.meal_type == meal_type
        })
        .collect();
    for slot in existing {
        ctx.db.meal_plan_slot().slot_id().delete(slot.slot_id);
    }
    Ok(())
}

/// Lock or unlock the caller's meal slot (locked slots are skipped by the
/// frontend's bulk generate/clear actions).
#[spacetimedb::reducer]
pub fn set_meal_plan_slot_locked(
    ctx: &ReducerContext,
    week_epoch_day: u32,
    day_of_week: u8,
    meal_type: u8,
    locked: bool,
) -> Result<(), String> {
    validate_slot_coords(day_of_week, meal_type)?;
    let slot = ctx
        .db
        .meal_plan_slot()
        .owner()
        .filter(ctx.sender())
        .find(|slot| {
            slot.week_epoch_day == week_epoch_day
                && slot.day_of_week == day_of_week
                && slot.meal_type == meal_type
        })
        .ok_or("no meal is planned in that slot")?;
    ctx.db.meal_plan_slot().slot_id().update(MealPlanSlot {
        locked,
        updated_at: ctx.timestamp,
        ..slot
    });
    Ok(())
}

/// Remove every unlocked slot of the caller's week. Locked slots survive,
/// matching the frontend's "clear week" semantics.
#[spacetimedb::reducer]
pub fn clear_meal_plan_week(ctx: &ReducerContext, week_epoch_day: u32) -> Result<(), String> {
    let slots: Vec<MealPlanSlot> = ctx
        .db
        .meal_plan_slot()
        .owner()
        .filter(ctx.sender())
        .filter(|slot| slot.week_epoch_day == week_epoch_day && !slot.locked)
        .collect();
    for slot in slots {
        ctx.db.meal_plan_slot().slot_id().delete(slot.slot_id);
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// Grocery cart
// ---------------------------------------------------------------------------

/// Create or replace the caller's cart item identified by `item_key`.
///
/// The client computes the merged quantity (its cart context already
/// aggregates by `(name, unit)`), so this reducer *sets* the row rather than
/// adding to it — replays are idempotent.
#[allow(clippy::too_many_arguments)]
#[spacetimedb::reducer]
pub fn cart_upsert_item(
    ctx: &ReducerContext,
    item_key: String,
    name: String,
    quantity: f32,
    unit: String,
    category: String,
    notes: String,
    asin: String,
    recipe_refs: Vec<String>,
) -> Result<(), String> {
    if item_key.trim().is_empty() {
        return Err("item_key must not be empty".to_string());
    }
    if item_key.len() > KEY_MAX_LEN {
        return Err(format!("item_key must be <= {KEY_MAX_LEN} bytes"));
    }
    if name.trim().is_empty() {
        return Err("item name must not be empty".to_string());
    }
    validate_name("item name", &name)?;
    validate_name("unit", &unit)?;
    validate_name("category", &category)?;
    validate_name("asin", &asin)?;
    if notes.len() > NOTE_MAX_LEN {
        return Err(format!("notes must be <= {NOTE_MAX_LEN} bytes"));
    }
    if !quantity.is_finite() || quantity <= 0.0 {
        return Err("quantity must be a positive, finite number".to_string());
    }
    if recipe_refs.len() > RECIPE_REFS_MAX {
        return Err(format!("recipe_refs must have <= {RECIPE_REFS_MAX} entries"));
    }
    for r in &recipe_refs {
        validate_name("recipe_refs entry", r)?;
    }

    let existing = ctx
        .db
        .grocery_cart_item()
        .owner()
        .filter(ctx.sender())
        .find(|item| item.item_key == item_key);

    match existing {
        Some(item) => {
            ctx.db.grocery_cart_item().item_id().update(GroceryCartItem {
                name,
                quantity,
                unit,
                category,
                notes,
                asin,
                recipe_refs,
                updated_at: ctx.timestamp,
                ..item
            });
        }
        None => {
            ctx.db
                .grocery_cart_item()
                .try_insert(GroceryCartItem {
                    item_id: 0,
                    owner: ctx.sender(),
                    item_key,
                    name,
                    quantity,
                    unit,
                    category,
                    notes,
                    asin,
                    recipe_refs,
                    updated_at: ctx.timestamp,
                })
                .map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

/// Set an item's quantity; a quantity of zero (or less) removes the item,
/// mirroring the frontend cart's behaviour.
#[spacetimedb::reducer]
pub fn cart_set_quantity(
    ctx: &ReducerContext,
    item_key: String,
    quantity: f32,
) -> Result<(), String> {
    if !quantity.is_finite() {
        return Err("quantity must be a finite number".to_string());
    }
    let item = ctx
        .db
        .grocery_cart_item()
        .owner()
        .filter(ctx.sender())
        .find(|item| item.item_key == item_key)
        .ok_or("no cart item with that key")?;
    if quantity <= 0.0 {
        ctx.db.grocery_cart_item().item_id().delete(item.item_id);
    } else {
        ctx.db.grocery_cart_item().item_id().update(GroceryCartItem {
            quantity,
            updated_at: ctx.timestamp,
            ..item
        });
    }
    Ok(())
}

/// Record a resolved Amazon ASIN on an item.
#[spacetimedb::reducer]
pub fn cart_set_asin(ctx: &ReducerContext, item_key: String, asin: String) -> Result<(), String> {
    if asin.trim().is_empty() {
        return Err("asin must not be empty".to_string());
    }
    validate_name("asin", &asin)?;
    let item = ctx
        .db
        .grocery_cart_item()
        .owner()
        .filter(ctx.sender())
        .find(|item| item.item_key == item_key)
        .ok_or("no cart item with that key")?;
    ctx.db.grocery_cart_item().item_id().update(GroceryCartItem {
        asin,
        updated_at: ctx.timestamp,
        ..item
    });
    Ok(())
}

/// Remove one item from the caller's cart. Idempotent.
#[spacetimedb::reducer]
pub fn cart_remove_item(ctx: &ReducerContext, item_key: String) -> Result<(), String> {
    let existing: Vec<GroceryCartItem> = ctx
        .db
        .grocery_cart_item()
        .owner()
        .filter(ctx.sender())
        .filter(|item| item.item_key == item_key)
        .collect();
    for item in existing {
        ctx.db.grocery_cart_item().item_id().delete(item.item_id);
    }
    Ok(())
}

/// Empty the caller's cart.
#[spacetimedb::reducer]
pub fn cart_clear(ctx: &ReducerContext) -> Result<(), String> {
    let items: Vec<GroceryCartItem> = ctx
        .db
        .grocery_cart_item()
        .owner()
        .filter(ctx.sender())
        .collect();
    for item in items {
        ctx.db.grocery_cart_item().item_id().delete(item.item_id);
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// Feed
// ---------------------------------------------------------------------------

/// Append one event to the live community feed.
#[spacetimedb::reducer]
pub fn post_feed_event(
    ctx: &ReducerContext,
    actor_name: String,
    actor_is_agent: bool,
    event_type: String,
    payload_json: String,
) -> Result<(), String> {
    validate_name("actor_name", &actor_name)?;
    if event_type.trim().is_empty() {
        return Err("event_type must not be empty".to_string());
    }
    if event_type.len() > EVENT_TYPE_MAX_LEN {
        return Err(format!("event_type must be <= {EVENT_TYPE_MAX_LEN} bytes"));
    }
    if payload_json.len() > PAYLOAD_MAX_LEN {
        return Err(format!("payload_json must be <= {PAYLOAD_MAX_LEN} bytes"));
    }

    ctx.db
        .feed_event()
        .try_insert(FeedEvent {
            event_id: 0,
            actor: ctx.sender(),
            actor_name,
            actor_is_agent,
            event_type,
            payload_json,
            created_at: ctx.timestamp,
        })
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ---------------------------------------------------------------------------
// Commensal sessions
// ---------------------------------------------------------------------------

/// Create a dinner-party session; the caller becomes host and first member.
#[spacetimedb::reducer]
pub fn create_commensal_session(
    ctx: &ReducerContext,
    title: String,
    display_name: String,
) -> Result<(), String> {
    if title.trim().is_empty() {
        return Err("session title must not be empty".to_string());
    }
    validate_name("session title", &title)?;
    validate_name("display_name", &display_name)?;

    let session = ctx
        .db
        .commensal_session()
        .try_insert(CommensalSession {
            session_id: 0,
            host: ctx.sender(),
            title,
            status: SESSION_OPEN,
            created_at: ctx.timestamp,
            updated_at: ctx.timestamp,
        })
        .map_err(|e| e.to_string())?;

    ctx.db
        .commensal_member()
        .try_insert(CommensalMember {
            row_id: 0,
            session_id: session.session_id,
            member: ctx.sender(),
            display_name,
            joined_at: ctx.timestamp,
        })
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Join an open session. Fails closed if the session is missing, not open,
/// or the caller is already a member.
#[spacetimedb::reducer]
pub fn join_commensal_session(
    ctx: &ReducerContext,
    session_id: u64,
    display_name: String,
) -> Result<(), String> {
    validate_name("display_name", &display_name)?;
    let session = ctx
        .db
        .commensal_session()
        .session_id()
        .find(session_id)
        .ok_or_else(|| format!("commensal session {session_id} does not exist"))?;
    if session.status != SESSION_OPEN {
        return Err("session is not open for new members".to_string());
    }
    let already_member = ctx
        .db
        .commensal_member()
        .session_id()
        .filter(session_id)
        .any(|m| m.member == ctx.sender());
    if already_member {
        return Err("already a member of this session".to_string());
    }

    ctx.db
        .commensal_member()
        .try_insert(CommensalMember {
            row_id: 0,
            session_id,
            member: ctx.sender(),
            display_name,
            joined_at: ctx.timestamp,
        })
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Leave a session. If the host leaves, the session closes (status 2) so
/// members aren't left in a headless party. Idempotent for non-members.
#[spacetimedb::reducer]
pub fn leave_commensal_session(ctx: &ReducerContext, session_id: u64) -> Result<(), String> {
    let memberships: Vec<CommensalMember> = ctx
        .db
        .commensal_member()
        .session_id()
        .filter(session_id)
        .filter(|m| m.member == ctx.sender())
        .collect();
    for m in memberships {
        ctx.db.commensal_member().row_id().delete(m.row_id);
    }

    if let Some(session) = ctx
        .db
        .commensal_session()
        .session_id()
        .find(session_id)
        .filter(|s| s.host == ctx.sender() && s.status != SESSION_CLOSED)
    {
        ctx.db.commensal_session().session_id().update(CommensalSession {
            status: SESSION_CLOSED,
            updated_at: ctx.timestamp,
            ..session
        });
    }
    Ok(())
}

/// Host-only: move a session through its lifecycle (open → locked → closed).
#[spacetimedb::reducer]
pub fn set_commensal_session_status(
    ctx: &ReducerContext,
    session_id: u64,
    status: u8,
) -> Result<(), String> {
    if status > SESSION_CLOSED {
        return Err("status must be 0 (open), 1 (locked), or 2 (closed)".to_string());
    }
    let session = ctx
        .db
        .commensal_session()
        .session_id()
        .find(session_id)
        .ok_or_else(|| format!("commensal session {session_id} does not exist"))?;
    if session.host != ctx.sender() {
        return Err("only the session host may change its status".to_string());
    }
    ctx.db.commensal_session().session_id().update(CommensalSession {
        status,
        updated_at: ctx.timestamp,
        ..session
    });
    Ok(())
}
