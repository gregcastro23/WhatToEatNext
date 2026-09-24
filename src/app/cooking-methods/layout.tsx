import { bodoniModa } from "../fonts/bodoniModa";
import type { Metadata } from "next";

import "./alchemy.css";

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
