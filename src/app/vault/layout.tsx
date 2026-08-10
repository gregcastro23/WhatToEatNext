import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium",
  description:
    "Unlock unlimited recipe generation, advanced cosmic analysis, and full pantry tracking.",
};

export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
