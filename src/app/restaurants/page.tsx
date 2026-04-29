import { Suspense } from "react";
import RestaurantsPageClient from "./RestaurantsPageClient";

export const metadata = {
  title: "Explore Local Restaurants — Alchm Kitchen",
  description:
    "Discover restaurants near you, ranked by cosmic alignment with the current planetary moment.",
};

export default function RestaurantsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08080e] text-white flex items-center justify-center">
          <p className="text-sm text-gray-400">Loading restaurants…</p>
        </div>
      }
    >
      <RestaurantsPageClient />
    </Suspense>
  );
}
