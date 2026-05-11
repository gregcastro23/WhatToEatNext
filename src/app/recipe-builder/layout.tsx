import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recipe Builder",
  description: "Build, scale, and save custom recipes aligned with cosmic timing.",
};

export default function RecipeBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
