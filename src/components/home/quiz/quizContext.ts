import { z } from "zod";
import type { QuizContext } from "./types";

/** A narrow boundary for the existing hero request; never accepts fallback telemetry. */
export const quizSkySchema = z.object({
  success: z.literal(true),
  quantities: z.object({
    Spirit: z.number().finite().nonnegative(),
    Essence: z.number().finite().nonnegative(),
    Matter: z.number().finite().nonnegative(),
    Substance: z.number().finite().nonnegative(),
  }),
  circuit: z.object({
    elementalBalance: z.object({
      Fire: z.number().finite().nonnegative(),
      Water: z.number().finite().nonnegative(),
      Earth: z.number().finite().nonnegative(),
      Air: z.number().finite().nonnegative(),
    }),
  }),
  degraded: z.object({ reasons: z.array(z.string()) }).optional(),
});

export function localQuizTime(date: Date): Pick<QuizContext, "timeOfDay" | "season"> {
  const hour = date.getHours();
  const month = date.getMonth();
  return {
    timeOfDay: hour < 6 ? "night" : hour < 12 ? "morning" : hour < 18 ? "afternoon" : hour < 22 ? "evening" : "night",
    // Calendar season defaults to the site's northern-hemisphere convention;
    // LiveHero quizContext prop can supply local season and weather.
    season: month >= 2 && month <= 4 ? "spring" : month >= 5 && month <= 7 ? "summer" : month >= 8 && month <= 10 ? "autumn" : "winter",
  };
}
