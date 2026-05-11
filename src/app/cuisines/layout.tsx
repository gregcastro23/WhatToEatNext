import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cuisines Aligned with the Cosmos",
  description:
    "Explore world cuisines through the lens of astrology and elemental harmony.",
};

export default function CuisinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
