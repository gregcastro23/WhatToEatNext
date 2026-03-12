import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { cosmicRecipeSchema } from '@/types/cosmicRecipeSchema';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      prompt, 
      ingredients_main = [], 
      disallowed_ingredients = [], 
      diet = "no-restrictions",
      birthData,
    } = body;

    let astro_context = body.astro_context || {};

    // Fetch the Astro Blueprint from the Python backend
    if (birthData && birthData.year && birthData.month) {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001";
        const res = await fetch(`${backendUrl}/api/astrological/context-blueprint`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(birthData),
        });
        if (res.ok) {
          const blueprint = await res.json();
          astro_context = {
            ...astro_context,
            ...blueprint,
          };
        }
      } catch (e) {
        console.error("Failed to fetch Python astro blueprint:", e);
      }
    }

    // Build the rigorous Alchm Kitchen prompt combined with HSCA styling
    const systemPrompt = `You are the Alchm Kitchen Cosmic Recipe Generator, an expert chef specializing in the HSCA (High Science Culinary Arts) style that blends classical cooking technique with astrology, elements, and planetary timing.
    
Your goal is to generate unique, health-conscious recipes that include an "Elemental Balance" (Earth, Water, Fire, Air) that total approximately 100 points across the categories. Maintain a sophisticated yet accessible tone in your descriptions.

## Core behavior
- Always return a complete, cookable recipe.
- Prioritize clarity, food safety, and real-world feasibility over creativity.
- Use concise, modern culinary language.
- Treat the astrological and elemental layer as a guiding theme.

## Context Provided by User:
- Diet: ${diet}
- Main Ingredients: ${ingredients_main.length > 0 ? ingredients_main.join(", ") : "Any"}
- Disallowed Ingredients: ${disallowed_ingredients.length > 0 ? disallowed_ingredients.join(", ") : "None"}
- Astro Context (Rigorous Rules from Backend): ${JSON.stringify(astro_context)}

Ensure your response conforms exactly to the required JSON schema, calculating the elemental balance and nutritional information as a functional part of the dish's identity.`;

    const result = await streamObject({
      model: openai('gpt-4o'),
      schema: cosmicRecipeSchema,
      system: systemPrompt,
      prompt: `Generate a new, original cosmic recipe based on the following request: "${prompt || 'A nourishing meal aligned with current transits.'}"`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error generating cosmic recipe:", error);
    return NextResponse.json(
      { error: "Failed to generate recipe" },
      { status: 500 }
    );
  }
}
