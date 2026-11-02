/**
 * FindRestaurantsLink
 *
 * The "Can't cook?" link on an empty planner slot: hands the day and meal over
 * to restaurant discovery (Order It). Shown on slot hover or keyboard focus.
 * Lives in its own file to keep BoardSlot under the max-lines ratchet.
 *
 * @file src/components/menu-planner/board/FindRestaurantsLink.tsx
 */

import { Utensils } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function FindRestaurantsLink({ where }: { where: string }): React.ReactElement {
  return (
    <Link
      href="/restaurants"
      aria-label={`Find restaurants for ${where}`}
      title="Can't cook? Find nearby restaurants"
      className="absolute bottom-1.5 left-1.5 rounded-md p-1 text-on-surface-variant/70 opacity-0 transition-opacity hover:bg-purple-500/10 hover:text-purple-300 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
    >
      <Utensils className="h-3.5 w-3.5" aria-hidden />
    </Link>
  );
}
