/**
 * Instacart Developer Platform (IDP) API types.
 * Spec: https://docs.instacart.com/developer_platform_api/
 */

export interface InstacartLineItemMeasurement {
  quantity: string;
  unit: string;
}

export interface InstacartLineItem {
  name: string;
  line_item_measurements?: InstacartLineItemMeasurement[];
}

export interface InstacartShoppingListRequest {
  title: string;
  line_items?: InstacartLineItem[];
  ingredients?: string[];
  image_url?: string;
  link_type?: "shopping_list";
  instructions?: string[];
}

export interface InstacartShoppingListResponse {
  products_link_url: string;
}

export interface InstacartRetailer {
  retailer_key: string;
  name: string;
  retailer_logo_url: string;
}

export interface InstacartRetailersResponse {
  retailers: InstacartRetailer[];
}
