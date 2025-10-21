// Recipe-related TypeScript types (Simplified JSONB Schema)

// Ingredient stored as JSONB
export interface Ingredient {
  item: string;
  quantity?: string; // Optional & flexible: "400g", "2 large", "1 cup"
  unit?: string;
  notes?: string;
}

// Instruction stored as JSONB
export interface Instruction {
  step?: number; // Optional - can be inferred from array index
  instruction: string;
}

// Nutrition data stored as JSONB
export interface Nutrition {
  calories?: number;
  protein?: number; // grams
  carbs?: number; // grams
  fat?: number; // grams
}

// AI Model type for recipe generation
export type AIModel = 'model_1' | 'model_2' | 'model_3' | 'model_4';

// Main Recipe interface (matches database schema)
export interface Recipe {
  id: string;
  user_id: string;

  // Basic info
  name: string;
  description: string | null;
  cuisine: string | null;
  source: 'ai_generated' | 'user_created' | 'imported';
  ai_model: AIModel | null; // Which AI model generated this recipe

  // Timing
  prep_time: number | null; // minutes
  cook_time: number | null; // minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard' | null;

  // Core data as JSONB
  ingredients: Ingredient[];
  instructions: Instruction[];

  // Simple arrays (no junction tables)
  tags: string[]; // ['quick', 'vegetarian', 'batch-cooking']
  allergens: string[]; // ['dairy', 'gluten', 'nuts']

  // Nutrition as JSONB
  nutrition: Nutrition | null;

  // Additional
  cost_per_serving: number | null;
  image_url: string | null;
  image_source: 'ai' | 'upload' | null;

  // SEO fields (for public recipe pages)
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  seo_slug: string | null;
  category: string | null;
  page_views: number | null;
  published_at: string | null;

  // Status flags
  is_favorite: boolean;
  is_public: boolean;
  published: boolean;
  flagged_for_review: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Form types for creating/editing recipes
export interface RecipeFormData {
  name: string;
  description?: string;
  cuisine?: string;
  prep_time?: number;
  cook_time?: number;
  servings: number;
  difficulty?: 'easy' | 'medium' | 'hard';

  ingredients: Ingredient[];
  instructions: Instruction[];

  tags?: string[];
  allergens?: string[];

  nutrition?: Nutrition;
  cost_per_serving?: number;
  image_url?: string;
}

// API response types
export interface CreateRecipeResponse {
  recipe: Recipe;
}

export interface RecipeListResponse {
  recipes: Recipe[];
  total: number;
}

// UK Allergens (Natasha's Law - 14 major allergens)
export const UK_ALLERGENS = [
  'peanuts',
  'tree_nuts',
  'milk',
  'eggs',
  'fish',
  'shellfish',
  'soy',
  'gluten',
  'sesame',
  'celery',
  'mustard',
  'lupin',
  'sulphites',
  'molluscs'
] as const;

export type UKAllergen = typeof UK_ALLERGENS[number];

// Common tags
export const COMMON_TAGS = [
  'quick',
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'low-carb',
  'high-protein',
  'batch-cooking',
  'freezer-friendly',
  'one-pot',
  'budget-friendly',
  'kid-friendly'
] as const;

// Cuisines
export const CUISINES = [
  'British',
  'Italian',
  'Indian',
  'Chinese',
  'Mexican',
  'Thai',
  'French',
  'Greek',
  'Spanish',
  'Japanese',
  'Middle Eastern',
  'American',
  'Caribbean',
  'Other'
] as const;
