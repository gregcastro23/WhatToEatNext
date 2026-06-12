import { Bodoni_Moda } from "next/font/google";
import type { Metadata } from "next";

import "./alchemy.css";

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600", "700"],
  variable: "--font-grimoire",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cooking Methods — Alchemical Culinary Kinetics",
  description:
    "The Transmutation Hub: compare cooking techniques through elemental signatures, P=IV kinetics, molecular interactions, and live planetary alignment.",
};

export default function CookingMethodsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`ma-root ${bodoniModa.variable} min-h-screen`}>
      {children}
    </div>
  );
}
