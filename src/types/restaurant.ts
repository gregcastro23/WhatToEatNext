export type DietaryTag = 'GF' | 'V' | 'VG' | 'DF' | 'Spicy';

export type MenuCategory = 'Appetizers' | 'Mains' | 'Sides' | 'Desserts' | 'Beverages' | 'Specials';

export const MENU_CATEGORIES: MenuCategory[] = [
  'Appetizers',
  'Mains',
  'Sides',
  'Desserts',
  'Beverages',
  'Specials',
];

export const DIETARY_TAGS: Array<{ key: DietaryTag; label: string; icon: string; color: string }> = [
  { key: 'GF', label: 'Gluten-Free', icon: '🌾', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { key: 'V', label: 'Vegetarian', icon: '🥬', color: 'bg-green-100 text-green-700 border-green-200' },
  { key: 'VG', label: 'Vegan', icon: '🌱', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { key: 'DF', label: 'Dairy-Free', icon: '🥛', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'Spicy', label: 'Spicy', icon: '🌶️', color: 'bg-red-100 text-red-700 border-red-200' },
];

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category: MenuCategory;
  dietaryTags: DietaryTag[];
}

export interface SavedRestaurant {
  id: string;
  name: string;
  cuisine: string;
  location?: string;
  menuItems: MenuItem[];
  rating?: number;
  addedAt: string;
  source?: 'manual' | 'foursquare';
  externalId?: string;
  address?: string;
}

export interface FoursquarePlace {
  fsq_id: string;
  name: string;
  location: {
    formatted_address?: string;
    locality?: string;
    region?: string;
    address?: string;
  };
  categories: Array<{ name: string; icon?: { prefix: string; suffix: string } }>;
  rating?: number;
  distance?: number;
}
