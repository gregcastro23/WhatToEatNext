# PA Handover — Cosmic Recipe Generation Endpoint

> **For the next Claude session running in the planetary_agents project**
> Working directory: `/Users/cookingwithcastro/Desktop/planetary_agents-main`
> Sibling repo (read-only context): `/Users/cookingwithcastro/Desktop/WhatToEatNext-master`

## Background — what just shipped on the WTEN (alchm.kitchen) side

The synthetic cosmic-recipe probe has been returning **HTTP 404 every hour** for at least several days, producing a false "AI Recipe Generation INCIDENT" badge on `/admin`. Diagnosis: WTEN's `/api/generate-cosmic-recipe` was POSTing to `${PA_BASE}/api/generate-recipe`, an endpoint that **does not exist on the PA backend** at any path (verified against `https://api.agents.alchm.kitchen/openapi.json`). The original commit `0bfc353` ("offboard AI dependencies and route generation to planetary_agents") wired WTEN up to an endpoint PA never exposed.

WTEN was patched on branch `fix/schema-drift-and-production-error-cleanup` (uncommitted as of this handover) to call PA's existing `/api/chat` endpoint instead. The rewrite lives at `src/app/api/generate-cosmic-recipe/route.ts`. It works, but only because the system prompt now strong-arms the model into emitting JSON that happens to match WTEN's `cosmicRecipeSchema`. That coupling is fragile, and prompt-only JSON output is not reliable enough for a paid product surface.

## The contract WTEN is currently relying on

Today, on every cosmic recipe request, WTEN POSTs to **`https://api.agents.alchm.kitchen/api/chat`** with:

```json
{
  "agentId": "hildegard-of-bingen",
  "message": "<user's natural-language prompt, e.g. 'A nourishing weekday dinner'>",
  "systemPromptOverride": "<huge multi-paragraph alchemical-chef prompt + the cosmicRecipeSchema as a TypeScript skeleton + 'output ONE JSON object, single-line strings, be concise'>",
  "userId": "<WTEN user id when authenticated, else undefined>",
  "context": {
    "dominantElement": "Air|Fire|Water|Earth",
    "cuisine": "string|null",
    "topIngredients": ["..."],
    "birthData": { "dateTime": "...", "latitude": 0, "longitude": 0 },
    "dietPreference": "omnivore|vegan|...",
    "alchemicalState": { "Spirit": 0, "Essence": 0, "Matter": 0, "Substance": 0 },
    "thermodynamicProperties": { "heat": 0, "entropy": 0, "reactivity": 0 }
  }
}
```

WTEN then `JSON.parse(response.text)` and validates against `cosmicRecipeSchema`. Schema-validation failure → 502 to the client.

## Why this is fragile

1. **Prompt-only JSON output drifts.** During smoke testing, llama-3.3-70b-versatile (current free-tier default) emitted a response with literal newlines embedded mid-string on the first attempt; `JSON.parse` rejected it. Adding "single-line strings, be concise" to the prompt fixed *that* failure mode, but the next model update or temperature spike could break it again.
2. **WTEN is hijacking a historical-figure persona.** The chosen agent is `hildegard-of-bingen` because her specialty ("Mystical Vision Integration and Holistic Wisdom") is the closest available match. Her persona then leaks into recipe titles ("Gemini's Whispering Winds Chicken Salad" was an actual smoke-test output). For a paid product surface this is off-brand at best, off-putting at worst.
3. **Schema duplicated across repos.** The full `cosmicRecipeSchema` (≈70 lines of Zod, with 18 top-level required fields including nested objects) is hand-inlined into WTEN's system prompt as a TypeScript shape. Any schema evolution requires syncing two places.
4. **No structured-output guarantee.** PA's `ChatRequest` has no `responseSchema` / `responseFormat` / `jsonMode` parameter. Even when the underlying provider (groq / OpenAI / Anthropic) supports JSON mode, we can't reach it through the chat API.
5. **No server-side validation or retry.** A malformed response propagates all the way back to the WTEN user.

## What we want PA to build

### Primary — pick ONE of these two paths

**Option A (recommended): a first-class `/api/generate-recipe` endpoint.**

Match what WTEN was originally trying to call. Inputs match the `context` block above plus the user's natural-language prompt; outputs are a validated `CosmicRecipe` typed against the shared schema. PA owns the prompt construction, model selection, JSON-mode toggling, schema validation, and one auto-retry on malformed output. WTEN's route then becomes a thin proxy.

Suggested route signature (FastAPI):

```python
@router.post("/api/generate-recipe", response_model=CosmicRecipeResponse)
async def generate_cosmic_recipe(req: CosmicRecipeRequest) -> CosmicRecipeResponse:
    ...
```

`CosmicRecipeResponse` should be a Pydantic model mirroring the WTEN Zod schema (see "Schema reference" below). Validation failure → automatic single retry with a stricter prompt → 502 only after the second failure.

**Option B (cheaper, less clean): add structured-output to `/api/chat`.**

Extend `ChatRequest` with an optional `responseSchema: dict | None` field. When set, PA invokes the underlying provider's JSON mode (groq supports OpenAI-compatible `response_format`; Anthropic supports tool-use-style structured output) and either returns a parsed object or retries once on malformed output. WTEN can then send the cosmicRecipeSchema along with the chat request and stop relying on prompt engineering.

This is less work but leaves the duplicated-schema and persona-hijack problems in place.

### Nice-to-have (regardless of Option A vs B)

- **Add an "Alchemical Chef" persona** (`agentId: "alchemical-chef"` or similar) so WTEN can stop borrowing Hildegard. Specialty: "Alchemical Cuisine and Cosmic Nourishment." If you go with Option A, this is implicit — the route picks the persona internally.
- **Document the recommended `modelTier`** for recipe generation in `AGENTS.md`. Free-tier llama-3.3-70b produces *usable* recipes but a Sonnet or larger Llama would meaningfully improve quality. The cosmic-recipe surface debits Spirit + Essence tokens per call on WTEN so there's headroom to pay for a better model.
- **Cache recent recipe generations** by `(prompt_hash, context_hash)` for at most 60 seconds. Mostly defends against the synthetic probe burning a fresh LLM call once an hour on what is essentially the same input.

## Schema reference

The full Zod schema lives at `/Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/types/cosmicRecipeSchema.ts`. Read it directly — do not paraphrase. Key shape (all fields required unless marked optional):

```ts
{
  id: string;                                // kebab-case
  title: string;
  short_description: string;
  category: "Beverages"|"Breakfast"|"Dessert"|"Dinner"|"Lunch"|"Salad"|"Sauce"|"Side"|"Soup"|"Appetizer"|"Condiment";
  cuisine: string;
  difficulty: "beginner"|"intermediate"|"advanced";
  yields: number;
  total_time: number;                        // minutes (prep + cook)
  alignment_score: { overall, ingredients_fit, diet_fit, time_fit, astro_fit: number };  // 0-100 each
  alignment_notes: string[];
  tags: { diet, cuisine, flavor_profile, cooking_methods, elements, planets: string[]; meal_type: string };
  ingredients: { name: string; quantity: string; unit: string; household_description?: string; optional: boolean; substitutions: string[] }[];
  steps: { step_number: number; instruction: string; time_minutes: number; cooking_method: string; tips: string[] }[];
  elementalBalance: { fire, earth, water, air: number };  // sums to ~100
  nutrition: { calories, protein, carbohydrates, fat: number };
  vitamins?: string[];
  minerals?: string[];
  finishing_and_serving: { garnish_and_plating, doneness_cues, serving_suggestions: string };
  leftovers_and_storage: { can_store: boolean; storage_instructions: string; storage_lifespan_days: number };
  astro_explanation: { summary: string; correspondences: string[] };
}
```

## Verification once PA-side work lands

1. Smoke-test the new endpoint from the command line:
   ```bash
   curl -s -X POST -H "Content-Type: application/json" \
     -d '{"prompt":"weekday dinner","dietPreference":"omnivore","dominantElement":"Air"}' \
     https://api.agents.alchm.kitchen/api/generate-recipe | jq .
   ```
   Confirm a valid CosmicRecipe payload, all required fields present.

2. Update WTEN's `src/app/api/generate-cosmic-recipe/route.ts` to call the new endpoint (replace the `/api/chat` block; the input/output shapes simplify dramatically). The current commit on `fix/schema-drift-and-production-error-cleanup` is a safe rollback point.

3. Wait for the next hourly run of `/api/cron/synthetic-cosmic-recipe`. Confirm the new row in WTEN's `synthetic_probe_results` has `status='success'` and the `AI Recipe Generation` flow on `https://alchm.kitchen/admin` flips out of INCIDENT.

## Out of scope for this handover

- **Image generation.** WTEN's `/api/nanobanana/generate` has the same wrong-host fallback bug (`agents.alchm.kitchen` instead of `api.agents.alchm.kitchen`). Tracked separately on the WTEN side.
- **Token economy.** The Spirit/Essence debit happens on WTEN before the upstream call. PA does not need to know about it.
- **Auth.** PA does not need to validate the WTEN user; that's already done before the request leaves WTEN.

## Reading order for context

1. `/Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/api/generate-cosmic-recipe/route.ts` (the current WTEN-side route — see the JSON-output prompt and the chat call)
2. `/Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/types/cosmicRecipeSchema.ts` (canonical recipe shape)
3. `/Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/syntheticProbeService.ts` (the probe's success criterion — `body.success === true` at HTTP 200)
4. PA's own openapi at `https://api.agents.alchm.kitchen/openapi.json` (current endpoint inventory — note `/api/generate-recipe` is absent and `/api/chat` returns free-form `text`)
