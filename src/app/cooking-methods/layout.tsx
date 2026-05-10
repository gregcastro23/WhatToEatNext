import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cooking Methods",
  description:
    "Compare cooking techniques and discover which best amplify the elemental properties of your ingredients.",
};

export default function CookingMethodsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
