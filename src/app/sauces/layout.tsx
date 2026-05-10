import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cosmic Sauces",
  description:
    "Discover sauces and finishing pairings tuned to your astrological profile.",
};

export default function SaucesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
