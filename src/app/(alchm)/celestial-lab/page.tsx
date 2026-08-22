import type { Metadata } from "next";
import type { JSX } from "react";
import { LabOverview } from "@/components/lab/LabOverview";

export const metadata: Metadata = {
  title: "Celestial Lab",
  description:
    "The mechanics of the sky — ephemeris positions, aspects and sect, kept separate from the alchm quantities derived from them.",
};

export default function CelestialLabPage(): JSX.Element {
  return <LabOverview lab="celestialLab" />;
}
