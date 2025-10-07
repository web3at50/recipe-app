// Shopping list types

export type ShoppingListStatus = 'active' | 'archived';

export interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  meal_plan_id: string | null;
  status: ShoppingListStatus;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListItem {
  id: string;
  shopping_list_id: string;
  item: string;
  quantity: number | null;
  unit: string | null;
  category: string | null;
  is_checked: boolean;
  recipe_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListWithItems extends ShoppingList {
  items: ShoppingListItem[];
}

// Form types
export interface ShoppingListItemFormData {
  item: string;
  quantity?: number;
  unit?: string;
  category?: string;
}

// Category definitions for organization
export const SHOPPING_CATEGORIES = [
  'Produce',
  'Meat & Seafood',
  'Dairy',
  'Pantry',
  'Frozen',
  'Bakery',
  'Beverages',
  'Other',
] as const;

export type ShoppingCategory = typeof SHOPPING_CATEGORIES[number];

// Grouped items for display
export interface GroupedShoppingItems {
  category: string;
  items: ShoppingListItem[];
}
