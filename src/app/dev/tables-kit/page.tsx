import { notFound } from "next/navigation";
import TablesKitPreview from "./TablesKitPreview";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tables UI Kit — Dev Preview",
  robots: { index: false, follow: false },
};

/**
 * Visual verification surface for the Tables shared component kit
 * (docs/design/tables-design-spec.md §2). Dev-only: 404s in production.
 */
export default function TablesKitDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <TablesKitPreview />;
}
