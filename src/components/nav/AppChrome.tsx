"use client";

import { usePathname } from "next/navigation";
import type { JSX, ReactNode } from "react";

/**
 * Route-aware wrapper for the non-header chrome (footer + mobile tab bar +
 * command palette). The RedesignedHeader stays mounted on every route for
 * navigation/orientation, but on full-screen auth/gate splashes the footer
 * and tab bar compete with the splash's own affordances — so we hide them.
 *
 * Chromeless splash prefixes (footer + tab bar hidden):
 *   /login, /auth/*, /upgrade, /onboarding
 *
 * The command palette is always mounted because the ⌘K keybind should be
 * available everywhere.
 */
export function AppChromeFooter({ children }: { children: ReactNode }): JSX.Element | null {
  const pathname = usePathname();
  if (isChromelessSplash(pathname)) return null;
  return <>{children}</>;
}

export function AppChromeTabBar({ children }: { children: ReactNode }): JSX.Element | null {
  const pathname = usePathname();
  if (isChromelessSplash(pathname)) return null;
  return <>{children}</>;
}

function isChromelessSplash(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/onboarding" ||
    pathname.startsWith("/onboarding/") ||
    pathname === "/upgrade" ||
    pathname.startsWith("/upgrade/") ||
    pathname.startsWith("/auth/")
  );
}
