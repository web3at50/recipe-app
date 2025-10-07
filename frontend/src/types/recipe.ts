// Recipe-related TypeScript types

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  prep_time: number | null; // minutes
  cook_time: number | null; // minutes
  servings: number;
  source: 'ai_generated' | 'manual';
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  item: string;
  quantity: number | null;
  unit: string | null;
  notes: string | null;
  order_index: number;
  created_at: string;
}

export interface RecipeInstruction {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: 'dietary' | 'meal_type' | 'other';
  created_at: string;
}

export interface RecipeWithDetails extends Recipe {
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  categories: Category[];
}

// Form types for creating/editing recipes
export interface RecipeFormData {
  name: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  servings: number;
  ingredients: {
    item: string;
    quantity?: number;
    unit?: string;
    notes?: string;
  }[];
  instructions: {
    instruction: string;
  }[];
  category_ids?: string[];
}

// API response types
export interface CreateRecipeResponse {
  recipe: Recipe;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
}

export interface RecipeListResponse {
  recipes: RecipeWithDetails[];
  total: number;
}
