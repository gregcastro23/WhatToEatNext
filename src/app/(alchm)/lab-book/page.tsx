import LabBookIngest from "@/components/recipes/LabBookIngest";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lab Book",
  description:
    "Add recipes by pasting text or a photo — auto-extracted, alchemized (elemental + ESMS), and saved to your personal cookbook.",
};

export default function LabBookPage() {
  return (
    <div className="min-h-screen bg-[#08080e] text-white py-12">
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <p className="text-xs uppercase tracking-wider text-purple-600 font-bold">
          Alchm Kitchen · Lab
        </p>
        <h1 className="text-2xl font-semibold text-white/90">Lab Book</h1>
        <p className="mt-1 text-sm text-white/50">
          Paste a recipe or snap a photo — it&apos;s extracted, alchemized
          (elemental + ESMS), and saved to your personal cookbook.
        </p>
      </div>
      <LabBookIngest />
    </div>
  );
}
