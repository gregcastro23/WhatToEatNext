"use client";

/**
 * Transit invite — "the sky calls your chart to a table".
 *
 * When a transiting planet sits conjunct (≤3° orb) a planet in the viewer's
 * natal chart, a soft banner invites them into that transit's group chat via
 * the existing useTransitGroupChat join mechanic (which also pays the
 * once-ever chat_joined practice). Cross-planet hits use real ecliptic
 * longitudes — transit from AlchemicalContext, natal from the stored chart.
 * Dismissal is remembered per hit per day.
 */

import { useMemo, useState, type JSX } from "react";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import { useUser } from "@/contexts/UserContext";
import { useTransitGroupChat } from "@/hooks/useTransitGroupChat";
import { toParticipant } from "@/lib/agents/transitAgents";

const ORB_DEGREES = 3;
const DISMISS_KEY = "alchm:transit-invite:dismissed";

interface TransitHit {
  transitPlanet: string;
  transitSign: string;
  transitDegree: number; // within-sign 0-29
  natalPlanet: string;
  orb: number;
}

function angularDelta(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function dismissedToday(hitKey: string): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    return raw === `${todayKey()}:${hitKey}`;
  } catch {
    return false;
  }
}

export function TransitInviteBanner(): JSX.Element | null {
  const { state } = useAlchemical();
  const { currentUser } = useUser();
  const { open, pending } = useTransitGroupChat();
  const [dismissed, setDismissed] = useState(false);

  const hit = useMemo<TransitHit | null>(() => {
    const natalPlanets = currentUser?.natalChart?.planets;
    const transits = state?.planetaryPositions as
      | Record<string, { sign?: string; degree?: number; exactLongitude?: number }>
      | undefined;
    if (!Array.isArray(natalPlanets) || natalPlanets.length === 0 || !transits) return null;

    let best: TransitHit | null = null;
    for (const [planetKey, pos] of Object.entries(transits)) {
      const lon = typeof pos?.exactLongitude === "number" ? pos.exactLongitude : null;
      if (lon === null || !pos?.sign) continue;
      for (const natal of natalPlanets) {
        if (typeof natal?.position !== "number" || !natal?.name) continue;
        const orb = angularDelta(lon, natal.position);
        if (orb <= ORB_DEGREES && (!best || orb < best.orb)) {
          best = {
            transitPlanet: planetKey,
            transitSign: String(pos.sign),
            transitDegree: Math.floor(typeof pos.degree === "number" ? pos.degree : lon % 30),
            natalPlanet: String(natal.name),
            orb,
          };
        }
      }
    }
    return best;
  }, [state?.planetaryPositions, currentUser?.natalChart?.planets]);

  if (!hit) return null;

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  const hitKey = `${hit.transitPlanet}-${hit.natalPlanet}`;
  if (dismissed || (typeof window !== "undefined" && dismissedToday(hitKey))) return null;

  const participant = toParticipant({
    planet: hit.transitPlanet,
    sign: hit.transitSign,
    degree: hit.transitDegree,
  });
  if (!participant) return null;

  const label = `${cap(hit.transitPlanet)} crosses your natal ${cap(hit.natalPlanet)}`;

  return (
    <div className="rounded-2xl border border-purple-400/30 bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-transparent px-5 py-4 mb-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        <p className="text-sm text-white/90">
          <span aria-hidden>✶</span> <strong>{label}</strong>
          <span className="text-white/50"> — a table is open under this transit.</span>
        </p>
        <p className="text-[11px] text-white/40 mt-0.5">
          Sit with {participant.name} and the others gathered beneath the same degree.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            void open([participant], { key: `natal-hit--${participant.id}`, label }, "natal-invite")
          }
          className="text-[10px] font-black uppercase tracking-widest text-purple-100 border border-purple-400/50 bg-purple-500/20 rounded-xl px-4 py-2 hover:bg-purple-500/30 transition-colors disabled:opacity-50"
        >
          {pending ? "Opening…" : "Take a seat →"}
        </button>
        <button
          type="button"
          aria-label="Dismiss invite"
          onClick={() => {
            setDismissed(true);
            try {
              window.localStorage.setItem(DISMISS_KEY, `${todayKey()}:${hitKey}`);
            } catch {
              /* private mode */
            }
          }}
          className="text-white/30 hover:text-white/60 text-sm px-1"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
