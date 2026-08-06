import { notFound } from "next/navigation";
import TablesKitPreview from "./TablesKitPreview";
import type { Metadata } from "next";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * Metadata has to be generated rather than exported as a constant. A static
 * `export const metadata` is resolved for the route regardless of whether the
 * component body runs, so the dev-preview title was still emitted on the
 * production 404 — leaking the internal page name to anyone who probed the
 * URL. Generating it lets the production branch return nothing identifying.
 */
export function generateMetadata(): Metadata {
  if (IS_PRODUCTION) {
    return { robots: { index: false, follow: false } };
  }
  return {
    title: "Tables UI Kit — Dev Preview",
    robots: { index: false, follow: false },
  };
}

/**
 * Rendered per-request so the guard below runs at request time. Without this
 * the route was prerendered at build time (where NODE_ENV is already
 * "production"), so `notFound()` fired during the build and Next served the
 * resulting page as a static asset with **HTTP 200** — a soft 404 that search
 * engines treat as a real page and that `robots: noindex` only papers over.
 */
export const dynamic = "force-dynamic";

/**
 * Visual verification surface for the Tables shared component kit
 * (docs/design/tables-design-spec.md §2). Dev-only: hard-404s in production.
 */
export default function TablesKitDevPage() {
  if (IS_PRODUCTION) notFound();
  return <TablesKitPreview />;
}
