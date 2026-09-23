/**
 * Styled 404 for an unknown cooking method. The page calls `notFound()`, so
 * this renders with a real HTTP 404 instead of the 200 the inline message
 * used to answer with.
 */
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";

export default function CookingMethodNotFound(): JSX.Element {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="ma-label mb-4 text-ma-error">SIGNAL_LOST // UNKNOWN_PROCEDURE</p>
      <h1 className="mb-6 font-grimoire text-4xl text-ma-fg">
        Transmutation not found
      </h1>
      <Link
        href="/cooking-methods"
        className="ma-label inline-flex items-center gap-2 rounded border border-ma-cyan/50 px-4 py-2.5 text-ma-cyan-bright transition-colors hover:bg-ma-cyan/10"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        RETURN_TO_HUB
      </Link>
    </div>
  );
}
