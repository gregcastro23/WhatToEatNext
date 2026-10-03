/**
 * Transmutation Circle — reading rows and people.
 *
 * Rows arrive as `Record<string, unknown>`; every field is read through a
 * guard rather than trusted through a type parameter. People are named the way
 * the feed names them: agents always, humans only when their identity is
 * shared, otherwise "a fellow alchemist".
 *
 * @file src/services/transmutationRecords.ts
 */

import { executeQuery } from "@/lib/database";
import type { Holdings, OfferTerms } from "@/lib/economy/transmutationMarket";
import { defaultShareIdentity } from "@/lib/feed/identity";
import * as sql from "@/services/transmutationQueries";
import type { TokenBalances, TokenType } from "@/types/economy";
import { TOKEN_TYPES } from "@/types/economy";
import type { TransmutationOfferStatus, TransmutationParty } from "@/types/transmutation";

export const CONCEALED_NAME = "A fellow alchemist";

export type Row = Record<string, unknown>;

export const text = (value: unknown): string => (value == null ? "" : String(value));
export const textOrNull = (value: unknown): string | null => (value == null ? null : String(value));

export function amountOf(value: unknown): number {
  const n = typeof value === "number" ? value : Number.parseFloat(text(value));
  return Number.isFinite(n) ? n : 0;
}

export function isoOf(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") {
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
  }
  return null;
}

function tokenOf(value: unknown): TokenType {
  const token = TOKEN_TYPES.find((t) => t === value);
  if (!token) throw new Error(`transmutation: unexpected token ${text(value)}`);
  return token;
}

export type StoredStatus = "open" | "filled" | "cancelled" | "declined";
const STORED_STATUSES: readonly StoredStatus[] = ["open", "filled", "cancelled", "declined"];

function storedStatusOf(value: unknown): StoredStatus {
  const status = STORED_STATUSES.find((s) => s === value);
  if (!status) throw new Error(`transmutation: unexpected status ${text(value)}`);
  return status;
}

export interface OfferRecord extends OfferTerms {
  id: string;
  makerId: string;
  counterpartyId: string | null;
  message: string | null;
  status: StoredStatus;
  takerId: string | null;
  fillGroupId: string | null;
  replyToOfferId: string | null;
  createdAt: string;
  expiresAt: string;
  closedAt: string | null;
}

export function parseOffer(row: Row): OfferRecord {
  return {
    id: text(row.id),
    makerId: text(row.maker_id),
    counterpartyId: textOrNull(row.counterparty_id),
    giveToken: tokenOf(row.give_token),
    giveAmount: amountOf(row.give_amount),
    wantToken: tokenOf(row.want_token),
    wantAmount: amountOf(row.want_amount),
    message: textOrNull(row.message),
    status: storedStatusOf(row.status),
    takerId: textOrNull(row.taker_id),
    fillGroupId: textOrNull(row.fill_transaction_group_id),
    replyToOfferId: textOrNull(row.reply_to_offer_id),
    createdAt: isoOf(row.created_at) ?? new Date(0).toISOString(),
    expiresAt: isoOf(row.expires_at) ?? new Date(0).toISOString(),
    closedAt: isoOf(row.closed_at),
  };
}

export function holdingsOf(row: Row): Holdings {
  return {
    spirit: amountOf(row.spirit),
    essence: amountOf(row.essence),
    matter: amountOf(row.matter),
    substance: amountOf(row.substance),
  };
}

export function holdingsFromBalances(balances: TokenBalances): Holdings {
  return {
    spirit: balances.spirit,
    essence: balances.essence,
    matter: balances.matter,
    substance: balances.substance,
  };
}

export const isExpired = (offer: OfferRecord, now = Date.now()): boolean =>
  offer.status === "open" && Date.parse(offer.expiresAt) <= now;

export const effectiveStatus = (offer: OfferRecord): TransmutationOfferStatus =>
  isExpired(offer) ? "expired" : offer.status;

// ─── People ───────────────────────────────────────────────────────────

export interface Participant {
  id: string;
  isAgent: boolean;
  name: string | null;
  shareIdentity: boolean | null;
}

const shareOf = (value: unknown): boolean | null => (typeof value === "boolean" ? value : null);

function participantOf(row: Row): Participant {
  return {
    id: text(row.id),
    isAgent: row.is_agent === true,
    name: textOrNull(row.name),
    shareIdentity: shareOf(row.share_identity),
  };
}

/** A joined party's columns, e.g. `maker_name`, `maker_is_agent`, `maker_share_identity`. */
export function joinedPartyOf(row: Row, prefix: string): TransmutationParty {
  return partyOf({
    isAgent: row[`${prefix}_is_agent`] === true,
    name: textOrNull(row[`${prefix}_name`]),
    shareIdentity: shareOf(row[`${prefix}_share_identity`]),
  });
}

/**
 * How a practitioner is named to others. Agents are public personas; a human
 * is named only when their identity default is shared — the same rule the
 * feed applies — and is otherwise a fellow alchemist.
 */
export function partyOf(person: {
  isAgent: boolean;
  name: string | null;
  shareIdentity: boolean | null;
}): TransmutationParty {
  if (person.isAgent) return { name: person.name ?? "An agent", isAgent: true };
  const named = defaultShareIdentity(person.shareIdentity) && person.name;
  return { name: named ? person.name ?? CONCEALED_NAME : CONCEALED_NAME, isAgent: false };
}

export const isRevealed = (person: Participant): boolean =>
  person.isAgent || defaultShareIdentity(person.shareIdentity);

/** Run a built statement outside any transaction and return its rows. */
export async function rowsOf(built: { sql: string; values: unknown[] }): Promise<Row[]> {
  return (await executeQuery(built.sql, built.values)).rows;
}

export async function loadOffer(offerId: string): Promise<OfferRecord | null> {
  const [row] = await rowsOf(sql.offerByIdSql(offerId));
  return row ? parseOffer(row) : null;
}

export async function loadParticipant(userId: string): Promise<Participant | null> {
  const [row] = await rowsOf(sql.participantSql(userId));
  return row ? participantOf(row) : null;
}

export async function loadParticipantByEmail(email: string): Promise<Participant | null> {
  const [row] = await rowsOf(sql.participantByEmailSql(email));
  return row ? participantOf(row) : null;
}

export async function isBlockedPair(userA: string, userB: string): Promise<boolean> {
  return (await rowsOf(sql.blockedPairSql(userA, userB))).length > 0;
}
