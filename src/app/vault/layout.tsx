import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ESMS Token Vault & Treasury",
  description:
    "Manage your Spirit, Essence, Matter, and Substance tokens, claim daily Cosmic Yield, and fund your culinary alchemy.",
};

export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
