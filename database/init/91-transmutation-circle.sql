-- database/init/91-transmutation-circle.sql
-- The Transmutation Circle: peer-to-peer ESMS trades.
--
-- Swapping (ADR-017) is solitary: one payer converts coins against the
-- Elemental Exchange Index. Transmutation is social: two practitioners — human
-- or agent — each send the other the coin that one lacks. A maker posts an
-- offer ("I give 3 Spirit, I want 2 Essence"), open to the whole circle or
-- directed at one counterparty; a taker fills it; both wallets move in ONE
-- transaction.
--
-- ── No escrow, on purpose ───────────────────────────────────────────────────
--
-- An offer is a standing intention, not a reservation: posting one does not
-- lock the maker's coins, so nothing leaves `token_balances` and circulating
-- supply, the faucet's supply damping and the drift check are untouched. The
-- board only lists offers the maker can currently cover, and a fill locks BOTH
-- balance rows (in user-id order, so two fills can never deadlock) and
-- re-checks both sides before any row is written. A fill that no longer
-- covers is refused with nothing moved.
--
-- ── The ledger shape of one fill ────────────────────────────────────────────
--
-- Four `transmutation` rows under one transaction group
-- (`fill_transaction_group_id`), source_id = the offer id:
--   maker  −give_amount give_token     taker  −want_amount want_token
--   maker  +want_amount want_token     taker  +give_amount give_token
-- Every coin that leaves one wallet lands in the other: the trade conserves
-- supply on every axis exactly.
--
-- ── Immutability ────────────────────────────────────────────────────────────
--
-- An offer's terms never change after it is posted, and a closed offer never
-- reopens. The trigger below enforces both, so the table is a trustworthy
-- record of who offered what, and what was agreed.

CREATE TABLE IF NOT EXISTS transmutation_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    maker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- NULL = open to the whole circle; set = only this practitioner may fill.
    counterparty_id UUID REFERENCES users(id) ON DELETE CASCADE,
    give_token VARCHAR(20) NOT NULL
        CHECK (give_token IN ('Spirit', 'Essence', 'Matter', 'Substance')),
    give_amount DECIMAL(12, 4) NOT NULL CHECK (give_amount > 0),
    want_token VARCHAR(20) NOT NULL
        CHECK (want_token IN ('Spirit', 'Essence', 'Matter', 'Substance')),
    want_amount DECIMAL(12, 4) NOT NULL CHECK (want_amount > 0),
    message VARCHAR(280),
    status VARCHAR(16) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'filled', 'cancelled', 'declined')),
    taker_id UUID REFERENCES users(id) ON DELETE SET NULL,
    fill_transaction_group_id UUID,
    -- A counter-offer answers another offer: directed at that offer's maker.
    reply_to_offer_id UUID REFERENCES transmutation_offers(id) ON DELETE SET NULL,
    -- The maker's client key: a retried post returns the same offer.
    idempotency_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- 'open' past this instant reads as expired; no sweep is needed because
    -- nothing is held in escrow.
    expires_at TIMESTAMPTZ NOT NULL,
    closed_at TIMESTAMPTZ,

    CONSTRAINT transmutation_offer_distinct_tokens CHECK (give_token <> want_token),
    CONSTRAINT transmutation_offer_not_to_self
        CHECK (counterparty_id IS NULL OR counterparty_id <> maker_id),
    CONSTRAINT transmutation_offer_not_filled_by_maker
        CHECK (taker_id IS NULL OR taker_id <> maker_id),
    CONSTRAINT transmutation_offer_expiry_after_creation CHECK (expires_at > created_at),
    CONSTRAINT transmutation_offer_closed_at_iff_closed
        CHECK ((status = 'open') = (closed_at IS NULL)),
    CONSTRAINT transmutation_offer_fill_group_iff_filled
        CHECK ((status = 'filled') = (fill_transaction_group_id IS NOT NULL))
);

COMMENT ON TABLE transmutation_offers IS
  'Transmutation Circle: peer-to-peer ESMS trade offers. No escrow; a fill '
  'moves both wallets in one transaction under fill_transaction_group_id '
  '(four transmutation ledger rows, source_id = offer id). Terms are immutable '
  'and a closed offer never reopens (transmutation_offers_guard).';

-- The public board: newest open offers first.
CREATE INDEX IF NOT EXISTS idx_transmutation_offers_open
    ON transmutation_offers (created_at DESC)
    WHERE status = 'open';

-- "Offers made to me."
CREATE INDEX IF NOT EXISTS idx_transmutation_offers_counterparty_open
    ON transmutation_offers (counterparty_id, created_at DESC)
    WHERE status = 'open' AND counterparty_id IS NOT NULL;

-- A maker's own offers, and the per-maker open-offer cap.
CREATE INDEX IF NOT EXISTS idx_transmutation_offers_maker
    ON transmutation_offers (maker_id, created_at DESC);

-- Trade history / partner counts from the taker's side.
CREATE INDEX IF NOT EXISTS idx_transmutation_offers_taker
    ON transmutation_offers (taker_id)
    WHERE taker_id IS NOT NULL;

CREATE OR REPLACE FUNCTION transmutation_offers_guard() RETURNS trigger AS $$
BEGIN
  -- Terms are fixed at posting.
  IF (NEW.maker_id, NEW.counterparty_id, NEW.give_token, NEW.give_amount,
      NEW.want_token, NEW.want_amount, NEW.message, NEW.idempotency_key,
      NEW.created_at, NEW.expires_at)
     IS DISTINCT FROM
     (OLD.maker_id, OLD.counterparty_id, OLD.give_token, OLD.give_amount,
      OLD.want_token, OLD.want_amount, OLD.message, OLD.idempotency_key,
      OLD.created_at, OLD.expires_at) THEN
    RAISE EXCEPTION 'transmutation offer % terms are immutable', OLD.id
      USING ERRCODE = 'check_violation';
  END IF;

  -- `ON DELETE SET NULL` may clear these on any row; nothing else may set them
  -- to a different value.
  IF NEW.reply_to_offer_id IS DISTINCT FROM OLD.reply_to_offer_id
     AND NEW.reply_to_offer_id IS NOT NULL THEN
    RAISE EXCEPTION 'transmutation offer % reply_to_offer_id is immutable', OLD.id
      USING ERRCODE = 'check_violation';
  END IF;

  -- A closed offer stays closed: no reopening, no second fill, no new taker.
  IF OLD.status <> 'open' AND (
       (NEW.status, NEW.fill_transaction_group_id, NEW.closed_at)
         IS DISTINCT FROM (OLD.status, OLD.fill_transaction_group_id, OLD.closed_at)
       OR (NEW.taker_id IS DISTINCT FROM OLD.taker_id AND NEW.taker_id IS NOT NULL)
     ) THEN
    RAISE EXCEPTION 'transmutation offer % is % and cannot change', OLD.id, OLD.status
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS transmutation_offers_guard ON transmutation_offers;
CREATE TRIGGER transmutation_offers_guard
    BEFORE UPDATE ON transmutation_offers
    FOR EACH ROW EXECUTE FUNCTION transmutation_offers_guard();
