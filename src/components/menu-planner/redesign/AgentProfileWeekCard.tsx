"use client";

/**
 * AgentProfileWeekCard — the living weekly-menu fixture for a Planetary Agent's
 * alchm.kitchen profile. Fetches the agent's published current-week menu from
 * the public read endpoint and renders the read-only ProfileWeekFixture with an
 * "Adopt this week" action. Renders nothing until the agent has published a
 * week (no empty shells on real profiles).
 *
 * @file src/components/menu-planner/redesign/AgentProfileWeekCard.tsx
 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { DayOfWeek, MealSlot as MealSlotType } from "@/types/menuPlanner";
import ProfileWeekFixture from "./ProfileWeekFixture";

/** Coarse "updated N ago" label from an ISO timestamp. */
function relativeStamp(iso: string | null): string | undefined {
  if (!iso) return undefined;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return undefined;
  const diffH = Math.floor((Date.now() - then) / 3_600_000);
  if (diffH < 1) return "Updated just now";
  if (diffH < 24) return `Updated ${diffH}h ago`;
  return `Updated ${Math.floor(diffH / 24)}d ago`;
}

export default function AgentProfileWeekCard({
  userId,
  agentName,
}: {
  userId: string;
  agentName?: string | null;
}) {
  const router = useRouter();
  const [meals, setMeals] = useState<MealSlotType[] | null>(null);
  const [updatedLabel, setUpdatedLabel] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/menu-planner/public-week?userId=${encodeURIComponent(userId)}`,
        );
        if (!res.ok) {
          if (!cancelled) setMeals([]);
          return;
        }
        const json = (await res.json()) as {
          success: boolean;
          meals?: MealSlotType[];
          updatedAt?: string | null;
        };
        if (!cancelled) {
          setMeals((json?.meals ?? []));
          setUpdatedLabel(relativeStamp(json?.updatedAt ?? null));
        }
      } catch {
        if (!cancelled) setMeals([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const todayDayOfWeek = new Date().getDay() as DayOfWeek;

  if (loading) {
    return <div className="alchm-panel rounded-xl p-4 h-28 animate-pulse" />;
  }

  // Don't render an empty shell on agents who haven't published a week.
  if (!(meals ?? []).some((m) => m.recipe)) return null;

  return (
    <ProfileWeekFixture
      variant="agent"
      title={`${agentName ?? "Agent"}'s week`}
      meals={meals ?? []}
      updatedLabel={updatedLabel}
      planetaryFocus="Planetary menu"
      todayDayOfWeek={todayDayOfWeek}
      onAdopt={() => router.push("/menu-planner")}
    />
  );
}
