import TiltSkilletPlanner from "@/components/cooking-methods/tilt-skillet/TiltSkilletPlanner";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tilt Skillet Batch Planner · Recipe as a Circuit",
  description:
    "Plan large-batch cooking as a series circuit — each stage a reaction with its own charge, voltage, current, resistance and power.",
};

/**
 * Tilt Skillet batch planner. Lives under /cooking-methods so it inherits the
 * Molecular Alchemy theme (.ma-root + alchemy.css) from the route layout. The static
 * `tilt-skillet` segment is matched before the dynamic `[method]` segment.
 */
export default function TiltSkilletPlannerPage() {
  return <TiltSkilletPlanner />;
}
