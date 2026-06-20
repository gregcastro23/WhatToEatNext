"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState, type JSX } from "react";
import { Glyph, type GlyphName } from "@/components/ui/alchm/Glyph";
import { activePrimaryFromPathname } from "@/config/navigation";

interface Tab {
  id: string;
  label: string;
  icon: GlyphName;
  href: string;
  matchKey?: "kitchen" | "discover" | "plan" | "commensal" | "lab";
}

const TABS: readonly Tab[] = [
  { id: "kitchen", label: "Kitchen", icon: "flask", href: "/", matchKey: "kitchen" },
  { id: "discover", label: "Discover", icon: "atom", href: "/discover", matchKey: "discover" },
  { id: "plan", label: "Plan", icon: "diamond", href: "/menu-planner", matchKey: "plan" },
  { id: "profile", label: "Profile", icon: "ring", href: "/profile", matchKey: "lab" },
] as const;

interface QuickAction {
  label: string;
  glyph: GlyphName;
  hint: string;
  href: string;
}

const QUICK_ACTIONS: readonly QuickAction[] = [
  { label: "Compose tonight's menu", glyph: "flask", hint: "RECIPE BUILDER", href: "/recipe-builder" },
  { label: "Add to pantry", glyph: "mortar", hint: "PANTRY", href: "/pantry" },
  { label: "Invite to commensal", glyph: "ring", hint: "DINNER PARTY", href: "/commensal" },
  { label: "Search the kitchen", glyph: "search", hint: "⌘K", href: "" },
] as const;

/**
 * Mobile-only bottom tab bar with a kinetic center action.
 * Mounted by the root layout below 900px.
 */
export function MobileGlassTabBar(): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const active = activePrimaryFromPathname(pathname);
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsDialogRef = useRef<HTMLDivElement>(null);
  const actionsTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setActionsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!actionsOpen) return;

    const firstAction = actionsDialogRef.current?.querySelector("button");
    firstAction?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActionsOpen(false);
        window.requestAnimationFrame(() => actionsTriggerRef.current?.focus());
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [actionsOpen]);

  const closeActions = () => {
    setActionsOpen(false);
    window.requestAnimationFrame(() => actionsTriggerRef.current?.focus());
  };

  const onAction = (a: QuickAction) => {
    setActionsOpen(false);
    if (a.href === "") {
      window.dispatchEvent(new CustomEvent("alchm:palette:open"));
      return;
    }
    router.push(a.href);
  };

  return (
    <>
      <style>{`
        .alchm-mobile-tabbar { display: flex; }
        @media (min-width: 900px) {
          .alchm-mobile-tabbar { display: none; }
        }
      `}</style>

      {actionsOpen && (
        <div
          onClick={closeActions}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(7,6,11,0.6)",
            backdropFilter: "blur(4px)",
          }}
          aria-hidden="true"
        />
      )}

      {actionsOpen && (
        <div
          id="alchm-quick-actions"
          ref={actionsDialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="alchm-quick-actions-title"
          className="alchm-mobile-tabbar"
          style={{
            position: "fixed",
            left: 16,
            right: 16,
            bottom: 96,
            zIndex: 70,
            background:
              "linear-gradient(180deg, rgba(20,16,30,0.96), rgba(14,12,22,0.96))",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--line-hi)",
            borderRadius: 16,
            boxShadow: "0 30px 60px -10px rgba(0,0,0,0.6)",
            padding: 8,
            flexDirection: "column",
            color: "var(--fg)",
          }}
        >
          <div
            id="alchm-quick-actions-title"
            className="t-tag"
            style={{ padding: "10px 14px 8px", fontSize: 9 }}
          >
            QUICK ACTIONS
          </div>
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => onAction(a)}
              style={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: "32px 1fr auto",
                gap: 12,
                alignItems: "center",
                padding: "12px 14px",
                borderRadius: 10,
                background: "transparent",
                border: "none",
                color: "var(--fg)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--line)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Glyph
                  name={a.glyph}
                  size={14}
                  stroke={1.4}
                  style={{ color: "var(--accent)" }}
                />
              </div>
              <span style={{ fontSize: 14 }}>{a.label}</span>
              <span
                className="t-mono"
                style={{
                  fontSize: 9,
                  color: "var(--fg-mute)",
                  letterSpacing: "0.14em",
                }}
              >
                {a.hint}
              </span>
            </button>
          ))}
        </div>
      )}

      <nav
        className="alchm-mobile-tabbar"
        aria-label="Primary navigation"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 65,
          padding: "8px 14px max(22px, env(safe-area-inset-bottom))",
          background:
            "linear-gradient(180deg, rgba(7,6,11,0.4), rgba(7,6,11,0.92))",
          backdropFilter: "blur(18px)",
          borderTop: "1px solid var(--line)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 56px 1fr 1fr",
            alignItems: "center",
            gap: 0,
            maxWidth: 520,
            margin: "0 auto",
          }}
        >
          {/* first two tabs */}
          {TABS.slice(0, 2).map((t) => {
            const isActive = t.matchKey === active;
            return (
              <Link
                key={t.id}
                href={t.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "6px 0",
                  minHeight: 50,
                  color: isActive ? "var(--fg)" : "var(--fg-mute)",
                  textDecoration: "none",
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <Glyph name={t.icon} size={18} stroke={isActive ? 1.6 : 1.2} />
                <span
                  className="t-mono"
                  style={{
                    fontSize: 8.5,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                >
                  {t.label}
                </span>
              </Link>
            );
          })}

          {/* center action */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              ref={actionsTriggerRef}
              type="button"
              aria-label="Quick actions"
              aria-expanded={actionsOpen}
              aria-controls="alchm-quick-actions"
              onClick={() => setActionsOpen((v) => !v)}
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background:
                  "linear-gradient(180deg, var(--accent), color-mix(in oklch, var(--accent), black 20%))",
                border: "1px solid color-mix(in oklch, var(--accent), white 5%)",
                boxShadow:
                  "0 8px 24px -4px color-mix(in oklch, var(--accent), transparent 30%), inset 0 1px 0 rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--bg)",
                cursor: "pointer",
                transform: actionsOpen ? "rotate(45deg)" : "rotate(0deg)",
                transition: "transform 240ms cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              <Glyph name="plus" size={22} stroke={2.2} />
            </button>
          </div>

          {/* last two tabs */}
          {TABS.slice(2).map((t) => {
            const isActive = t.matchKey === active;
            const href =
              t.id === "profile" && status !== "authenticated" ? "/login" : t.href;
            return (
              <Link
                key={t.id}
                href={href}
                prefetch={t.id === "profile" ? false : undefined}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "6px 0",
                  minHeight: 50,
                  color: isActive ? "var(--fg)" : "var(--fg-mute)",
                  textDecoration: "none",
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <Glyph name={t.icon} size={18} stroke={isActive ? 1.6 : 1.2} />
                <span
                  className="t-mono"
                  style={{
                    fontSize: 8.5,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                >
                  {t.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default MobileGlassTabBar;
