import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recipe Builder",
  description: "Build, scale, and save custom recipes aligned with cosmic timing.",
  // A leaf segment: no child route can inherit this (canonicals.test.ts).
  alternates: { canonical: "/recipe-builder" },
};

export default function RecipeBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
