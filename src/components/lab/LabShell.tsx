"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Glyph } from "@/components/ui/alchm/Glyph";
import {
  NAV_IA,
  systemFromPathname,
  type PrimaryKey,
} from "@/config/navigation";
import { SystemBadge } from "./SystemBadge";
import type { JSX, ReactNode } from "react";

/**
 * Chrome shared by both labs: the lab switcher, the subpage rail, and the
 * persistent "which model is this?" chip.
 *
 * ## Why one component for two labs
 *
 * The labs are meant to feel like siblings, not like two features that grew
 * separately — a user who learns the layout in the Kitchen Lab should already
 * know their way around the Celestial one. Sharing the chrome is what enforces
 * that; the visual difference between the labs comes from the accent token each
 * layout sets, not from divergent markup.
 *
 * ## Everything here derives from NAV_IA
 *
 * The subpage rail and the system chip both read src/config/navigation.ts. That
 * is deliberate: a hand-maintained rail can list a route the nav has dropped,
 * and a hand-written badge can claim a system the nav disagrees with. Neither
 * failure is visible in review — both are visible to a user, as a dead link or
 * as a wrong claim about what a number means.
 *
 * @file src/components/lab/LabShell.tsx
 */

const LABS: ReadonlyArray<{ key: Extract<PrimaryKey, "kitchenLab" | "celestialLab">; }> = [
  { key: "kitchenLab" },
  { key: "celestialLab" },
];

export interface LabShellProps {
  lab: Extract<PrimaryKey, "kitchenLab" | "celestialLab">;
  /** Accent colour token for this lab, e.g. "text-amber-300". */
  accent: string;
  children: ReactNode;
}

export function LabShell({ lab, accent, children }: LabShellProps): JSX.Element {
  const pathname = usePathname();
  const section = NAV_IA[lab];
  const system = systemFromPathname(pathname);

  // The overview is the section's own path; it is a leaf in the rail too, so
  // exact-match it rather than prefix-matching (which would light up for every
  // child route and leave the rail with two active items).
  const isActive = (path: string): boolean => {
    if (!pathname) return false;
    return path === section.path
      ? pathname === path
      : pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#08080e]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Lab switcher — the two labs are peers, so they are presented as
              a two-up toggle rather than one being a child of the other. */}
          <nav
            aria-label="Choose a lab"
            className="flex items-center gap-1 pt-3"
          >
            {LABS.map(({ key }) => {
              const s = NAV_IA[key];
              const current = key === lab;
              return (
                <Link
                  key={key}
                  href={s.path}
                  aria-current={current ? "page" : undefined}
                  className={`flex items-center gap-2 rounded-t-lg px-3 py-2 text-sm font-semibold transition ${
                    current
                      ? "bg-white/[0.07] text-white"
                      : "text-white/45 hover:bg-white/[0.03] hover:text-white/75"
                  }`}
                >
                  <Glyph name={s.glyph} size={15} />
                  {s.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-3">
            <h1 className={`text-lg font-semibold tracking-tight ${accent}`}>
              {section.label}
            </h1>
            <p className="text-xs text-white/40">{section.sub}</p>
          </div>

          {/* Subpage rail. Grouped label + chip so the reader sees the model
              they are about to enter before the page body renders. */}
          <div className="flex flex-wrap items-center gap-x-1 gap-y-2 pb-px pt-2">
            {section.routes.map((route) => {
              const current = isActive(route.path);
              return (
                <Link
                  key={route.path}
                  href={route.path}
                  aria-current={current ? "page" : undefined}
                  title={route.hint}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                    current
                      ? "bg-white/10 text-white"
                      : "text-white/45 hover:bg-white/5 hover:text-white/80"
                  }`}
                >
                  {route.system ? (
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${
                        route.system === "real" ? "bg-emerald-400" : "bg-violet-400"
                      }`}
                    />
                  ) : null}
                  {route.label}
                </Link>
              );
            })}

            {system ? (
              <span className="ml-auto hidden sm:block">
                <SystemBadge system={system} variant="chip" />
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl">{children}</main>
    </div>
  );
}
