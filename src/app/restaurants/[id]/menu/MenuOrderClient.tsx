"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { AlchemizeMenuModal } from "@/components/RestaurantDiscovery/AlchemizeMenuModal";
import { AlchemizeOptInModal } from "@/components/RestaurantDiscovery/AlchemizeOptInModal";
import { RateDishModal } from "@/components/RestaurantDiscovery/RateDishModal";
import {
  extractIngredientsClient,
  DISH_FEATURE_CHIPS,
} from "@/data/restaurant/menuAlchemyLexicon";
import { readJson } from "@/lib/api/json";
import type { DeliverectMenu } from "@/lib/integrations/deliverect";
import {
  canAffordEsmsBasket,
  esmsRestaurantCentsPerToken,
  esmsRestaurantPaymentsEnabled,
  quoteEsmsBasket,
} from "@/lib/payments/restaurantEsms";
import type { EsmsBalanceLike } from "@/lib/payments/restaurantEsms";
import { restaurantCryptoPaymentsEnabled } from "@/lib/payments/restaurantPayments";
import type { RestaurantPaymentPreference } from "@/lib/payments/restaurantPayments";
import { EconomyBalanceResponseSchema } from "@/lib/validation/accountResponseSchemas";

interface RestaurantMenuClientProps {
  restaurant: {
    id: string;
    name: string;
    url: string;
    stripeConnectAccountId?: string;
    cuisine?: string;
    alchemizeOptIn?: boolean;
  };
  menu: DeliverectMenu;
}

interface CartItem {
  id: string;
  plu: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
}

interface MenuItemComment {
  id: string;
  restaurantId: string;
  menuItemId?: string | null | undefined;
  dishName?: string | null | undefined;
  userId: string;
  userDisplayName: string;
  comment: string;
  helpfulCount: number;
  elementalNote?: string | null | undefined;
  liked_ingredients?: string[] | null | undefined;
  likedIngredients?: string[] | null | undefined;
  dish_features?: string[] | null | undefined;
  dishFeatures?: string[] | null | undefined;
  texture_notes?: string[] | null | undefined;
  textureNotes?: string[] | null | undefined;
  elemental_resonance?: string | null | undefined;
  elementalResonance?: string | null | undefined;
  createdAt: string;
}

type ElementType = "Fire" | "Water" | "Earth" | "Air";

function classifyItemElement(name: string, description?: string): ElementType {
  const text = `${name} ${description ?? ""}`.toLowerCase();
  let fireScore = 0;
  let waterScore = 0;
  let earthScore = 0;
  let airScore = 0;

  if (
    /spic|chili|chile|jalape|habaner|pepp|roast|char|grill|bbq|curry|fried|crisp|heat|cajun|srirach|seared|ginger|garlic|smoke/.test(
      text,
    )
  ) {
    fireScore += 2;
  }
  if (
    /soup|broth|stew|ceviche|fish|salmon|tuna|seafood|shrimp|poach|steam|brais|noodle|hydrat|coconut|cucumber|lime|lemon/.test(
      text,
    )
  ) {
    waterScore += 2;
  }
  if (
    /beef|steak|pork|burger|potato|mash|pasta|rice|grain|bean|lentil|mushroom|truffle|bread|polenta|cheese|hearty|risotto/.test(
      text,
    )
  ) {
    earthScore += 2;
  }
  if (
    /salad|green|herb|mint|parsley|dill|fennel|citrus|vinaig|raw|leafy|fruit|berr|sorbet|puff|tart|crisp|light/.test(
      text,
    )
  ) {
    airScore += 2;
  }

  const max = Math.max(fireScore, waterScore, earthScore, airScore);
  if (max === 0) return "Earth";
  if (fireScore === max) return "Fire";
  if (waterScore === max) return "Water";
  if (airScore === max) return "Air";
  return "Earth";
}

const PREP_NOTE_CHIPS = [
  { id: "extra_herbs", label: "🌿 Extra fresh herbs" },
  { id: "light_oil", label: "🔥 Light oil / steam finish" },
  { id: "sauce_side", label: "💧 Sauce on side" },
  { id: "less_sodium", label: "🧂 Low sodium" },
  { id: "warm_spices", label: "✨ Warm digestive spices" },
  { id: "dairy_free", label: "🌱 Dairy-free prep" },
];

interface CheckoutResponse {
  mode?: "stripe_checkout" | "external" | "esms";
  url?: string;
  error?: string;
  code?: string;
  orderId?: string;
}

const MenuItemCommentClientSchema: z.ZodType<MenuItemComment> = z.object({
  id: z.string(),
  restaurantId: z.string().default(""),
  menuItemId: z.string().nullish(),
  dishName: z.string().nullish(),
  userId: z.string().default(""),
  userDisplayName: z.string().default("Alchemist"),
  comment: z.string(),
  helpfulCount: z.number().default(0),
  elementalNote: z.string().nullish(),
  liked_ingredients: z.array(z.string()).nullish(),
  likedIngredients: z.array(z.string()).nullish(),
  dish_features: z.array(z.string()).nullish(),
  dishFeatures: z.array(z.string()).nullish(),
  texture_notes: z.array(z.string()).nullish(),
  textureNotes: z.array(z.string()).nullish(),
  createdAt: z.string().default(() => new Date().toISOString()),
});

const CheckoutResponseSchema = z.object({
  mode: z.enum(["stripe_checkout", "external", "esms"]).optional(),
  url: z.string().optional(),
  error: z.string().optional(),
  code: z.string().optional(),
  orderId: z.string().optional(),
});
const emptyCheckoutResponse: CheckoutResponse = {};

function money(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function MenuOrderClient({
  restaurant,
  menu,
}: RestaurantMenuClientProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [ratingDish, setRatingDish] = useState<string | null>(null);
  const [isAlchemizeOpen, setIsAlchemizeOpen] = useState(false);
  const [isAlchemizeMenuModalOpen, setIsAlchemizeMenuModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] =
    useState<RestaurantPaymentPreference>("card");
  const [esmsBalances, setEsmsBalances] = useState<EsmsBalanceLike | null>(null);
  const [esmsBalanceStatus, setEsmsBalanceStatus] = useState<
    "idle" | "loading" | "ready" | "signed_out" | "error"
  >("idle");
  const checkoutIdempotencyKey = useRef<string | null>(null);

  // Kitchen Prep Notes State
  const [selectedPrepNotes, setSelectedPrepNotes] = useState<string[]>([]);
  const [customPrepNotes, setCustomPrepNotes] = useState("");

  // Item Comments State
  const [expandedCommentsItemId, setExpandedCommentsItemId] = useState<string | null>(null);
  const [itemComments, setItemComments] = useState<Record<string, MenuItemComment[]>>({});
  const [loadingCommentsItemId, setLoadingCommentsItemId] = useState<string | null>(null);
  const [submittingCommentItemId, setSubmittingCommentItemId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentElementalNote, setCommentElementalNote] = useState<string>("");
  const [commentLikedIngredients, setCommentLikedIngredients] = useState<string[]>([]);
  const [commentDishFeatures, setCommentDishFeatures] = useState<string[]>([]);
  const [customIngredientInput, setCustomIngredientInput] = useState<string>("");

  const cryptoEnabled = restaurantCryptoPaymentsEnabled();
  const esmsEnabled = esmsRestaurantPaymentsEnabled();

  const subtotalCents = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0),
    [cart],
  );
  const esmsCost = useMemo(
    () => quoteEsmsBasket(subtotalCents),
    [subtotalCents],
  );
  const canAffordEsms = Boolean(
    esmsBalances && esmsCost && canAffordEsmsBasket(esmsBalances, esmsCost),
  );

  // Live Elemental Cart Harmony
  const harmony = useMemo(() => {
    if (cart.length === 0) return null;
    const counts: Record<ElementType, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    let total = 0;

    for (const item of cart) {
      const el = classifyItemElement(item.name);
      counts[el] += item.quantity;
      total += item.quantity;
    }

    const pcts = {
      Fire: total > 0 ? Math.round((counts.Fire / total) * 100) : 0,
      Water: total > 0 ? Math.round((counts.Water / total) * 100) : 0,
      Earth: total > 0 ? Math.round((counts.Earth / total) * 100) : 0,
      Air: total > 0 ? Math.round((counts.Air / total) * 100) : 0,
    };

    const dominant = (["Fire", "Water", "Earth", "Air"] as const).reduce((a, b) =>
      pcts[a] > pcts[b] ? a : b,
    );

    const isDominant = pcts[dominant] >= 50;

    let balancingElement: ElementType = "Water";
    let recommendationMsg = "";
    if (dominant === "Fire") {
      balancingElement = "Water";
      recommendationMsg = "🔥 High Fire intensity. Balance with a cooling 💧 Water or 🌿 Earth side.";
    } else if (dominant === "Earth") {
      balancingElement = "Air";
      recommendationMsg = "🌿 Rich & grounding Earth. Lighten digestion with a fresh 💨 Air or 💧 Water dish.";
    } else if (dominant === "Water") {
      balancingElement = "Fire";
      recommendationMsg = "💧 Fluid & hydrating Water. Add digestive warmth with a 🔥 Fire or 🌿 Earth selection.";
    } else {
      balancingElement = "Earth";
      recommendationMsg = "💨 Light & uplifting Air. Anchor your meal with a grounding 🌿 Earth or 🔥 warm dish.";
    }

    return { counts, pcts, total, dominant, isDominant, balancingElement, recommendationMsg };
  }, [cart]);

  const suggestedBalancingItem = useMemo(() => {
    if (!harmony?.isDominant) return null;
    const cartItemIds = new Set(cart.map((i) => i.id));
    const allItems = menu.categories.flatMap((cat) => cat.items);
    return (
      allItems.find(
        (item) =>
          item.available &&
          !cartItemIds.has(item.id) &&
          classifyItemElement(item.name, item.description) === harmony.balancingElement,
      ) ?? null
    );
  }, [cart, harmony, menu.categories]);

  useEffect(() => {
    if (!esmsEnabled || paymentMethod !== "esms") return;

    let active = true;
    setEsmsBalanceStatus("loading");
    void fetch("/api/economy/balance")
      .then(async (response) => {
        if (response.status === 401) {
          if (active) setEsmsBalanceStatus("signed_out");
          return;
        }
        if (!response.ok) throw new Error("Could not load ESMS balance");
        const parsed = EconomyBalanceResponseSchema.safeParse(await response.json());
        if (!parsed.success) throw new Error("ESMS balance was unavailable");
        const { balances } = parsed.data;
        if (active) {
          setEsmsBalances(balances);
          setEsmsBalanceStatus("ready");
        }
      })
      .catch(() => {
        if (active) setEsmsBalanceStatus("error");
      });

    return () => {
      active = false;
    };
  }, [esmsEnabled, paymentMethod]);

  function addItem(item: DeliverectMenu["categories"][number]["items"][number]) {
    setCart((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return current.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }
      return [
        ...current,
        {
          id: item.id,
          plu: item.plu,
          name: item.name,
          quantity: 1,
          unitPriceCents: item.priceCents,
        },
      ];
    });
  }

  function removeItem(id: string) {
    setCart((current) =>
      current.flatMap((item) => {
        if (item.id !== id) return [item];
        if (item.quantity <= 1) return [];
        return [{ ...item, quantity: item.quantity - 1 }];
      }),
    );
  }

  async function toggleItemComments(itemId: string, _dishName: string) {
    if (expandedCommentsItemId === itemId) {
      setExpandedCommentsItemId(null);
      return;
    }
    setExpandedCommentsItemId(itemId);
    setCommentText("");
    setCommentElementalNote("");
    setCommentLikedIngredients([]);
    setCommentDishFeatures([]);
    setCustomIngredientInput("");

    if (!itemComments[itemId]) {
      setLoadingCommentsItemId(itemId);
      try {
        const params = new URLSearchParams({
          restaurantId: restaurant.id,
          menuItemId: itemId,
        });
        const res = await fetch(`/api/restaurants/comments?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setItemComments((prev) => ({
            ...prev,
            [itemId]: Array.isArray(data.comments) ? data.comments : [],
          }));
        }
      } catch {
        // ignore fetch error
      } finally {
        setLoadingCommentsItemId(null);
      }
    }
  }

  async function handlePostComment(itemId: string, dishName: string) {
    if (!commentText.trim()) return;
    setSubmittingCommentItemId(itemId);
    try {
      const res = await fetch("/api/restaurants/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          menuItemId: itemId,
          dishName,
          comment: commentText.trim(),
          userDisplayName: commentAuthor.trim() || undefined,
          elementalNote: commentElementalNote.trim() || undefined,
          likedIngredients:
            commentLikedIngredients.length > 0 ? commentLikedIngredients : undefined,
          dishFeatures:
            commentDishFeatures.length > 0 ? commentDishFeatures : undefined,
        }),
      });
      if (res.ok) {
        const created = await readJson(res, {
          parse: MenuItemCommentClientSchema.parse,
        });
        setItemComments((prev) => ({
          ...prev,
          [itemId]: [created, ...(prev[itemId] || [])],
        }));
        setCommentText("");
        setCommentElementalNote("");
        setCommentLikedIngredients([]);
        setCommentDishFeatures([]);
        setCustomIngredientInput("");
      }
    } catch {
      // ignore comment error
    } finally {
      setSubmittingCommentItemId(null);
    }
  }

  async function checkout() {
    if (cart.length === 0 || subtotalCents <= 0) return;

    setIsCheckingOut(true);
    setError(null);

    try {
      checkoutIdempotencyKey.current ??= crypto.randomUUID();

      const specialInstructionsParts: string[] = [];
      if (selectedPrepNotes.length > 0) {
        specialInstructionsParts.push(`[Elemental Prep: ${selectedPrepNotes.join(", ")}]`);
      }
      if (customPrepNotes.trim()) {
        specialInstructionsParts.push(customPrepNotes.trim());
      }
      const specialInstructions = specialInstructionsParts.join(" — ");

      const response = await fetch("/api/stripe/restaurant-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": checkoutIdempotencyKey.current,
        },
        body: JSON.stringify({
          cuisineType: restaurant.cuisine || "Restaurant",
          provider: "deliverect",
          restaurant: {
            id: restaurant.id,
            name: restaurant.name,
            url: restaurant.url,
            stripeConnectedAccountId: restaurant.stripeConnectAccountId,
          },
          order: {
            amountCents: subtotalCents,
            currency: "usd",
            orderType: "pickup",
            paymentMethod,
            specialInstructions: specialInstructions || undefined,
            customer: {
              name: customerName || "Guest",
              email: customerEmail || undefined,
            },
            items: cart.map((item) => ({
              id: item.id,
              plu: item.plu,
              name: item.name,
              quantity: item.quantity,
              unitPriceCents: item.unitPriceCents,
            })),
          },
        }),
      });

      const data = await readJson(response, {
        parse: CheckoutResponseSchema.parse,
      }).catch(() => emptyCheckoutResponse);
      if (data.code === "settlement_pending" && data.orderId) {
        throw new Error(
          `Order ${data.orderId} is awaiting restaurant settlement. Do not submit it again.`,
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Could not start checkout.");
      }

      if (data.mode === "esms" && data.orderId) {
        checkoutIdempotencyKey.current = null;
        const successUrl = new URL("/restaurants", window.location.origin);
        successUrl.searchParams.set("order", "success");
        successUrl.searchParams.set("restaurant", restaurant.name);
        successUrl.searchParams.set("order_id", data.orderId);
        successUrl.searchParams.set("payment", "esms");
        if (cart.length > 0 && cart[0]?.name) {
          successUrl.searchParams.set("dish", cart[0].name);
        }
        window.location.assign(successUrl.toString());
        return;
      }

      if (!data.url) throw new Error("Checkout URL was unavailable.");
      checkoutIdempotencyKey.current = null;
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Alchemize Recipes CTA Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-[#0c0c14] p-4 shadow-lg shadow-purple-950/20">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-300">
            <span aria-hidden>✨</span> Alchemize Signature Recipes
          </div>
          <p className="text-xs text-white/70 mt-1 max-w-xl leading-relaxed">
            Love this kitchen? Nominate their signature dishes to have our culinary alchemy engine craft home-cookable twin recipes, or opt in as the chef/owner.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAlchemizeMenuModalOpen(true)}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-900/20 hover:bg-purple-500/30 transition-all flex items-center gap-1.5"
          >
            <span aria-hidden>🔮</span> Menu Blueprint
          </button>
          <button
            type="button"
            onClick={() => setIsAlchemizeOpen(true)}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-900/20 hover:brightness-110 transition-all flex items-center gap-1.5"
          >
            <span aria-hidden>✨</span> Alchemize Recipes
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="space-y-8">
          {menu.categories.map((category) => (
            <div key={category.id}>
              <h2 className="mb-3 text-lg font-bold text-white">{category.name}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {category.items.map((item) => {
                  const commentsCount = itemComments[item.id]?.length;
                  const isCommentsOpen = expandedCommentsItemId === item.id;

                  return (
                    <article
                      key={item.id}
                      className="rounded-xl border border-white/10 bg-white/[0.06] p-4 transition-all hover:border-white/20"
                    >
                      <div className="flex min-h-24 flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-sm font-bold text-white">{item.name}</h3>
                            <span className="text-sm font-semibold text-amber-200">
                              {money(item.priceCents)}
                            </span>
                          </div>
                          {item.description && (
                            <p className="mt-2 text-xs leading-relaxed text-white/55">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => addItem(item)}
                            disabled={!item.available}
                            className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                          >
                            {item.available ? "Add to Cart" : "Unavailable"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void toggleItemComments(item.id, item.name)}
                            aria-expanded={isCommentsOpen}
                            className={`rounded-md border px-2.5 py-2 text-xs font-bold transition-colors ${
                              isCommentsOpen
                                ? "border-sky-400/50 bg-sky-500/20 text-sky-200"
                                : "border-white/10 bg-white/5 text-white/70 hover:border-sky-400/30 hover:text-sky-200"
                            }`}
                            title={`Community tips & comments for ${item.name}`}
                            aria-label={`Tips for ${item.name}`}
                          >
                            💬 {commentsCount ? commentsCount : "Tips"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRatingDish(item.name)}
                            className="rounded-md border border-amber-400/30 bg-amber-500/10 px-2.5 py-2 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-500/20"
                            title={`Rate & review ${item.name}`}
                            aria-label={`Rate ${item.name}`}
                          >
                            ⭐
                          </button>
                        </div>
                      </div>

                      {/* Expandable Inline Comments / Community Tips */}
                      {isCommentsOpen && (
                        <div className="mt-3 border-t border-white/10 pt-3 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-sky-200 flex items-center gap-1.5">
                              <span aria-hidden>💬</span> Community Tips ({itemComments[item.id]?.length ?? 0})
                            </span>
                            <button
                              type="button"
                              onClick={() => setExpandedCommentsItemId(null)}
                              className="text-[10px] text-white/50 hover:text-white"
                            >
                              Close ✕
                            </button>
                          </div>

                          {loadingCommentsItemId === item.id ? (
                            <div className="py-2 text-center text-xs text-white/50 animate-pulse">
                              Loading tips...
                            </div>
                          ) : (itemComments[item.id] ?? []).length > 0 ? (
                            <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {(itemComments[item.id] ?? []).map((c) => {
                                const liked = c.liked_ingredients || c.likedIngredients || [];
                                const features = c.dish_features || c.dishFeatures || [];
                                return (
                                  <li key={c.id} className="rounded-lg bg-black/40 p-2.5 text-xs border border-white/5 space-y-1.5">
                                    <div className="flex items-center justify-between gap-1 text-[10px] text-white/50">
                                      <span className="font-bold text-white/80">{c.userDisplayName || "Diner"}</span>
                                      {c.elementalNote && (
                                        <span className="rounded bg-white/10 px-1 py-0.5 text-purple-200 font-semibold">
                                          {c.elementalNote}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-white/90 leading-snug">{c.comment}</p>
                                    {liked.length > 0 && (
                                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                        <span className="text-[10px] text-emerald-300 font-bold">🌿 Liked:</span>
                                        {liked.map((ing) => (
                                          <span
                                            key={ing}
                                            className="rounded-full bg-emerald-500/15 border border-emerald-400/30 px-1.5 py-0.2 text-[9px] text-emerald-200 font-medium"
                                          >
                                            {ing}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    {features.length > 0 && (
                                      <div className="flex flex-wrap items-center gap-1">
                                        <span className="text-[10px] text-purple-300 font-bold">✨ Notes:</span>
                                        {features.map((feat) => (
                                          <span
                                            key={feat}
                                            className="rounded-full bg-purple-500/15 border border-purple-400/30 px-1.5 py-0.2 text-[9px] text-purple-200 font-medium"
                                          >
                                            {feat}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="text-[11px] text-white/40 italic">
                              No tips posted yet. Share your experience, liked ingredients, or dining hack!
                            </p>
                          )}

                          {/* Post comment form */}
                          <div className="space-y-2.5 rounded-xl bg-black/30 p-3 border border-white/10">
                            <input
                              type="text"
                              value={commentAuthor}
                              onChange={(e) => setCommentAuthor(e.target.value)}
                              placeholder="Your name or handle (optional)"
                              className="w-full rounded border border-white/10 bg-black/40 px-2.5 py-1 text-xs text-white placeholder:text-white/30 focus:border-sky-400 focus:outline-none"
                            />
                            <textarea
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              rows={2}
                              placeholder={`Tip or flavor note for ${item.name}...`}
                              className="w-full rounded border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white placeholder:text-white/30 focus:border-sky-400 focus:outline-none"
                            />

                            {/* Liked Ingredients Picker */}
                            <div className="space-y-1">
                              <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                                🌿 Ingredients you liked most
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {extractIngredientsClient(item.name, item.description).map((ing) => {
                                  const selected = commentLikedIngredients.includes(ing);
                                  return (
                                    <button
                                      key={ing}
                                      type="button"
                                      onClick={() =>
                                        setCommentLikedIngredients((prev) =>
                                          selected ? prev.filter((x) => x !== ing) : [...prev, ing],
                                        )
                                      }
                                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                                        selected
                                          ? "bg-emerald-500/25 border-emerald-400 text-emerald-200 font-bold shadow-sm shadow-emerald-950"
                                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                                      }`}
                                    >
                                      {selected ? "✓ " : "+ "}{ing}
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="flex items-center gap-1.5 pt-0.5">
                                <input
                                  type="text"
                                  value={customIngredientInput}
                                  onChange={(e) => setCustomIngredientInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && customIngredientInput.trim()) {
                                      e.preventDefault();
                                      const val = customIngredientInput.trim();
                                      if (!commentLikedIngredients.includes(val)) {
                                        setCommentLikedIngredients((prev) => [...prev, val]);
                                      }
                                      setCustomIngredientInput("");
                                    }
                                  }}
                                  placeholder="Add custom ingredient (e.g. Truffle Oil)..."
                                  className="flex-1 rounded border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] text-white placeholder:text-white/30 focus:border-emerald-400 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const val = customIngredientInput.trim();
                                    if (val && !commentLikedIngredients.includes(val)) {
                                      setCommentLikedIngredients((prev) => [...prev, val]);
                                      setCustomIngredientInput("");
                                    }
                                  }}
                                  className="rounded bg-emerald-600/30 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-bold text-emerald-200 hover:bg-emerald-600/50 transition-colors"
                                >
                                  + Add
                                </button>
                              </div>
                            </div>

                            {/* Dish Features & Textures Picker */}
                            <div className="space-y-1">
                              <span className="block text-[10px] font-bold uppercase tracking-wider text-purple-300">
                                ✨ Dish features &amp; textures
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {DISH_FEATURE_CHIPS.map((feat) => {
                                  const selected = commentDishFeatures.includes(feat);
                                  return (
                                    <button
                                      key={feat}
                                      type="button"
                                      onClick={() =>
                                        setCommentDishFeatures((prev) =>
                                          selected ? prev.filter((x) => x !== feat) : [...prev, feat],
                                        )
                                      }
                                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                                        selected
                                          ? "bg-purple-500/25 border-purple-400 text-purple-200 font-bold shadow-sm shadow-purple-950"
                                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                                      }`}
                                    >
                                      {selected ? "✓ " : ""}{feat}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
                              <select
                                value={commentElementalNote}
                                onChange={(e) => setCommentElementalNote(e.target.value)}
                                className="rounded border border-white/10 bg-black/50 px-2 py-1 text-[11px] text-white/80 focus:outline-none"
                              >
                                <option value="">Elemental feel (optional)</option>
                                <option value="🔥 High Fire / Spicy">🔥 High Fire / Spicy</option>
                                <option value="💧 Cooling / Hydrating">💧 Cooling / Hydrating</option>
                                <option value="🌿 Grounding / Hearty">🌿 Grounding / Hearty</option>
                                <option value="💨 Light / Refreshing">💨 Light / Refreshing</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => void handlePostComment(item.id, item.name)}
                                disabled={!commentText.trim() || submittingCommentItemId === item.id}
                                className="rounded bg-sky-500 hover:bg-sky-400 px-3 py-1 text-xs font-bold text-stone-950 transition-colors disabled:opacity-50"
                              >
                                {submittingCommentItemId === item.id ? "Posting..." : "Post Tip"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <aside className="h-fit rounded-xl border border-white/10 bg-white/[0.06] p-4">
          <h2 className="text-base font-bold text-white">Pickup Order</h2>
          <div className="mt-4 space-y-3">
            <input
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Name"
              className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-orange-400 focus:outline-none"
            />
            <input
              type="email"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              placeholder="Email"
              className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-orange-400 focus:outline-none"
            />
          </div>

          {/* Kitchen & Elemental Prep Notes */}
          <div className="mt-4 border-t border-white/10 pt-4">
            <span className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-2">
              ✨ Kitchen &amp; Elemental Prep Notes
            </span>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {PREP_NOTE_CHIPS.map((chip) => {
                const active = selectedPrepNotes.includes(chip.label);
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() =>
                      setSelectedPrepNotes((prev) =>
                        active
                          ? prev.filter((x) => x !== chip.label)
                          : [...prev, chip.label],
                      )
                    }
                    aria-pressed={active}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${
                      active
                        ? "bg-purple-500/25 text-purple-200 border-purple-400/50 shadow-sm shadow-purple-950/40"
                        : "bg-black/30 text-white/60 border-white/10 hover:border-white/20 hover:text-white/80"
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={customPrepNotes}
              onChange={(e) => setCustomPrepNotes(e.target.value)}
              placeholder="Custom instructions (e.g. sauce on side, extra napkins)..."
              className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:border-purple-400 focus:outline-none"
            />
          </div>

          <div className="mt-5 space-y-3">
            {cart.length === 0 ? (
              <p className="text-sm text-white/50">Add menu items to begin.</p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{item.name}</p>
                    <p className="text-xs text-white/45">
                      {item.quantity} x {money(item.unitPriceCents)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="rounded border border-white/10 px-2 py-1 text-xs text-white/70 hover:border-rose-300/40 hover:text-rose-200"
                  >
                    -
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Live Elemental Cart Harmony Bar */}
          {harmony && (
            <div className="mt-5 rounded-xl border border-white/10 bg-black/40 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-white flex items-center gap-1.5">
                  <span className="text-purple-300">✦</span> Elemental Cart Harmony
                </span>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                  {harmony.dominant} Dominant
                </span>
              </div>

              {/* Harmony multi-segment bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 flex">
                {harmony.pcts.Fire > 0 && (
                  <div
                    style={{ width: `${harmony.pcts.Fire}%` }}
                    className="bg-rose-500 transition-all duration-300"
                    title={`Fire ${harmony.pcts.Fire}%`}
                  />
                )}
                {harmony.pcts.Water > 0 && (
                  <div
                    style={{ width: `${harmony.pcts.Water}%` }}
                    className="bg-sky-400 transition-all duration-300"
                    title={`Water ${harmony.pcts.Water}%`}
                  />
                )}
                {harmony.pcts.Earth > 0 && (
                  <div
                    style={{ width: `${harmony.pcts.Earth}%` }}
                    className="bg-emerald-500 transition-all duration-300"
                    title={`Earth ${harmony.pcts.Earth}%`}
                  />
                )}
                {harmony.pcts.Air > 0 && (
                  <div
                    style={{ width: `${harmony.pcts.Air}%` }}
                    className="bg-purple-400 transition-all duration-300"
                    title={`Air ${harmony.pcts.Air}%`}
                  />
                )}
              </div>

              {/* Percentages row */}
              <div className="flex items-center justify-between text-[10px] text-white/60 font-medium pt-0.5">
                <span className="flex items-center gap-1 text-rose-300">
                  <span>🔥</span> {harmony.pcts.Fire}%
                </span>
                <span className="flex items-center gap-1 text-sky-300">
                  <span>💧</span> {harmony.pcts.Water}%
                </span>
                <span className="flex items-center gap-1 text-emerald-300">
                  <span>🌿</span> {harmony.pcts.Earth}%
                </span>
                <span className="flex items-center gap-1 text-purple-300">
                  <span>💨</span> {harmony.pcts.Air}%
                </span>
              </div>

              {/* Recommendation / balance note */}
              {harmony.isDominant ? (
                <div className="rounded-lg bg-purple-500/10 border border-purple-400/20 p-2 text-[11px] text-purple-200/90 leading-tight">
                  <p>{harmony.recommendationMsg}</p>
                  {suggestedBalancingItem && (
                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-purple-400/15 pt-2">
                      <span className="truncate text-[10px] font-semibold text-white/80">
                        Balance with: {suggestedBalancingItem.name} ({money(suggestedBalancingItem.priceCents)})
                      </span>
                      <button
                        type="button"
                        onClick={() => addItem(suggestedBalancingItem)}
                        className="shrink-0 px-2 py-1 rounded bg-purple-500 text-stone-950 font-black text-[9px] uppercase tracking-wider hover:bg-purple-400 transition-colors"
                      >
                        + Add Side
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[10px] text-emerald-300/80 font-semibold text-center italic">
                  ✨ Elemental Harmony Achieved! Balanced nourishment.
                </p>
              )}
            </div>
          )}

          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-sm font-bold text-white">
              <span>Subtotal</span>
              <span>{money(subtotalCents)}</span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                aria-pressed={paymentMethod === "card"}
                className={`rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                  paymentMethod === "card"
                    ? "border-emerald-300/60 bg-emerald-500/15 text-emerald-100"
                    : "border-white/10 bg-black/20 text-white/60 hover:border-white/25"
                }`}
              >
                <span className="block font-bold">Card</span>
                <span className="mt-0.5 block text-[10px] opacity-65">USD checkout</span>
              </button>
              {cryptoEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("crypto")}
                  aria-pressed={paymentMethod === "crypto"}
                  className={`rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                    paymentMethod === "crypto"
                      ? "border-blue-300/60 bg-blue-500/15 text-blue-100"
                      : "border-white/10 bg-black/20 text-white/60 hover:border-white/25"
                  }`}
                >
                  <span className="block font-bold">USDC</span>
                  <span className="mt-0.5 block text-[10px] opacity-65">Pay from a wallet</span>
                </button>
              )}
              {esmsEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("esms")}
                  aria-pressed={paymentMethod === "esms"}
                  className={`rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                    paymentMethod === "esms"
                      ? "border-violet-300/60 bg-violet-500/15 text-violet-100"
                      : "border-white/10 bg-black/20 text-white/60 hover:border-white/25"
                  }`}
                >
                  <span className="block font-bold">ESMS</span>
                  <span className="mt-0.5 block text-[10px] opacity-65">Four-axis balance</span>
                </button>
              )}
            </div>
            {paymentMethod === "crypto" && (
              <p className="mt-3 rounded-md border border-blue-300/20 bg-blue-500/10 p-2 text-[10px] leading-relaxed text-blue-100/75">
                Stripe presents the USD total and accepts supported stablecoins,
                including USDC on Base. The restaurant still settles in USD.
              </p>
            )}
            {paymentMethod === "esms" && esmsCost && (
              <div className="mt-3 rounded-md border border-violet-300/20 bg-violet-500/10 p-2 text-[10px] leading-relaxed text-violet-100/75">
                <p className="font-bold text-violet-100">ESMS basket</p>
                <p className="mt-1">
                  {esmsCost.spirit} Spirit / {esmsCost.essence} Essence /{" "}
                  {esmsCost.matter} Matter / {esmsCost.substance} Substance
                </p>
                {esmsBalanceStatus === "loading" && <p className="mt-1">Checking balance...</p>}
                {esmsBalanceStatus === "signed_out" && (
                  <p className="mt-1 text-amber-200">Sign in to use ESMS.</p>
                )}
                {esmsBalanceStatus === "error" && (
                  <p className="mt-1 text-rose-200">Could not load your ESMS balance.</p>
                )}
                {esmsBalanceStatus === "ready" && !canAffordEsms && (
                  <p className="mt-1 text-amber-200">One or more axes are below the required balance.</p>
                )}
                <p className="mt-2 border-t border-violet-300/15 pt-2 text-violet-100/55">
                  {esmsRestaurantCentsPerToken() > 0
                    ? `1 ESMS = ${esmsRestaurantCentsPerToken()}¢ of food value (closed-loop, not withdrawable cash). `
                    : "ESMS is closed-loop food value, not withdrawable cash. "}
                  <a href="/rewards" className="text-violet-200 underline hover:text-violet-100">
                    How ESMS redemption works
                  </a>
                </p>
              </div>
            )}
            {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
            <button
              type="button"
              onClick={() => void checkout()}
              disabled={
                cart.length === 0 ||
                isCheckingOut ||
                (paymentMethod === "esms" && !canAffordEsms)
              }
              className="mt-4 w-full rounded-md bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-sm font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCheckingOut
                ? paymentMethod === "esms"
                  ? "Settling ESMS..."
                  : "Starting Checkout..."
                : paymentMethod === "crypto"
                  ? "Pay with USDC"
                  : paymentMethod === "esms"
                    ? "Pay with ESMS"
                    : "Pay with Card"}
            </button>
          </div>
        </aside>
      </div>

      {ratingDish && (
        <RateDishModal
          restaurant={{
            id: restaurant.id,
            name: restaurant.name,
            cuisine: restaurant.cuisine,
          }}
          initialDishName={ratingDish}
          onClose={() => setRatingDish(null)}
        />
      )}

      {isAlchemizeOpen && (
        <AlchemizeOptInModal
          restaurant={{
            id: restaurant.id,
            name: restaurant.name,
            cuisine: restaurant.cuisine,
            isPartner: restaurant.alchemizeOptIn ?? true,
          }}
          onClose={() => setIsAlchemizeOpen(false)}
        />
      )}

      {isAlchemizeMenuModalOpen && (
        <AlchemizeMenuModal
          restaurant={{
            id: restaurant.id,
            name: restaurant.name,
            cuisine: restaurant.cuisine,
            websiteUrl: restaurant.url,
          }}
          onClose={() => setIsAlchemizeMenuModalOpen(false)}
        />
      )}
    </div>
  );
}
