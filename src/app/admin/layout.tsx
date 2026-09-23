"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { isAdminEmail } from "@/lib/auth/adminEmails";
import { _logger } from "@/lib/logger";

/**
 * Admin Layout - Sidebar navigation for admin panel
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const _router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (!response.ok) return;
      const data = await response.json();

      // NextAuth /api/auth/session returns `{ user, expires }` for signed-in
      // users (no `authenticated` field) and `{}` when signed out. The user
      // shape is `{ role: "admin" | "user", email, ... }` — `role` is a
      // singular string here, not the `roles[]` array used elsewhere in the
      // codebase for the UserWithProfile type.
      const sessionUser = data?.user as
        | { role?: string; email?: string }
        | undefined;
      const signedIn = Boolean(sessionUser?.email);

      if (
        signedIn &&
        sessionUser?.role === "admin" &&
        isAdminEmail(sessionUser?.email)
      ) {
        setIsAuthenticated(true);
        setIsAdmin(true);
      } else if (signedIn) {
        setIsAuthenticated(true);
        setIsAdmin(false);
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } catch (error) {
      _logger.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const navGroups: Array<{ group: string; items: Array<{ href: string; label: string; icon: string }> }> = [
    {
      group: "Pulse",
      items: [
        { href: "/admin", label: "Overview", icon: "📊" },
        { href: "/admin/dashboard", label: "Dashboard ✦", icon: "🔭" },
      ],
    },
    {
      group: "Audience",
      items: [
        { href: "/admin/traffic", label: "Traffic", icon: "📈" },
        { href: "/admin/growth", label: "Growth", icon: "🌱" },
        { href: "/admin/users", label: "Users", icon: "👥" },
        { href: "/admin/onboarding", label: "Onboarding", icon: "🧭" },
      ],
    },
    {
      group: "Money & chain",
      items: [
        { href: "/admin/revenue", label: "Revenue", icon: "💵" },
        { href: "/admin/settlements", label: "Settlements", icon: "💳" },
        { href: "/admin/chain", label: "Chain", icon: "⛓️" },
      ],
    },
    {
      group: "Build",
      items: [
        { href: "/admin/code-health", label: "Code Health", icon: "🧪" },
        { href: "/admin/mcp", label: "MCP Network ✦", icon: "🔌" },
      ],
    },
    {
      group: "Moderation",
      items: [
        { href: "/admin/chat-reports", label: "Chat Reports", icon: "🚩" },
        { href: "/admin/feed/comment-reports", label: "Comment Reports", icon: "💬" },
      ],
    },
    {
      group: "System",
      items: [
        { href: "/admin/jobs", label: "Jobs & probes", icon: "⏱️" },
        { href: "/admin/settings", label: "Settings", icon: "⚙️" },
      ],
    },
  ];
  const navItems = navGroups.flatMap((g) => g.items);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please log in to access the admin panel.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don&apos;t have permission to access the admin panel.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // The High Alchemist dashboard at /admin/dashboard renders its own
  // full-bleed chrome (top bar + side rail), so we skip the legacy
  // Tailwind sidebar there. /admin and /admin/users etc. keep it.
  if (pathname?.startsWith("/admin/dashboard")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100 lg:flex">
      {/* Mobile top nav (< lg). On wider screens this hides; the sidebar takes over. */}
      <header className="lg:hidden sticky top-0 z-20 bg-gray-800 text-white shadow">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-base font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
            alchm.kitchen · Admin
          </h1>
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            ← Site
          </Link>
        </div>
        <nav
          className="flex overflow-x-auto border-t border-gray-700 no-scrollbar"
          aria-label="Admin sections"
        >
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && Boolean(pathname?.startsWith(`${item.href}/`)));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-shrink-0 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors whitespace-nowrap ${
                  active
                    ? "bg-gray-700 text-white border-b-2 border-purple-500"
                    : ""
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Sidebar (lg+). Fixed-position so the main content scrolls underneath. */}
      <aside className="hidden lg:block w-64 bg-gray-800 text-white fixed h-full">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
            alchm.kitchen
          </h1>
          <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
        </div>

        <nav className="mt-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 170px)" }}>
          {navGroups.map((g) => (
            <div key={g.group} className="mt-3">
              <p className="px-6 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">{g.group}</p>
              {g.items.map((item) => {
                const active = pathname === item.href || (item.href !== "/admin" && Boolean(pathname?.startsWith(`${item.href}/`)));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-6 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
                      active
                        ? "bg-gray-700 text-white border-r-4 border-purple-500"
                        : ""
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-gray-700">
          <Link
            href="/"
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <span className="mr-3">🏠</span>
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content — no left-margin on mobile (top nav lives at the top
          instead). On lg+ the sidebar is fixed at 256px so we push content
          right by that much. Padding scales down on small screens. */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
