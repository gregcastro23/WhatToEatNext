import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pantry",
  description: "Track what's in your pantry and surface recipes you can make right now.",
};

export default function PantryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
