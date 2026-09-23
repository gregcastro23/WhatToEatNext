"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type JSX } from "react";

/**
 * Slim top progress bar for client-side navigations.
 *
 * Replaces the feedback the root `loading.tsx` used to give. That file wrapped
 * every page in Suspense, so headers flushed before a page decided its status
 * and `notFound()` / `permanentRedirect()` answered HTTP 200. This bar needs no
 * Suspense: it starts when a next/link click begins a router navigation and
 * clears when the pathname changes. The (alchm) route group keeps its own
 * loading skeleton.
 */

/** Clears a bar whose navigation never landed (e.g. a click another handler cancelled). */
const SAFETY_TIMEOUT_MS = 10_000;

/**
 * Target pathname when a click started a client-side navigation, else null.
 * next/link calls preventDefault() before router.push; a plain <a> does not,
 * and the browser's own page-load indicator covers that case.
 */
export function navigationTarget(event: MouseEvent, currentPathname: string | null): string | null {
  if (!event.defaultPrevented || event.button !== 0) return null;
  const { target } = event;
  if (!(target instanceof Element)) return null;
  const anchor = target.closest("a");
  if (!anchor || anchor.target === "_blank" || !anchor.getAttribute("href")) return null;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin || url.pathname === currentPathname) return null;
  return url.pathname;
}

const BAR_CSS = `
.alchm-nav-progress{position:fixed;top:0;left:0;right:0;height:2px;z-index:1100;overflow:hidden;pointer-events:none;opacity:0;animation:alchm-nav-fade 0s linear 150ms forwards}
.alchm-nav-progress>span{display:block;height:100%;width:40%;background:var(--accent,#d4a24c);animation:alchm-nav-slide 1.1s ease-in-out infinite}
@keyframes alchm-nav-fade{to{opacity:1}}
@keyframes alchm-nav-slide{from{transform:translateX(-100%)}to{transform:translateX(250%)}}
@media (prefers-reduced-motion:reduce){.alchm-nav-progress>span{animation:none;width:100%;opacity:.6}}
`;

export function NavigationProgress(): JSX.Element | null {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    pathnameRef.current = pathname;
    setPending(false);
  }, [pathname]);

  useEffect(() => {
    // window (not document) so React's own root listener, which is where
    // next/link calls preventDefault, has already run.
    const onClick = (event: MouseEvent): void => {
      if (navigationTarget(event, pathnameRef.current) !== null) setPending(true);
    };
    window.addEventListener("click", onClick);
    return (): void => window.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!pending) return undefined;
    const id = window.setTimeout(() => setPending(false), SAFETY_TIMEOUT_MS);
    return (): void => window.clearTimeout(id);
  }, [pending]);

  if (!pending) return null;
  return (
    <div className="alchm-nav-progress" role="progressbar" aria-label="Loading page">
      <span />
      <style>{BAR_CSS}</style>
    </div>
  );
}
