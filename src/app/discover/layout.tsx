import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover · The Cosmic Pantry",
  description:
    "Browse the cosmic pantry — cuisines, ingredients, cooking methods, sauces, restaurants, and recipes, all ranked by the live sky.",
};

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
