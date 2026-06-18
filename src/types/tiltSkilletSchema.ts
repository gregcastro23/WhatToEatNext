import { z } from "zod";

/**
 * Tilt Skillet large-batch plan — canonical contract, mirrored by the Planetary Agents
 * backend's Pydantic TiltSkilletPlanResponse and validated at the WTEN edge (the same
 * proxy → PA pattern as cosmicRecipeSchema). Each stage carries a `circuit_role` from the
 * recipe-as-a-circuit model (source → resistor/capacitor → load).
 */
export const tiltSkilletStageIngredientSchema = z.object({
  ingredient: z.string(),
  quantity: z.string().describe("Numeric value of the quantity, by volume for large batches"),
  unit: z.string().describe("e.g., cup, qt, l, tbsp, g"),
});

export const tiltSkilletStageSchema = z.object({
  step_number: z.number(),
  name: z.string(),
  instruction: z.string(),
  add_to_skillet: z.array(tiltSkilletStageIngredientSchema),
  skillet_position: z.string().describe("e.g., 'tilt forward to pool oil', 'level for the braise'"),
  tilt_angle_degrees: z.number().min(0).max(45),
  temperature_f: z.number(),
  time_minutes: z.number(),
  technique: z.string(),
  circuit_role: z.enum(["source", "resistor", "capacitor", "load"]),
  reaction_note: z.string().describe("Explains the stage through its circuit reading"),
  sensory_cues: z.array(z.string()),
});

export const tiltSkilletCircuitSummarySchema = z.object({
  total_voltage: z.number(),
  total_current: z.number(),
  total_resistance: z.number(),
  total_power: z.number(),
  efficiency: z.number(),
  kalchm: z.number(),
  monica: z.number(),
  narrative: z.string(),
});

export const tiltSkilletBatchSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  cuisine: z.string(),
  batch_yield: z.string().describe("e.g., '20 servings' or '6 quarts'"),
  total_time: z.number().describe("Total time in minutes"),
  equipment_notes: z.string(),
  stages: z.array(tiltSkilletStageSchema).min(1),
  elementalBalance: z.object({
    fire: z.number().min(0).max(100),
    earth: z.number().min(0).max(100),
    water: z.number().min(0).max(100),
    air: z.number().min(0).max(100),
  }),
  circuit_summary: tiltSkilletCircuitSummarySchema,
  alignment_notes: z.array(z.string()),
  finishing_and_serving: z.object({
    garnish_and_plating: z.string(),
    doneness_cues: z.string(),
    serving_suggestions: z.string(),
  }),
  leftovers_and_storage: z.object({
    can_store: z.boolean(),
    storage_instructions: z.string(),
    storage_lifespan_days: z.number(),
  }),
});

export type TiltSkilletBatchPlan = z.infer<typeof tiltSkilletBatchSchema>;
export type TiltSkilletStage = z.infer<typeof tiltSkilletStageSchema>;

/** Inbound body the WTEN proxy route accepts from the planner client. */
export const tiltSkilletBodySchema = z.object({
  prompt: z.string().trim().max(2000).optional(),
  batchServings: z.number().int().min(1).max(500).optional(),
  cuisine: z.string().trim().max(80).optional(),
  diet: z.string().trim().max(200).optional(),
  disallowed_ingredients: z.array(z.string().max(80)).max(40).optional(),
  stages: z
    .array(
      z.object({
        name: z.string().max(120).optional(),
        ingredients: z
          .array(
            z.object({
              name: z.string().max(120),
              amount: z.number().positive(),
              unit: z.string().max(40),
            }),
          )
          .max(40),
      }),
    )
    .min(1)
    .max(12),
});

export type TiltSkilletBody = z.infer<typeof tiltSkilletBodySchema>;
