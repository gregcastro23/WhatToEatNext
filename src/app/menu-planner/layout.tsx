import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly Menu Planner",
  description:
    "Plan your week's meals, scale recipes by servings, and check out via Amazon in one tap.",
  // A leaf segment: no child route can inherit this (canonicals.test.ts).
  alternates: { canonical: "/menu-planner" },
};

export default function MenuPlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
