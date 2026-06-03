export type CheckoutPreflightSource =
  | "ingredients_storefront"
  | "grocery_drawer"
  | "recipe_detail"
  | "menu_planner"
  | "unknown";

export interface CheckoutPreflightItem {
  asin: string;
  qty?: number;
  quantity?: number;
  name?: string;
  ingredientName?: string;
  chakra?: string;
  category?: string;
  price?: string | number | null;
}

export interface CheckoutPreflightRequest {
  source?: CheckoutPreflightSource;
  items: CheckoutPreflightItem[];
  cartType?: "fresh" | "standard";
  metadata?: Record<string, unknown>;
}

export interface CheckoutPreflightResponse {
  success: boolean;
  handoffId: string;
  formAction: string;
  method: "POST";
  target: "_blank";
  itemCount: number;
  droppedCount: number;
  payload: Record<string, string>;
  items: Array<{
    asin: string;
    quantity: number;
    names: string[];
  }>;
}
