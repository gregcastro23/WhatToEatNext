/**
 * GET/POST /api/menu-planner
 * Returns a cosmically-aligned weekly meal plan based on current planetary positions.
 */
import { NextResponse } from "next/server";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SIGN_TO_ELEMENT: Record<string, string> = {
  aries: "Fire", leo: "Fire", sagittarius: "Fire",
  taurus: "Earth", virgo: "Earth", capricorn: "Earth",
  gemini: "Air", libra: "Air", aquarius: "Air",
  cancer: "Water", scorpio: "Water", pisces: "Water",
};

const ELEMENT_MEALS: Record<string, { breakfast: string; lunch: string; dinner: string }[]> = {
  Fire: [
    { breakfast: "Spiced turmeric scrambled eggs with harissa toast", lunch: "Lamb shawarma bowl with spicy tahini", dinner: "Sichuan dry-fried green beans with cumin lamb" },
    { breakfast: "Chili-lime avocado toast with cotija", lunch: "Tikka masala with basmati rice", dinner: "Grilled jerk chicken with mango salsa" },
    { breakfast: "Chorizo breakfast burrito", lunch: "Spicy pho with beef", dinner: "Tandoori salmon with roasted peppers" },
  ],
  Water: [
    { breakfast: "Miso soup with tofu and overnight oats", lunch: "Peruvian ceviche with leche de tigre", dinner: "Braised short ribs in red wine with daikon" },
    { breakfast: "Savory congee with soft-boiled egg", lunch: "Vietnamese pho with beef brisket", dinner: "Japanese simmered pork belly (kakuni)" },
    { breakfast: "Smoked salmon bagel with capers", lunch: "Greek fisherman's soup (kakavia)", dinner: "Korean sundubu jjigae with clams" },
  ],
  Earth: [
    { breakfast: "Sourdough with ricotta, honey, roasted figs", lunch: "French onion soup with gruyère crouton", dinner: "Slow-braised short rib ragu over pappardelle" },
    { breakfast: "Full English breakfast", lunch: "Mushroom and leek risotto", dinner: "Roast chicken with root vegetables and thyme jus" },
    { breakfast: "Turkish menemen with crusty bread", lunch: "Provençal tart with caramelized onion", dinner: "Lamb tagine with preserved lemon and olives" },
  ],
  Air: [
    { breakfast: "Acai bowl with fresh tropical fruits", lunch: "Lebanese fattoush with grilled halloumi", dinner: "Moroccan chicken bastilla" },
    { breakfast: "Matcha crepes with yuzu cream", lunch: "Californian grain bowl with roasted veg", dinner: "Spanish tortilla with roasted pepper romesco" },
    { breakfast: "Chia pudding with mango", lunch: "Fusion bánh mì with pickled veg", dinner: "Grilled branzino with chermoula and couscous" },
  ],
};

export async function GET() {
  try {
    const raw = getAccuratePlanetaryPositions(new Date());
    const elementCounts: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    Object.values(raw).forEach((pos) => {
      const sign = typeof pos.sign === "string" ? pos.sign : String(pos.sign);
      const el = SIGN_TO_ELEMENT[sign];
      if (el) elementCounts[el]++;
    });

    const sortedEl = Object.entries(elementCounts).sort(([, a], [, b]) => b - a);
    const dominant = sortedEl[0][0];
    const secondary = sortedEl[1][0];

    const domMeals = ELEMENT_MEALS[dominant];
    const secMeals = ELEMENT_MEALS[secondary];

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const plan = days.map((day, i) => {
      const meals = i % 3 === 2 ? secMeals[i % secMeals.length] : domMeals[i % domMeals.length];
      return { day, element: i % 3 === 2 ? secondary : dominant, ...meals };
    });

    return NextResponse.json({
      success: true,
      week: new Date().toISOString().split("T")[0],
      dominantElement: dominant,
      secondaryElement: secondary,
      plan,
      elementalBreakdown: elementCounts,
    });
  } catch (error) {
    console.error("[menu-planner] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate menu plan" }, { status: 500 });
  }
}

export async function POST() { return GET(); }
