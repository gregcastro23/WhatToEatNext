"use client";

/**
 * Recipe Generator Page (Deprecated)
 * Redirects to the unified Recipe Builder page.
 *
 * @file src/app/recipe-generator/page.tsx
 * @deprecated Use /recipe-builder instead. This page now redirects.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RecipeGeneratorPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/recipe-builder");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-orange-50 flex items-center justify-center">
      <div className="text-center p-8">
        <p className="text-gray-600 mb-4">
          Redirecting to the unified Recipe Builder...
        </p>
        <Link
          href="/recipe-builder"
          className="text-purple-600 hover:text-purple-800 underline"
        >
          Click here if not redirected
        </Link>
      </div>
    </div>
  );
}
