import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * The page is a client component and cannot export metadata, so its
 * canonical lives here. A leaf segment: no child route can inherit it
 * (canonicals.test.ts).
 */
export const metadata: Metadata = {
  alternates: { canonical: "/recipe-generator" },
};

export default function RecipeGeneratorLayout({ children }: { children: ReactNode }): ReactNode {
  return children;
}
