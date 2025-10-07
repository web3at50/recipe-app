// Meal planning types
import type { Recipe } from './recipe';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealPlan {
  id: string;
  user_id: string;
  name: string | null;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  created_at: string;
  updated_at: string;
}

export interface MealPlanItem {
  id: string;
  meal_plan_id: string;
  recipe_id: string;
  date: string; // ISO date string
  meal_type: MealType;
  servings: number;
  notes: string | null;
  created_at: string;
}

export interface MealPlanItemWithRecipe extends MealPlanItem {
  recipe: Recipe;
}

export interface MealPlanWithItems extends MealPlan {
  items: MealPlanItemWithRecipe[];
}

// Form types
export interface AddMealPlanItemFormData {
  recipe_id: string;
  date: string;
  meal_type: MealType;
  servings: number;
  notes?: string;
}

// Helper types for UI
export interface DayMeals {
  date: string;
  breakfast?: MealPlanItemWithRecipe;
  lunch?: MealPlanItemWithRecipe;
  dinner?: MealPlanItemWithRecipe;
  snack?: MealPlanItemWithRecipe;
}

export interface WeekPlan {
  meal_plan: MealPlan;
  days: DayMeals[];
}
