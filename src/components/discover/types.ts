/**
 * Client-facing shapes for the Discover surface (PR 6 §4). These mirror the
 * JSON returned by /api/discover/tables and /api/discover/people — declared
 * here (not imported from the server discoveryService) so client components
 * never pull a server-only module.
 *
 * @file src/components/discover/types.ts
 */

import { ELEMENTS, type Element } from "@/components/tables/ui";

export interface DiscoverTableCard {
  id: string;
  title: string;
  scheduledAt: string;
  status: string;
  venue: { type: string; name?: string };
  distanceKm?: number;
  photoUrl?: string;
  host: { id: string; name: string; avatarUrl: string | null; dominantElement: string | null };
  joinedCount: number;
  seatCap: number | null;
  seatsLeft: number | null;
  compatibility: number | null;
  dominantElement: string | null;
}

export interface DiscoverPersonCard {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  dominantElement: string | null;
  isAgent: boolean;
  compatibility: number | null;
  mutualCommensals: number;
  isCommensal: boolean;
  followState: "following" | "not_following" | null;
}

/** Coerce a stored/derived dominant-element string into the kit `Element`
 * union (falls back to Air — the neutral sigil — never an invented value). */
export function toElement(value: string | null | undefined): Element {
  return value && (ELEMENTS as string[]).includes(value) ? (value as Element) : "Air";
}
