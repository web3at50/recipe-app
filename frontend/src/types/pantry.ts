// Pantry management types

export interface CupboardItem {
  id: string;
  user_id: string;
  item: string;
  quantity: number | null;
  unit: string | null;
  added_at: string;
  updated_at: string;
}

export interface AlwaysHaveItem {
  id: string;
  user_id: string;
  item: string;
  category: string | null;
  created_at: string;
}

// Form types
export interface CupboardItemFormData {
  item: string;
  quantity?: number;
  unit?: string;
}

export interface AlwaysHaveItemFormData {
  item: string;
  category?: string;
}

// Common staples for pre-population
export const COMMON_STAPLES = [
  { item: 'Salt', category: 'basics' },
  { item: 'Black Pepper', category: 'spices' },
  { item: 'Olive Oil', category: 'oils' },
  { item: 'Butter', category: 'dairy' },
  { item: 'Eggs', category: 'dairy' },
  { item: 'Flour', category: 'baking' },
  { item: 'Sugar', category: 'baking' },
  { item: 'Garlic', category: 'produce' },
  { item: 'Onions', category: 'produce' },
  { item: 'Vegetable Oil', category: 'oils' },
  { item: 'Soy Sauce', category: 'condiments' },
  { item: 'Milk', category: 'dairy' },
  { item: 'Rice', category: 'grains' },
  { item: 'Pasta', category: 'grains' },
];
