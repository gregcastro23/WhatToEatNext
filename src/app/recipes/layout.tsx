import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recipes",
  description:
    "Browse cosmically-aligned recipes drawn from the world's cuisines, paired to today's planetary energies.",
};

export default function RecipesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
