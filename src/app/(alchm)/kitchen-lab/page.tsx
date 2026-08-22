import { LabOverview } from "@/components/lab/LabOverview";
import type { Metadata } from "next";
import type { JSX } from "react";

export const metadata: Metadata = {
  title: "Kitchen Lab",
  description:
    "The thermodynamics of a pan of food — measured heat transfer, latent heat and medium boundaries, kept separate from the alchm model of the same kitchen.",
};

export default function KitchenLabPage(): JSX.Element {
  return <LabOverview lab="kitchenLab" />;
}
