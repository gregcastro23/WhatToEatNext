//! Reducers for the live per-user state in [`crate::live_tables`].
//!
//! Same transactional contract as [`crate::reducers`]: every reducer is one
//! atomic transaction; `Err` rolls back all writes. Ownership is enforced by
//! deriving the row owner from `ctx.sender()` — client arguments can never
//! write another identity's rows.

use spacetimedb::{Identity, ReducerContext, Table};

use crate::live_tables::*;
// Brings the culinary accessor traits (e.g. `ctx.db.recipe()`) into scope so
// meal slots can fail closed on dangling in-module recipe references.
use crate::tables::*;
use crate::words::*;

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

// ---------------------------------------------------------------------------
// Table sessions (the Table entity's live-phase presence layer — PR 2)
//
// Keyed by `wten_table_id` (Postgres tables.id UUID as text). Presence-only:
// chat reducers arrive with PR 3's conversations model. All identity here is
// unverified client state — Postgres owns the authoritative member list and
// lifecycle; these reducers only shape the ephemeral presence UX.
// ---------------------------------------------------------------------------

/// Bound for `wten_table_id` — a UUID is 36 chars; anything much longer is abuse.
const WTEN_TABLE_ID_MAX_LEN: usize = 64;
/// Bound for the client-claimed `wten_user_id` display hint.
const WTEN_USER_ID_MAX_LEN: usize = 64;

fn validate_wten_table_id(value: &str) -> Result<(), String> {
    if value.trim().is_empty() {
        return Err("wten_table_id must not be empty".to_string());
    }
    if value.len() > WTEN_TABLE_ID_MAX_LEN {
        return Err(format!(
            "wten_table_id must be <= {WTEN_TABLE_ID_MAX_LEN} bytes"
        ));
    }
    Ok(())
}

fn validate_wten_user_id(value: &str) -> Result<(), String> {
    if value.len() > WTEN_USER_ID_MAX_LEN {
        return Err(format!(
            "wten_user_id must be <= {WTEN_USER_ID_MAX_LEN} bytes"
        ));
    }
    Ok(())
}

/// Idempotently ensure a live session exists for a Postgres table; the first
/// caller becomes the module-side host and first present member. Subsequent
/// calls are no-ops (Ok) — the host client calls this on entering the live
/// room without caring whether a racing guest beat it there.
#[spacetimedb::reducer]
pub fn ensure_table_session(
    ctx: &ReducerContext,
    wten_table_id: String,
    title: String,
    wten_user_id: String,
    display_name: String,
) -> Result<(), String> {
    validate_wten_table_id(&wten_table_id)?;
    validate_name("title", &title)?;
    validate_name("display_name", &display_name)?;
    validate_wten_user_id(&wten_user_id)?;

    if ctx
        .db
        .table_session()
        .wten_table_id()
        .find(&wten_table_id)
        .is_some()
    {
        // Already ensured (possibly by a racing guest) — idempotent success.
        return Ok(());
    }

    ctx.db
        .table_session()
        .try_insert(TableSession {
            session_id: 0,
            wten_table_id: wten_table_id.clone(),
            host: ctx.sender(),
            title,
            status: SESSION_OPEN,
            created_at: ctx.timestamp,
            updated_at: ctx.timestamp,
        })
        .map_err(|e| e.to_string())?;

    ctx.db
        .table_presence()
        .try_insert(TablePresence {
            row_id: 0,
            wten_table_id,
            member: ctx.sender(),
            wten_user_id,
            display_name,
            joined_at: ctx.timestamp,
        })
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Join a live table session's presence. Fails closed if the session is
/// missing or closed; dedupes — a caller already present is an idempotent Ok
/// (their display fields refresh instead of duplicating the row).
#[spacetimedb::reducer]
pub fn join_table_session(
    ctx: &ReducerContext,
    wten_table_id: String,
    wten_user_id: String,
    display_name: String,
) -> Result<(), String> {
    validate_wten_table_id(&wten_table_id)?;
    validate_name("display_name", &display_name)?;
    validate_wten_user_id(&wten_user_id)?;

    let session = ctx
        .db
        .table_session()
        .wten_table_id()
        .find(&wten_table_id)
        .ok_or_else(|| format!("no live session for table {wten_table_id}"))?;
    if session.status == SESSION_CLOSED {
        return Err("this table's live session has closed".to_string());
    }

    // PR 3: a kicked/muted identity cannot rejoin presence (kick = remove
    // presence + insert mute row; unmute readmits).
    let muted = ctx
        .db
        .table_chat_mute()
        .wten_table_id()
        .filter(&wten_table_id)
        .any(|m| m.member == ctx.sender());
    if muted {
        return Err("you have been removed from this table's live chat".to_string());
    }

    let existing = ctx
        .db
        .table_presence()
        .wten_table_id()
        .filter(&wten_table_id)
        .find(|p| p.member == ctx.sender());
    if let Some(presence) = existing {
        ctx.db.table_presence().row_id().update(TablePresence {
            wten_user_id,
            display_name,
            ..presence
        });
        return Ok(());
    }

    ctx.db
        .table_presence()
        .try_insert(TablePresence {
            row_id: 0,
            wten_table_id,
            member: ctx.sender(),
            wten_user_id,
            display_name,
            joined_at: ctx.timestamp,
        })
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Leave a live table session. Unlike the commensal lobby, the HOST leaving
/// does NOT close the session — the party continues until the host's client
/// explicitly calls `close_table_session` (best-effort, mirroring the
/// authoritative Postgres close). Idempotent for non-members.
#[spacetimedb::reducer]
pub fn leave_table_session(ctx: &ReducerContext, wten_table_id: String) -> Result<(), String> {
    validate_wten_table_id(&wten_table_id)?;
    let rows: Vec<TablePresence> = ctx
        .db
        .table_presence()
        .wten_table_id()
        .filter(&wten_table_id)
        .filter(|p| p.member == ctx.sender())
        .collect();
    for row in rows {
        ctx.db.table_presence().row_id().delete(row.row_id);
    }
    Ok(())
}

/// Host-only: close a table's live session and clear its presence rows.
/// Called best-effort by the host's client alongside the authoritative
/// Postgres close — a missed call just leaves a stale open session, which
/// affects nothing durable.
#[spacetimedb::reducer]
pub fn close_table_session(ctx: &ReducerContext, wten_table_id: String) -> Result<(), String> {
    validate_wten_table_id(&wten_table_id)?;
    let session = ctx
        .db
        .table_session()
        .wten_table_id()
        .find(&wten_table_id)
        .ok_or_else(|| format!("no live session for table {wten_table_id}"))?;
    if session.host != ctx.sender() {
        return Err("only the session host may close it".to_string());
    }

    let rows: Vec<TablePresence> = ctx
        .db
        .table_presence()
        .wten_table_id()
        .filter(&wten_table_id)
        .collect();
    for row in rows {
        ctx.db.table_presence().row_id().delete(row.row_id);
    }

    // PR 3: prune the Spacetime chat MIRROR wholesale on close — the canonical
    // messages survive in Postgres (docs/plans/tables-program-sequencing.md
    // Reconciliation 1). Mute rows go too; the conversation is over.
    let chat_rows: Vec<TableChatMessage> = ctx
        .db
        .table_chat_message()
        .wten_table_id()
        .filter(&wten_table_id)
        .collect();
    for row in chat_rows {
        ctx.db.table_chat_message().chat_id().delete(row.chat_id);
    }
    let mute_rows: Vec<TableChatMute> = ctx
        .db
        .table_chat_mute()
        .wten_table_id()
        .filter(&wten_table_id)
        .collect();
    for row in mute_rows {
        ctx.db.table_chat_mute().row_id().delete(row.row_id);
    }

    ctx.db.table_session().session_id().update(TableSession {
        status: SESSION_CLOSED,
        updated_at: ctx.timestamp,
        ..session
    });
    Ok(())
}

// ---------------------------------------------------------------------------
// Table chat (the Table entity's live-discussion MIRROR — PR 3)
//
// Postgres `messages` is canonical; these reducers only shape the ephemeral
// live mirror. The client publishes ONLY after its POST /api/chat/.../messages
// returns 200, carrying the canonical `message_uuid`. Module-side enforcement
// bounds rogue rows: the sender must be present (a `table_presence` row) and
// not muted; `sender_name` is read from the presence row, never args.
//
// SAFETY: ONLY table-chat bodies mirror here. DM and circle bodies must never
// enter SpacetimeDB (world-readable tables) — that boundary lives in the
// server send path, which never calls a Spacetime publish.
//
// HOST AUTHORITY CAVEAT (tracked: docs/plans/pr3-known-limitations.md #1):
// the chat MODERATION reducers below (delete host-branch, set_table_chat_mute,
// kick_table_chat_member) gate on `TableSession.host`, which is the UNVERIFIED
// first-ensurer identity — a racing guest could win `ensure_table_session` and
// gain live-mirror moderation. This is bounded, NOT authoritative: the mirror
// is flag-gated and ephemeral, and DURABLE moderation authority is Postgres
// `tables.host_id` (enforced by /api/chat/.../moderate). Matches PR 2's stance
// of not re-architecting the module identity model; server-authenticated
// identity binding is the fast-follow. Do not treat this host check as a
// security boundary.
// ---------------------------------------------------------------------------

/// Max chat body bytes (mirrors the Postgres 2000-char cap; bytes >= chars).
const CHAT_BODY_MAX_LEN: usize = 2_000;
/// Max canonical uuid length (a UUID is 36 chars).
const CHAT_UUID_MAX_LEN: usize = 64;
/// Newest-N chat rows retained per table in the live mirror.
const CHAT_RETAIN_PER_TABLE: usize = 200;

fn validate_chat_uuid(label: &str, value: &str) -> Result<(), String> {
    if value.trim().is_empty() {
        return Err(format!("{label} must not be empty"));
    }
    if value.len() > CHAT_UUID_MAX_LEN {
        return Err(format!("{label} must be <= {CHAT_UUID_MAX_LEN} bytes"));
    }
    Ok(())
}

/// Publish one table-chat message into the live mirror. Enforces: session
/// exists & not CLOSED; caller is PRESENT (a `table_presence` row for this
/// table); caller is not muted; body 1..=2000 bytes; uuid bounds. Prunes the
/// table's mirror to the newest `CHAT_RETAIN_PER_TABLE` rows.
#[spacetimedb::reducer]
pub fn send_table_chat_message(
    ctx: &ReducerContext,
    wten_table_id: String,
    message_uuid: String,
    body: String,
    reply_to_uuid: String,
) -> Result<(), String> {
    validate_wten_table_id(&wten_table_id)?;
    validate_chat_uuid("message_uuid", &message_uuid)?;
    if !reply_to_uuid.is_empty() && reply_to_uuid.len() > CHAT_UUID_MAX_LEN {
        return Err(format!("reply_to_uuid must be <= {CHAT_UUID_MAX_LEN} bytes"));
    }
    if body.trim().is_empty() {
        return Err("message body must not be empty".to_string());
    }
    if body.len() > CHAT_BODY_MAX_LEN {
        return Err(format!("message body must be <= {CHAT_BODY_MAX_LEN} bytes"));
    }

    let session = ctx
        .db
        .table_session()
        .wten_table_id()
        .find(&wten_table_id)
        .ok_or_else(|| format!("no live session for table {wten_table_id}"))?;
    if session.status == SESSION_CLOSED {
        return Err("this table's live session has closed".to_string());
    }

    // Membership check references TablePresence (PR 2's table), NOT
    // commensal_member (docs/plans/tables-program-sequencing.md
    // Reconciliation 1). sender_name comes from that row, never args.
    let presence = ctx
        .db
        .table_presence()
        .wten_table_id()
        .filter(&wten_table_id)
        .find(|p| p.member == ctx.sender())
        .ok_or("only members present at the table may post")?;

    let muted = ctx
        .db
        .table_chat_mute()
        .wten_table_id()
        .filter(&wten_table_id)
        .any(|m| m.member == ctx.sender());
    if muted {
        return Err("you are muted in this table's live chat".to_string());
    }

    ctx.db
        .table_chat_message()
        .try_insert(TableChatMessage {
            chat_id: 0,
            wten_table_id: wten_table_id.clone(),
            message_uuid,
            sender: ctx.sender(),
            sender_name: presence.display_name,
            body,
            reply_to_uuid,
            created_at: ctx.timestamp,
            deleted: false,
        })
        .map_err(|e| e.to_string())?;

    // Retention: keep the newest CHAT_RETAIN_PER_TABLE rows for this table.
    let mut rows: Vec<TableChatMessage> = ctx
        .db
        .table_chat_message()
        .wten_table_id()
        .filter(&wten_table_id)
        .collect();
    if rows.len() > CHAT_RETAIN_PER_TABLE {
        rows.sort_by_key(|r| r.chat_id);
        let excess = rows.len() - CHAT_RETAIN_PER_TABLE;
        for row in rows.into_iter().take(excess) {
            ctx.db.table_chat_message().chat_id().delete(row.chat_id);
        }
    }
    Ok(())
}

/// Tombstone a chat mirror row: the sender or the session host may delete.
/// Body is blanked and `deleted` set — the row stays so subscribers see the
/// removal (the canonical soft-delete already happened in Postgres).
///
/// NOTE: the host check uses `TableSession.host` — the unverified module-side
/// first-ensurer identity, NOT the authoritative Postgres `tables.host_id`
/// (see the section header + docs/plans/pr3-known-limitations.md #1). Bounded:
/// durable deletion is the Postgres soft-delete; this only tombstones the
/// ephemeral mirror row.
#[spacetimedb::reducer]
pub fn delete_table_chat_message(ctx: &ReducerContext, chat_id: u64) -> Result<(), String> {
    let message = ctx
        .db
        .table_chat_message()
        .chat_id()
        .find(chat_id)
        .ok_or_else(|| format!("no chat message {chat_id}"))?;

    let is_sender = message.sender == ctx.sender();
    let is_host = ctx
        .db
        .table_session()
        .wten_table_id()
        .find(&message.wten_table_id)
        .map(|s| s.host == ctx.sender())
        .unwrap_or(false);
    if !is_sender && !is_host {
        return Err("only the sender or the table host may delete this message".to_string());
    }

    ctx.db.table_chat_message().chat_id().update(TableChatMessage {
        body: String::new(),
        deleted: true,
        ..message
    });
    Ok(())
}

/// Host-only: mute or unmute an identity in this table's live chat. Muting is
/// idempotent (dedupes the row); unmuting removes every mute row for the
/// member. Presence is untouched — muting silences without ejecting.
///
/// NOTE: "host-only" here means `TableSession.host`, the unverified module-side
/// first-ensurer identity — NOT the authoritative Postgres `tables.host_id`
/// (see the section header + docs/plans/pr3-known-limitations.md #1). Bounded:
/// durable host moderation is `/api/chat/.../moderate`, gated on tables.host_id.
#[spacetimedb::reducer]
pub fn set_table_chat_mute(
    ctx: &ReducerContext,
    wten_table_id: String,
    member: Identity,
    muted: bool,
) -> Result<(), String> {
    validate_wten_table_id(&wten_table_id)?;
    let session = ctx
        .db
        .table_session()
        .wten_table_id()
        .find(&wten_table_id)
        .ok_or_else(|| format!("no live session for table {wten_table_id}"))?;
    if session.host != ctx.sender() {
        return Err("only the table host may mute members".to_string());
    }

    let existing: Vec<TableChatMute> = ctx
        .db
        .table_chat_mute()
        .wten_table_id()
        .filter(&wten_table_id)
        .filter(|m| m.member == member)
        .collect();

    if muted {
        if existing.is_empty() {
            ctx.db
                .table_chat_mute()
                .try_insert(TableChatMute {
                    row_id: 0,
                    wten_table_id,
                    member,
                    muted_by: ctx.sender(),
                    created_at: ctx.timestamp,
                })
                .map_err(|e| e.to_string())?;
        }
    } else {
        for row in existing {
            ctx.db.table_chat_mute().row_id().delete(row.row_id);
        }
    }
    Ok(())
}

/// Host-only: kick an identity from the table's live chat — remove their
/// presence AND insert a mute row so they cannot rejoin
/// (`join_table_session` rejects muted identities). Unmuting readmits them.
///
/// NOTE: "host-only" gates on `TableSession.host`, the unverified module-side
/// first-ensurer identity — NOT the authoritative Postgres `tables.host_id`
/// (see the section header + docs/plans/pr3-known-limitations.md #1). Bounded:
/// this only ejects from the ephemeral live mirror; durable kick/ban lives in
/// Postgres (conversation_members) via the server moderate route.
#[spacetimedb::reducer]
pub fn kick_table_chat_member(
    ctx: &ReducerContext,
    wten_table_id: String,
    member: Identity,
) -> Result<(), String> {
    validate_wten_table_id(&wten_table_id)?;
    let session = ctx
        .db
        .table_session()
        .wten_table_id()
        .find(&wten_table_id)
        .ok_or_else(|| format!("no live session for table {wten_table_id}"))?;
    if session.host != ctx.sender() {
        return Err("only the table host may kick members".to_string());
    }

    let presence_rows: Vec<TablePresence> = ctx
        .db
        .table_presence()
        .wten_table_id()
        .filter(&wten_table_id)
        .filter(|p| p.member == member)
        .collect();
    for row in presence_rows {
        ctx.db.table_presence().row_id().delete(row.row_id);
    }

    let already_muted = ctx
        .db
        .table_chat_mute()
        .wten_table_id()
        .filter(&wten_table_id)
        .any(|m| m.member == member);
    if !already_muted {
        ctx.db
            .table_chat_mute()
            .try_insert(TableChatMute {
                row_id: 0,
                wten_table_id,
                member,
                muted_by: ctx.sender(),
                created_at: ctx.timestamp,
            })
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// Environmental telemetry (the live-physics layer — PR 4)
// ---------------------------------------------------------------------------
//
// One row per identity, upserted by `ctx.sender`. These rows drive the cooking
// method cards' localized medium temperature and evaporative-ceiling text.
//
// The validation below rejects; it does NOT clamp. Every bound here is a
// "no sensor on Earth reports this" bound, chosen so that a plausible-but-
// extreme real reading is preserved rather than quietly rewritten. The one
// clamp this subsystem needs — the Antoine validity ceiling — is applied on
// the READ side, where the UI can tell the user it happened.

/// Below the Dead Sea shore (-430 m), no kitchen exists.
const ELEVATION_MIN_M: f32 = -500.0;
/// Above La Rinconada (5100 m) nobody lives; 9000 m covers aircraft galleys.
const ELEVATION_MAX_M: f32 = 9_000.0;
/// A room a cook can stand in. Wider than comfortable, narrower than absurd.
const AMBIENT_TEMP_MIN_C: f32 = -60.0;
const AMBIENT_TEMP_MAX_C: f32 = 70.0;
/// Absolute station pressure bounds. 25 kPa is above the summit of Everest
/// (~33.7 kPa); 110 kPa is above the highest station pressure ever recorded at
/// low elevation (~107.8 kPa, Siberia). A reading outside this is a broken
/// sensor or a unit error (hPa passed as kPa), not weather.
const STATION_PRESSURE_MIN_KPA: f32 = 25.0;
const STATION_PRESSURE_MAX_KPA: f32 = 110.0;

fn validate_finite(label: &str, value: f32) -> Result<(), String> {
    if !value.is_finite() {
        return Err(format!("{label} must be finite, received {value}"));
    }
    Ok(())
}

fn validate_range(label: &str, value: f32, min: f32, max: f32) -> Result<(), String> {
    validate_finite(label, value)?;
    if value < min || value > max {
        return Err(format!("{label} must be within {min}..={max}, received {value}"));
    }
    Ok(())
}

/// Create or replace the caller's live environmental observation.
///
/// Ownership is derived from `ctx.sender` (ADR-008) — there is no owner
/// argument, so an identity can only ever write its own telemetry. The
/// `#[unique]` constraint on `owner` makes the find-then-write below race-safe:
/// two concurrent calls from one identity serialise, and the loser updates
/// rather than inserting a duplicate.
///
/// `station_pressure_kpa` is optional: most clients have no barometer, and a
/// missing reading is meaningfully different from a guessed one. Readers fall
/// back to the ISA pressure implied by `elevation_m` when it is `None`, which
/// is exactly the behaviour the app had before this table existed.
#[spacetimedb::reducer]
pub fn upsert_environmental_observation(
    ctx: &ReducerContext,
    elevation_m: f32,
    elevation_provenance: ElevationProvenance,
    ambient_temp_c: f32,
    relative_humidity_pct: f32,
    station_pressure_kpa: Option<f32>,
) -> Result<(), String> {
    validate_range("elevation_m", elevation_m, ELEVATION_MIN_M, ELEVATION_MAX_M)?;
    // NaN is ACCEPTED for these two, and only these two: it is the absence
    // sentinel forced by the blocked `Option` migration (see the field docs on
    // `EnvironmentalObservation::ambient_temp_c`). Any other non-finite value —
    // and NaN in any other field — is still a rejection.
    if ambient_temp_c.is_finite() {
        validate_range(
            "ambient_temp_c",
            ambient_temp_c,
            AMBIENT_TEMP_MIN_C,
            AMBIENT_TEMP_MAX_C,
        )?;
    } else if !ambient_temp_c.is_nan() {
        return Err("ambient_temp_c must be finite or NaN (unmeasured)".to_string());
    }
    if relative_humidity_pct.is_finite() {
        validate_range("relative_humidity_pct", relative_humidity_pct, 0.0, 100.0)?;
    } else if !relative_humidity_pct.is_nan() {
        return Err("relative_humidity_pct must be finite or NaN (unmeasured)".to_string());
    }
    if let Some(kpa) = station_pressure_kpa {
        validate_range(
            "station_pressure_kpa",
            kpa,
            STATION_PRESSURE_MIN_KPA,
            STATION_PRESSURE_MAX_KPA,
        )?;
    }

    match ctx.db.environmental_observation().owner().find(ctx.sender()) {
        Some(existing) => {
            ctx.db
                .environmental_observation()
                .obs_id()
                .update(EnvironmentalObservation {
                    elevation_m,
                    elevation_provenance,
                    ambient_temp_c,
                    relative_humidity_pct,
                    station_pressure_kpa,
                    updated_at: ctx.timestamp,
                    ..existing
                });
        }
        None => {
            ctx.db
                .environmental_observation()
                .try_insert(EnvironmentalObservation {
                    obs_id: 0,
                    owner: ctx.sender(),
                    elevation_m,
                    elevation_provenance,
                    ambient_temp_c,
                    relative_humidity_pct,
                    station_pressure_kpa,
                    updated_at: ctx.timestamp,
                })
                .map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

/// Drop the caller's observation — the session ended, or the user revoked
/// location. The cards fall back to their sea-level nominal values, which is
/// the honest state for "we no longer know where you are".
#[spacetimedb::reducer]
pub fn clear_environmental_observation(ctx: &ReducerContext) -> Result<(), String> {
    if let Some(existing) = ctx.db.environmental_observation().owner().find(ctx.sender()) {
        ctx.db
            .environmental_observation()
            .obs_id()
            .delete(existing.obs_id);
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// Table meal voting & cursor presence (Collaborative planning)
// ---------------------------------------------------------------------------

const COLOR_HEX_MAX_LEN: usize = 16;
const SLOT_REF_MAX_LEN: usize = 64;

/// Cast or update a vote on a recipe being considered for a table session.
#[spacetimedb::reducer]
pub fn vote_table_meal(
    ctx: &ReducerContext,
    wten_table_id: String,
    recipe_ref: String,
    recipe_name: String,
    vote_score: i8,
) -> Result<(), String> {
    validate_wten_table_id(&wten_table_id)?;
    validate_name("recipe_ref", &recipe_ref)?;
    validate_name("recipe_name", &recipe_name)?;

    if !(-1..=1).contains(&vote_score) {
        return Err("vote_score must be -1, 0, or 1".to_string());
    }

    // Require presence to vote
    let presence = ctx
        .db
        .table_presence()
        .wten_table_id()
        .filter(&wten_table_id)
        .find(|p| p.member == ctx.sender())
        .ok_or("must be present at the table to vote")?;

    let existing = ctx
        .db
        .table_meal_vote()
        .wten_table_id()
        .filter(&wten_table_id)
        .find(|v| v.voter == ctx.sender() && v.recipe_ref == recipe_ref);

    match existing {
        Some(vote) => {
            if vote_score == 0 {
                ctx.db.table_meal_vote().vote_id().delete(vote.vote_id);
            } else {
                ctx.db.table_meal_vote().vote_id().update(TableMealVote {
                    recipe_name,
                    vote_score,
                    updated_at: ctx.timestamp,
                    ..vote
                });
            }
        }
        None => {
            if vote_score != 0 {
                ctx.db
                    .table_meal_vote()
                    .try_insert(TableMealVote {
                        vote_id: 0,
                        wten_table_id,
                        voter: ctx.sender(),
                        voter_name: presence.display_name,
                        recipe_ref,
                        recipe_name,
                        vote_score,
                        updated_at: ctx.timestamp,
                    })
                    .map_err(|e| e.to_string())?;
            }
        }
    }
    Ok(())
}

/// Update caller's live cursor / slot focus for collaborative planning.
#[spacetimedb::reducer]
pub fn update_table_cursor(
    ctx: &ReducerContext,
    wten_table_id: String,
    current_slot_ref: String,
    color_hex: String,
) -> Result<(), String> {
    validate_wten_table_id(&wten_table_id)?;
    if current_slot_ref.len() > SLOT_REF_MAX_LEN {
        return Err(format!("current_slot_ref must be <= {SLOT_REF_MAX_LEN} bytes"));
    }
    if color_hex.len() > COLOR_HEX_MAX_LEN {
        return Err(format!("color_hex must be <= {COLOR_HEX_MAX_LEN} bytes"));
    }

    let presence = ctx
        .db
        .table_presence()
        .wten_table_id()
        .filter(&wten_table_id)
        .find(|p| p.member == ctx.sender())
        .ok_or("must be present at the table to update cursor")?;

    let existing = ctx
        .db
        .table_cursor_presence()
        .wten_table_id()
        .filter(&wten_table_id)
        .find(|c| c.member == ctx.sender());

    match existing {
        Some(cursor) => {
            ctx.db.table_cursor_presence().cursor_id().update(TableCursorPresence {
                display_name: presence.display_name,
                current_slot_ref,
                color_hex,
                updated_at: ctx.timestamp,
                ..cursor
            });
        }
        None => {
            ctx.db
                .table_cursor_presence()
                .try_insert(TableCursorPresence {
                    cursor_id: 0,
                    wten_table_id,
                    member: ctx.sender(),
                    display_name: presence.display_name,
                    current_slot_ref,
                    color_hex,
                    updated_at: ctx.timestamp,
                })
                .map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

/// Clear caller's cursor when leaving slot or idle.
#[spacetimedb::reducer]
pub fn clear_table_cursor(ctx: &ReducerContext, wten_table_id: String) -> Result<(), String> {
    validate_wten_table_id(&wten_table_id)?;
    let cursors: Vec<TableCursorPresence> = ctx
        .db
        .table_cursor_presence()
        .wten_table_id()
        .filter(&wten_table_id)
        .filter(|c| c.member == ctx.sender())
        .collect();
    for cursor in cursors {
        ctx.db.table_cursor_presence().cursor_id().delete(cursor.cursor_id);
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// Live Pot Collaborative Simmer Reduction
// ---------------------------------------------------------------------------

/// Create a new collaborative LivePot tracker.
///
/// Sets owner to `ctx.sender()`, initializes `current_vol_l` to `initial_vol_l`,
/// `concentration_ratio` to 1.0, and sets `start_time` and `last_tick` to `ctx.timestamp`.
#[allow(clippy::too_many_arguments)]
#[spacetimedb::reducer]
pub fn create_live_pot(
    ctx: &ReducerContext,
    session_id: String,
    recipe_ref: String,
    vessel_name: String,
    initial_vol_l: f64,
    burner_power_w: f64,
    lid_seal: u8,
    target_reduction_pct: f64,
) -> Result<(), String> {
    validate_live_pot_params(
        &session_id,
        &recipe_ref,
        &vessel_name,
        initial_vol_l,
        burner_power_w,
        lid_seal,
        target_reduction_pct,
    )?;

    ctx.db.live_pot().insert(LivePot {
        pot_id: 0,
        owner: ctx.sender(),
        session_id,
        recipe_ref,
        vessel_name,
        initial_vol_l,
        current_vol_l: initial_vol_l,
        concentration_ratio: 1.0,
        burner_power_w,
        lid_seal,
        target_reduction_pct,
        is_boiling: true,
        alarm_triggered: false,
        start_time: ctx.timestamp,
        last_tick: ctx.timestamp,
    });

    Ok(())
}

/// Update burner power and lid seal state on an active pot.
///
/// Only the owner of the pot may mutate controls.
#[spacetimedb::reducer]
pub fn set_pot_controls(
    ctx: &ReducerContext,
    pot_id: u64,
    burner_power_w: f64,
    lid_seal: u8,
) -> Result<(), String> {
    if !burner_power_w.is_finite() || burner_power_w <= 0.0 || burner_power_w > 50_000.0 {
        return Err("burner_power_w must be a positive finite number <= 50000 W".to_string());
    }
    if lid_seal as usize >= VAPOUR_ESCAPE_FRACTIONS.len() {
        return Err("lid_seal must be 0..=3 (0=none, 1=cracked, 2=loose, 3=tight)".to_string());
    }

    let Some(mut pot) = ctx.db.live_pot().pot_id().find(pot_id) else {
        return Err(format!("pot {pot_id} not found"));
    };

    if pot.owner != ctx.sender() {
        return Err(format!("unauthorized: caller does not own pot {pot_id}"));
    }

    pot.burner_power_w = burner_power_w;
    pot.lid_seal = lid_seal;
    pot.last_tick = ctx.timestamp;

    ctx.db.live_pot().pot_id().update(pot);
    Ok(())
}

/// Step the physical simmer reduction simulation forward.
///
/// Advances volume reduction by delta t (seconds) using Incropera Table A.6 latent heat
/// and the active lid seal vapor escape fraction. Sets alarm_triggered when reduction target is reached.
#[spacetimedb::reducer]
pub fn tick_pot_simulation(
    ctx: &ReducerContext,
    pot_id: u64,
    current_time: spacetimedb::Timestamp,
) -> Result<(), String> {
    let Some(mut pot) = ctx.db.live_pot().pot_id().find(pot_id) else {
        return Err(format!("pot {pot_id} not found"));
    };

    // Calculate delta t in seconds between current_time and pot.last_tick
    let dt_micros = current_time.to_micros_since_unix_epoch() - pot.last_tick.to_micros_since_unix_epoch();
    let dt_s = if dt_micros > 0 {
        dt_micros as f64 / 1_000_000.0
    } else {
        0.0
    };

    if dt_s > 0.0 && pot.is_boiling {
        let step = compute_pot_simmer_step(
            pot.initial_vol_l,
            pot.current_vol_l,
            pot.burner_power_w,
            pot.lid_seal,
            pot.target_reduction_pct,
            dt_s,
        )?;

        pot.current_vol_l = step.current_vol_l;
        pot.concentration_ratio = step.concentration_ratio;
        pot.is_boiling = step.is_boiling;
        pot.alarm_triggered = step.alarm_triggered;
    }

    pot.last_tick = current_time;
    ctx.db.live_pot().pot_id().update(pot);
    Ok(())
}


