import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Leaf metadata & self-canonical for `/kitchen-lab/sauces` (canonicals.test.ts).
 */
export const metadata: Metadata = {
  title: "Sauce Lab",
  description:
    "SI-unit sauce rheology & reduction physics paired with the Alchm 15-tradition pairing matrix and mother-sauce phylogeny forest.",
  alternates: { canonical: "/kitchen-lab/sauces" },
};

export default function KitchenLabSaucesLayout({ children }: { children: ReactNode }): ReactNode {
  return children;
}
