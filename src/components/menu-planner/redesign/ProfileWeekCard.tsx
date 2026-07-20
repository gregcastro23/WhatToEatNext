"use client";

/**
 * ProfileWeekCard — self-contained "This Week" fixture for the user's own
 * alchm.kitchen profile. Fetches the signed-in user's current-week menu
 * (owner-scoped GET /api/menu-planner/menus) and renders the interactive
 * ProfileWeekFixture. Degrades to an honest "plan your week" CTA when there's
 * no menu yet or the user isn't signed in.
 *
 * @file src/components/menu-planner/redesign/ProfileWeekCard.tsx
 */

import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { DayOfWeek, MealSlot as MealSlotType } from "@/types/menuPlanner";
import { getWeekStartDate } from "@/types/menuPlanner";
import ProfileWeekFixture from "./ProfileWeekFixture";

export default function ProfileWeekCard() {
  const [meals, setMeals] = useState<MealSlotType[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const weekStart = getWeekStartDate(new Date());
        const iso = weekStart.toISOString();
        const res = await fetch(
          `/api/menu-planner/menus?weekStartDate=${encodeURIComponent(iso)}`,
        );
        if (!res.ok) {
          if (!cancelled) setMeals([]);
          return;
        }
        const json = (await res.json()) as {
          success: boolean;
          menu?: { meals?: MealSlotType[] } | null;
        };
        if (!cancelled) setMeals(json?.menu?.meals ?? []);
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
  }, []);

  const todayDayOfWeek = new Date().getDay() as DayOfWeek;

  if (loading) {
    return (
      <div className="alchm-panel rounded-xl p-4 animate-pulse">
        <div className="h-4 w-28 bg-surface-container-high rounded mb-4" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface-container-high/60 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const hasPlanned = (meals ?? []).some((m) => m.recipe);

  if (!hasPlanned) {
    return (
      <Link
        href="/menu-planner"
        className="alchm-panel rounded-xl p-4 flex items-center justify-between gap-3 hover:bg-surface-container-low/40 transition-colors group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-active-violet/10 text-active-violet shrink-0">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-headline-md text-[18px] font-bold text-primary">
              Plan your week
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant/70">
              Your weekly menu is empty
            </p>
          </div>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-active-violet group-hover:text-primary transition-colors">
          Open →
        </span>
      </Link>
    );
  }

  return (
    <ProfileWeekFixture
      variant="user"
      title="This Week"
      meals={meals ?? []}
      todayDayOfWeek={todayDayOfWeek}
    />
  );
}
